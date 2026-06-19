import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, ownerProcedure } from "../_core/trpc";
import * as db from "../db";
import { teamMembers } from "../../drizzle/schema";
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

      await db.db
        .update(teamMembers)
        .set({ role: input.role })
        .where(eq(teamMembers.id, input.memberId));

      return { ok: true };
    }),
});
