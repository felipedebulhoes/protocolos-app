import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";
import { UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG, PATIENT_UNAUTHED_ERR_MSG, NOT_OWNER_ERR_MSG, isOwnerOpenId } from "@shared/const";
import { env } from "./env";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }
  return next({ ctx });
});

// Restricts access to the project owner (the physician). Even other
// authenticated Manus users cannot reach owner-only data.
export const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!isOwnerOpenId(ctx.user.openId, env.OWNER_OPEN_ID)) {
    throw new TRPCError({ code: "FORBIDDEN", message: NOT_OWNER_ERR_MSG });
  }
  return next({ ctx });
});

export const patientProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.patient) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: PATIENT_UNAUTHED_ERR_MSG });
  }
  return next({ ctx: { ...ctx, patient: ctx.patient } });
});
