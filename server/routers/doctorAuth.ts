import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { db } from "../_core/dbClient";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "@shared/const";
import { signSession } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { serialize } from "cookie";

const BCRYPT_ROUNDS = 12;

export const doctorAuthRouter = router({
  /**
   * Email + password login for doctors / invited team members.
   * Sets the same session cookie as Manus OAuth.
   */
  emailLogin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Look up user by email
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      const user = rows[0];

      if (!user || !user.passwordHash) {
        // Deliberate constant-time-ish delay to prevent user enumeration
        await bcrypt.compare("dummy", "$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const token = await signSession({
        openId: user.openId,
        name: user.name ?? "",
        email: user.email ?? undefined,
        avatar: user.avatar ?? undefined,
      });

      ctx.res.setHeader(
        "Set-Cookie",
        serialize(COOKIE_NAME, token, getSessionCookieOptions()),
      );

      return { success: true, name: user.name ?? "" };
    }),

  /**
   * Set password using a one-time setup token (issued after accepting a team invite).
   * On success the user is logged in immediately.
   */
  setupPassword: publicProcedure
    .input(
      z.object({
        setupToken: z.string().min(1),
        password: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.setupToken, input.setupToken))
        .limit(1);

      const user = rows[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token inválido ou expirado",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

      await db
        .update(users)
        .set({ passwordHash, setupToken: null })
        .where(eq(users.id, user.id));

      const token = await signSession({
        openId: user.openId,
        name: user.name ?? "",
        email: user.email ?? undefined,
        avatar: user.avatar ?? undefined,
      });

      ctx.res.setHeader(
        "Set-Cookie",
        serialize(COOKIE_NAME, token, getSessionCookieOptions()),
      );

      return { success: true, name: user.name ?? "" };
    }),

  /**
   * Allow the currently logged-in doctor to set/change their password.
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      const user = rows[0];
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // If user already has a password, require current password for verification
      if (user.passwordHash && input.currentPassword) {
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }
      }

      const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, user.id));

      return { success: true };
    }),

  /**
   * Check whether this account has a password set (so the UI can show "change password" vs "set password").
   */
  hasPassword: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    return { hasPassword: !!rows[0]?.passwordHash };
  }),
});
