import { router } from "./_core/trpc";
import { authRouter, systemRouter } from "./_core/systemRouter";
import { intakeRouter } from "./routers/intake";
import { examsRouter } from "./routers/exams";
import { patientAuthRouter } from "./routers/patientAuth";
import { userRouter } from "./routers/user";
import { totpRouter } from "./routers/totp";

export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  intake: intakeRouter,
  exams: examsRouter,
  patientAuth: patientAuthRouter,
  user: userRouter,
  totp: totpRouter,
});

export type AppRouter = typeof appRouter;
