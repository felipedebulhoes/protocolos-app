import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM, listLLMModels } from "./_core/llm";

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./_core/storageProxy";
import { authRouter, systemRouter } from "./_core/systemRouter";
import { intakeRouter } from "./routers/intake";
import { examsRouter } from "./routers/exams";
import { patientAuthRouter } from "./routers/patientAuth";
import { userRouter } from "./routers/user";
import { totpRouter } from "./routers/totp";
import { teamRouter } from "./routers/team";
import { doctorAuthRouter } from "./routers/doctorAuth";
import { verificationRouter } from "./routers/verification";

export const appRouter = router({
  auth: authRouter,
  system: systemRouter,
  intake: intakeRouter,
  exams: examsRouter,
  patientAuth: patientAuthRouter,
  doctorAuth: doctorAuthRouter,
  user: userRouter,
  totp: totpRouter,
  team: teamRouter,
  verification: verificationRouter,
  llm: router({
    invoke: publicProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        return invokeLLM(input);
      }),
    listModels: publicProcedure
      .query(async () => {
        return listLLMModels();
      }),
  }),

  image: router({
    generate: publicProcedure
      .input(z.any())
      .mutation(async ({ input }) => {
        return generateImage(input);
      }),
  }),
  storage: router({
    put: publicProcedure
      .input(z.object({
        key: z.string(),
        data: z.string(), // Base64 encoded string
        contentType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        return storagePut(input.key, buffer, input.contentType);
      }),
  }),
});

export type AppRouter = typeof appRouter;
