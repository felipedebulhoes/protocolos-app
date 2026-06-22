import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, ownerProcedure, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { teamMembers, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
});
