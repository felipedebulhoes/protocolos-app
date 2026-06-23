import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { serialize } from "cookie";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions, getClearCookieOptions } from "../_core/cookies";
import { signSession } from "../_core/sdk";
import { hashPassword, verifyPassword } from "../patientAuth";
import { checkRateLimit, clientIp } from "../_core/rateLimit";
import { db, logAdminAction } from "../db";
import { users, passwordResetTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "../_core/email";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(100);

const LOGIN_MAX_ATTEMPTS_PER_EMAIL = 5;
const LOGIN_MAX_ATTEMPTS_PER_IP = 15;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min
const REGISTER_MAX_ATTEMPTS_PER_EMAIL = 3;
const REGISTER_MAX_ATTEMPTS_PER_IP = 10;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const GENERIC_RATE_LIMIT_MSG = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

/**
 * Create or update a doctor user with local auth (email/password).
 * This function is only for the owner to register new admins.
 */
async function createOrUpdateDoctorUser(args: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}): Promise<typeof users.$inferSelect> {
  const email = args.email.toLowerCase().trim();
  const hash = await hashPassword(args.password);

  // Check if user already exists by email
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    // Update password and role
    await db
      .update(users)
      .set({
        passwordHash: hash,
        name: args.name,
        role: args.role,
        loginMethod: "local",
      })
      .where(eq(users.id, existing[0].id));

    const updated = await db
      .select()
      .from(users)
      .where(eq(users.id, existing[0].id))
      .limit(1);
    return updated[0]!;
  }

  // Create new user
  // Generate a fake openId for compatibility with existing code
  const fakeOpenId = `local_${email}_${Date.now()}`;

  await db.insert(users).values({
    email,
    passwordHash: hash,
    name: args.name,
    openId: fakeOpenId,
    role: args.role,
    loginMethod: "local",
  });

  const created = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return created[0]!;
}

