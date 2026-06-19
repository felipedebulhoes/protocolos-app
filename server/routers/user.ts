import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { isOwnerOpenId } from "@shared/const";
import { env } from "../_core/env";
import {
  getUserByOpenId,
  updateUserProfile,
  getDashboardStats,
  getRecentFichas,
} from "../db";

// Only the owner/admin can manage their own profile
const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  const isOwner =
    isOwnerOpenId(ctx.user.openId, env.OWNER_OPEN_ID) || ctx.user.role === "admin";
  if (!isOwner) {
    throw new Error("Acesso restrito ao administrador");
  }
  return next({ ctx });
});

export const userRouter = router({
  // Get current doctor profile
  getProfile: ownerProcedure.query(async ({ ctx }) => {
    const user = await getUserByOpenId(ctx.user.openId);
    return user ?? null;
  }),

  // Update doctor profile
  updateProfile: ownerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        phone: z.string().max(40).nullable().optional(),
        crm: z.string().max(50).nullable().optional(),
        specialization: z.string().max(255).nullable().optional(),
        location: z.string().max(255).nullable().optional(),
        bio: z.string().max(2000).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updated = await updateUserProfile(ctx.user.openId, input);
      return updated ?? null;
    }),

  // Dashboard stats
  dashboardStats: ownerProcedure.query(async () => {
    return getDashboardStats();
  }),

  // Recent fichas for dashboard
  recentFichas: ownerProcedure.query(async () => {
    return getRecentFichas(5);
  }),
});
