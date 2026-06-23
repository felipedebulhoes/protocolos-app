import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, ownerProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { teamMembers, users, passwordResetTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendSetupLinkEmail } from "../_core/email";
import { canDeleteUser } from "../../shared/userManagement";

function genInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export const teamRouter = router({
  // List all team members (active and pending)
  list: ownerProcedure.query(async ({ ctx }) => {
    const members = await db.db
      .select()
      .from(teamMembers)
      .orderBy(teamMembers.createdAt);
    return members.filter(m => m.status !== "inactive");
  }),

  // Invite a new team member
  invite: ownerProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        email: String(obj.email || ""),
        fullName: String(obj.fullName || ""),
        role: String(obj.role || "viewer") as "viewer" | "editor" | "admin",
      };
    })
    .mutation(async ({ input }) => {
      if (!input.email || !input.fullName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email and fullName are required",
        });
      }

      // Check if member already exists
      const existing = await db.db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.email, input.email));

      if (existing.length > 0 && existing[0].status !== "inactive") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This email is already invited",
        });
      }

      const token = genInvitationToken();

      await db.db.insert(teamMembers).values({
        invitationToken: token,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        status: "pending",
      });

      const inviteUrl = `https://protocolos.felipebulhoes.com/team/join?token=${token}`;

      return {
        email: input.email,
        inviteUrl,
        token,
      };
    }),

  // Remove a team member
  remove: ownerProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        memberId: Number(obj.memberId || 0),
      };
    })
    .mutation(async ({ input }) => {
      if (!input.memberId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "memberId is required",
        });
      }

      await db.db
        .update(teamMembers)
        .set({ status: "inactive" })
        .where(eq(teamMembers.id, input.memberId));

      return { ok: true };
    }),

  /**
   * Accept a team invite (public — no auth required).
   *
   * What this does:
   * 1. Validates the token.
   * 2. Finds or creates a `users` row for the invited email with the correct role.
   * 3. Issues a one-time `setupToken` so the frontend can redirect to a
   *    password-setup page where the new member sets their initial password.
   */
  acceptInvite: publicProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        token: String(obj.token || ""),
      };
    })
    .mutation(async ({ input }: { input: { token: string } }) => {
      if (!input.token) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token is required",
        });
      }

      const member = await db.db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.invitationToken, input.token))
        .limit(1);

      if (!member || member.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite inválido ou expirado",
        });
      }

      const memberRecord = member[0];
      if (memberRecord.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite já foi aceito",
        });
      }

      // Map team role to users.role
      const usersRole: "admin" | "user" =
        memberRecord.role === "admin" ? "admin" : "user";

      // Generate a one-time setup token so the user can set their password
      const setupToken = randomBytes(32).toString("base64url");

      // Find or create the user in the `users` table
      const existingUsers = await db.db
        .select()
        .from(users)
        .where(eq(users.email, memberRecord.email))
        .limit(1);

      if (existingUsers.length > 0) {
        // Update existing user's role and setupToken
        await db.db
          .update(users)
          .set({ role: usersRole, setupToken })
          .where(eq(users.id, existingUsers[0].id));
      } else {
        // Create a new user record with a synthetic openId
        const syntheticOpenId = `local:${randomBytes(16).toString("hex")}`;
        await db.db.insert(users).values({
          openId: syntheticOpenId,
          name: memberRecord.fullName,
          email: memberRecord.email,
          role: usersRole,
          setupToken,
          loginMethod: "email",
        });
      }

      // Mark the invite as accepted
      await db.db
        .update(teamMembers)
        .set({ status: "active", invitationToken: "" })
        .where(eq(teamMembers.id, memberRecord.id));

      return {
        id: memberRecord.id,
        fullName: memberRecord.fullName,
        email: memberRecord.email,
        role: memberRecord.role,
        setupToken,
      };
    }),

  // Update team member role
  updateRole: ownerProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return {
        memberId: Number(obj.memberId || 0),
        role: String(obj.role || "viewer") as "viewer" | "editor" | "admin",
      };
    })
    .mutation(async ({ input }) => {
      if (!input.memberId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "memberId is required",
        });
      }

      // Update team_members role
      await db.db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId));

      // Also sync users.role
      const member = await db.db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.id, input.memberId))
        .limit(1);

      if (member[0]) {
        const usersRole: "admin" | "user" = input.role === "admin" ? "admin" : "user";
        await db.db
          .update(users)
          .set({ role: usersRole })
          .where(eq(users.email, member[0].email));
      }

      return { ok: true };
    }),

  /**
   * List ALL users (not only admins) with password/setup status.
   * Owner/admin only.
   */
  listAllUsers: ownerProcedure.query(async () => {
    const rows = await db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        loginMethod: users.loginMethod,
        passwordHash: users.passwordHash,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users);

    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      loginMethod: u.loginMethod,
      hasPassword: !!u.passwordHash,
      createdAt: u.createdAt,
      lastSignedIn: u.lastSignedIn,
    }));
  }),

  /**
   * Generate a password-setup token for an existing user and email them a
   * link to create their password. Owner/admin only.
   */
  sendSetupLink: ownerProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return { userId: Number(obj.userId || 0) };
    })
    .mutation(async ({ input }) => {
      if (!input.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "userId is required" });
      }

      const target = await db.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!target[0] || !target[0].email) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      // Generate a setup token valid for 7 days, stored in password_reset_tokens
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.db.insert(passwordResetTokens).values({
        userId: target[0].id,
        token,
        expiresAt,
      });

      const setupUrl = `https://protocolos.felipebulhoes.com/criar-senha?token=${token}`;
      const emailResult = await sendSetupLinkEmail(
        target[0].email,
        setupUrl,
        target[0].name,
      );

      return {
        ok: true,
        emailSent: emailResult.success,
        email: target[0].email,
      };
    }),

  /**
   * Permanently delete a user from the `users` table and deactivate any
   * matching team member. Owner/admin only. Cannot delete yourself or the
   * last admin.
   */
  deleteUser: ownerProcedure
    .input((val: unknown) => {
      if (typeof val !== "object" || val === null) throw new Error("Invalid input");
      const obj = val as Record<string, unknown>;
      return { userId: Number(obj.userId || 0) };
    })
    .mutation(async ({ ctx, input }) => {
      if (!input.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "userId is required" });
      }

      const target = await db.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!target[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      // Count admins only when needed to validate the last-admin rule
      let totalAdmins = Number.MAX_SAFE_INTEGER;
      if (target[0].role === "admin") {
        const admins = await db.db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.role, "admin"));
        totalAdmins = admins.length;
      }

      const check = canDeleteUser({
        actorId: ctx.user.id,
        targetId: input.userId,
        targetRole: target[0].role === "admin" ? "admin" : "user",
        totalAdmins,
      });
      if (!check.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: check.reason });
      }

      // Deactivate matching team member(s) by email
      if (target[0].email) {
        await db.db
          .update(teamMembers)
          .set({ status: "inactive" })
          .where(eq(teamMembers.email, target[0].email));
      }

      // Remove any pending reset tokens for this user
      await db.db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, input.userId));

      // Delete the user
      await db.db.delete(users).where(eq(users.id, input.userId));

      return { ok: true };
    }),
});