export const doctorAuthRouter = router({
  /**
   * Register a new doctor admin (owner-only endpoint).
   * The owner can invite other admins by registering them with email/password.
   */
  registerAdmin: protectedProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordSchema,
        name: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can register new admins
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem registrar novos admins.",
        });
      }

      // Rate limiting
      const ip = clientIp(ctx.req);
      if (
        !checkRateLimit(`register:ip:${ip}`, REGISTER_MAX_ATTEMPTS_PER_IP, REGISTER_WINDOW_MS) ||
        !checkRateLimit(`register:email:${input.email}`, REGISTER_MAX_ATTEMPTS_PER_EMAIL, REGISTER_WINDOW_MS)
      ) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: GENERIC_RATE_LIMIT_MSG });
      }

      const user = await createOrUpdateDoctorUser({
        email: input.email,
        password: input.password,
        name: input.name,
        role: "admin",
      });

      return {
        ok: true,
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    }),

  /**
   * Local login with email/password.
   * Returns a session cookie if credentials are valid.
   */
  login: publicProcedure
    .input(z.object({ email: emailSchema, password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting
      const ip = clientIp(ctx.req);
      if (
        !checkRateLimit(`login:ip:${ip}`, LOGIN_MAX_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS) ||
        !checkRateLimit(`login:email:${input.email}`, LOGIN_MAX_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS)
      ) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: GENERIC_RATE_LIMIT_MSG });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase().trim()))
        .limit(1);

      if (!user[0]) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "E-mail ou senha inválidos.",
        });
      }

      const passwordValid = await verifyPassword(input.password, user[0].passwordHash);
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "E-mail ou senha inválidos.",
        });
      }

      // Generate session token
      const token = await signSession({
        openId: user[0].openId ?? `local_${user[0].email}_${user[0].id}`,
        name: user[0].name ?? "",
        email: user[0].email ?? undefined,
        avatar: user[0].avatar ?? undefined,
      });

      ctx.res.setHeader("Set-Cookie", serialize(COOKIE_NAME, token, getSessionCookieOptions()));

      // Log successful login
      await logAdminAction({
        adminId: user[0].id,
        action: "login",
        targetEmail: user[0].email,
        ipAddress: clientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"] as string | undefined,
        details: JSON.stringify({ method: "local" }),
      });

      return {
        ok: true,
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
        },
      };
    }),

  /**
   * Get current doctor user info (same as auth.me but with more details).
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
      avatar: ctx.user.avatar,
      loginMethod: "manus", // TODO: fetch from DB
      totpEnabled: ctx.user.totpEnabled === 1,
    };
  }),

  /**
   * Logout (clear session cookie).
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", serialize(COOKIE_NAME, "", getClearCookieOptions()));
    return { success: true };
  }),

  /**
   * Request password reset by email.
   * Generates a reset token and sends it via email (TODO: implement email sending).
   */
  forgotPassword: publicProcedure
    .input(z.object({ email: emailSchema }))
    .mutation(async ({ ctx, input }) => {
      // Rate limiting
      const ip = clientIp(ctx.req);
      if (!checkRateLimit(`forgot:ip:${ip}`, 5, 60 * 60 * 1000)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: GENERIC_RATE_LIMIT_MSG });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email.toLowerCase().trim()))
        .limit(1);

      // Always return success for security (don't reveal if email exists)
      if (!user[0]) {
        return {
          ok: true,
          message: "Se o e-mail estiver registrado, você receberá um link de reset.",
        };
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user[0].id,
        token: resetToken,
        expiresAt,
      });

      // Send email with reset link
      const protocol = ctx.req.headers["x-forwarded-proto"] || "https";
      const host = ctx.req.headers["x-forwarded-host"] || ctx.req.headers["host"] || "localhost:3000";
      const resetUrl = `${protocol}://${host}/reset-senha?token=${resetToken}`;
      
      // Type assertion needed because user[0].name is string | null but function accepts string | null
      const userEmail = user[0].email || "";
      await sendPasswordResetEmail(userEmail, resetUrl, (user[0].name || undefined) as string | undefined);

      return {
        ok: true,
        message: "Se o e-mail estiver registrado, você receberá um link de reset.",
      };
    }),

  /**
   * Reset password using a valid reset token.
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ input }) => {
      // Find valid reset token
      const resetTokens = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, input.token))
        .limit(1);

      const resetToken = resetTokens[0];
      if (!resetToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token de reset inválido ou expirado.",
        });
      }

      // Check if token is expired
      if (resetToken.expiresAt < new Date()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token de reset expirado.",
        });
      }

      // Check if token was already used
      if (resetToken.usedAt) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Este token de reset já foi utilizado.",
        });
      }

      // Hash new password
      const hash = await hashPassword(input.newPassword);

      // Update user password
      await db
        .update(users)
        .set({ passwordHash: hash })
        .where(eq(users.id, resetToken.userId));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, resetToken.id));

      return {
        ok: true,
        message: "Senha redefinida com sucesso! Faça login com sua nova senha.",
      };
    }),

  /**
   * List all admin users (admin-only).
   */
  listAdmins: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem listar admins.",
      });
    }

    const admins = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        loginMethod: users.loginMethod,
      })
      .from(users)
      .where(eq(users.role, "admin"));

    return admins;
  }),

  /**
   * Update admin role (admin-only).
   */
  updateAdminRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        newRole: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar roles.",
        });
      }

      // Prevent demoting yourself
      if (input.userId === ctx.user.id && input.newRole !== "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode se remover como administrador.",
        });
      }

      await db
        .update(users)
        .set({ role: input.newRole })
        .where(eq(users.id, input.userId));

      return { ok: true, message: "Role atualizado com sucesso." };
    }),

  /**
   * Delete admin user (admin-only).
   * Prevents deleting the last admin.
   */
  deleteAdmin: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar admins.",
        });
      }

      // Prevent deleting yourself
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Você não pode deletar sua própria conta.",
        });
      }

      // Check if there's at least one other admin
      const adminCount = await db
        .select({ count: users.id })
        .from(users)
        .where(eq(users.role, "admin"));

      if (adminCount.length === 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não é possível deletar o último administrador.",
        });
      }

      // Delete the user
      await db.delete(users).where(eq(users.id, input.userId));

      return { ok: true, message: "Admin deletado com sucesso." };
    }),

  /**
   * Enable 2FA (TOTP) for the current user.
   * Generates a secret and returns QR code for scanning.
   */
  enable2FA: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const speakeasy = await import("speakeasy");
    const QRCode = await import("qrcode");

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `ProtoUro (${ctx.user.email})`,
      issuer: "ProtoUro",
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
      backupCodes: Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      ),
    };
  }),

  /**
   * Verify and confirm 2FA setup.
   * User must provide a valid TOTP code from their authenticator app.
   */
  verify2FA: protectedProcedure
    .input(
      z.object({
        secret: z.string(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const speakeasy = await import("speakeasy");

      // Verify the code
      const isValid = speakeasy.totp.verify({
        secret: input.secret,
        encoding: "base32",
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Código TOTP inválido. Tente novamente.",
        });
      }

      // Update user with TOTP secret
      await db
        .update(users)
        .set({
          totpSecret: input.secret,
          totpEnabled: 1,
        })
        .where(eq(users.id, ctx.user.id));

      // Log 2FA activation
      await logAdminAction({
        adminId: ctx.user.id,
        action: "update_user_role", // Using as generic "update" action
        targetUserId: ctx.user.id,
        targetEmail: ctx.user.email,
        ipAddress: clientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"] as string | undefined,
        details: JSON.stringify({ action: "2fa_enabled" }),
      });

      return {
        ok: true,
        message: "2FA ativado com sucesso!",
      };
    }),

  /**
   * Disable 2FA for the current user.
   * Requires the current password for security.
   */
  disable2FA: protectedProcedure
    .input(
      z.object({
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verify password
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user[0] || !user[0].passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário não encontrado ou sem senha local.",
        });
      }

      const passwordValid = await verifyPassword(input.password, user[0].passwordHash);
      if (!passwordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha incorreta.",
        });
      }

      // Disable 2FA
      await db
        .update(users)
        .set({
          totpSecret: null,
          totpEnabled: 0,
        })
        .where(eq(users.id, ctx.user.id));

      // Log 2FA deactivation
      await logAdminAction({
        adminId: ctx.user.id,
        action: "update_user_role",
        targetUserId: ctx.user.id,
        targetEmail: ctx.user.email,
        ipAddress: clientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"] as string | undefined,
        details: JSON.stringify({ action: "2fa_disabled" }),
      });

      return {
        ok: true,
        message: "2FA desativado com sucesso.",
      };
    }),

  /**
   * Verify TOTP code during login.
   * Called after successful email/password authentication.
   */
  verifyTOTPLogin: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        code: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user[0] || !user[0].totpSecret || !user[0].totpEnabled) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "2FA não está ativado para este usuário.",
        });
      }

      const speakeasy = await import("speakeasy");

      const isValid = speakeasy.totp.verify({
        secret: user[0].totpSecret,
        encoding: "base32",
        token: input.code,
        window: 2,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Código TOTP inválido.",
        });
      }

      // Generate session token
      const token = await signSession({
        openId: user[0].openId ?? `local_${user[0].email}_${user[0].id}`,
        name: user[0].name ?? "",
        email: user[0].email ?? undefined,
        avatar: user[0].avatar ?? undefined,
      });

      ctx.res.setHeader("Set-Cookie", serialize(COOKIE_NAME, token, getSessionCookieOptions()));

      // Log successful login
      await logAdminAction({
        adminId: user[0].id,
        action: "login",
        targetEmail: user[0].email,
        ipAddress: clientIp(ctx.req),
        userAgent: ctx.req.headers["user-agent"] as string | undefined,
        details: JSON.stringify({ method: "local", totp: true }),
      });

      return {
        ok: true,
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
        },
      };
    }),
});
