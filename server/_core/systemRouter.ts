import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./trpc";
import { COOKIE_NAME } from "@shared/const";
import { getClearCookieOptions } from "./cookies";
import { serialize } from "cookie";
import { notifyOwner } from "./notification";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", serialize(COOKIE_NAME, "", getClearCookieOptions()));
    return { success: true };
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
