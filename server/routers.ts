import { router } from "./_core/trpc";
import { authRouter, systemRouter } from "./_core/systemRouter";
import { intakeRouter } from "./routers/intake";
import { examsRouter } from "./routers/exams";
import { patientAuthRouter } from "./routers/patientAuth";

export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  intake: intakeRouter,
  exams: examsRouter,
  patientAuth: patientAuthRouter,
});

export type AppRouter = typeof appRouter;
