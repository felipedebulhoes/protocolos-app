import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc";
import { COOKIE_NAME, isOwnerOpenId } from "@shared/const";
import { getClearCookieOptions } from "./cookies";
import { serialize } from "cookie";
import { notifyOwner } from "./notification";
import { env } from "./env";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    const isOwner = isOwnerOpenId(ctx.user.openId, env.OWNER_OPEN_ID);
    return { ...ctx.user, isOwner };
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", serialize(COOKIE_NAME, "", getClearCookieOptions()));
    return { success: true };
  }),
  debugOpenId: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return { openId: null, message: "Not logged in" };
    return {
      openId: ctx.user.openId,
      name: ctx.user.name,
      email: ctx.user.email,
      expectedOwnerId: env.OWNER_OPEN_ID,
      isOwner: isOwnerOpenId(ctx.user.openId, env.OWNER_OPEN_ID),
    };
  }),
});

export const systemRouter = router({
  notifyOwner: protectedProcedure
    .input(z.object({ title: z.string(), content: z.string() }))
    .mutation(async ({ input }) => {
      const ok = await notifyOwner(input);
      return { success: ok };
    }),
});
