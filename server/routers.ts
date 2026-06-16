import { router } from "./_core/trpc";
import { authRouter, systemRouter } from "./_core/systemRouter";

export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
