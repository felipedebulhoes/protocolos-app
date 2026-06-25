import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM, listLLMModels } from "./_core/llm";

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./_core/storageProxy";
import protocolsData from "../client/src/data/protocols.json";
import { TRPCError } from "@trpc/server";
import { spawn } from "child_process"; // Corrected import for spawn
import { authRouter, systemRouter } from "./_core/systemRouter";
import { intakeRouter } from "./routers/intake";
import { examsRouter } from "./routers/exams";
import { patientAuthRouter } from "./routers/patientAuth";
import { userRouter } from "./routers/user";
import { totpRouter } from "./routers/totp";
import { teamRouter } from "./routers/team";
import { doctorAuthRouter } from "./routers/doctorAuth";

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
  pdf: router({
    generateProtocolPdf: publicProcedure
      .input(z.object({ protocolId: z.string() }))
      .mutation(async ({ input }) => {
        const protocol = protocolsData.find(p => p.id === input.protocolId);
        if (!protocol) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Protocolo não encontrado' });
        }

        // Chamar o script Python para gerar o PDF
        const pythonProcess = spawn('python3', [
          './generate_pdf.py',
          JSON.stringify(protocol),
          'output.pdf' // Nome temporário, o conteúdo será lido
        ], {
          cwd: process.cwd()
        });

        let pdfBuffer = Buffer.from('');
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
          pdfBuffer = Buffer.concat([pdfBuffer, data]);
        });

        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        return new Promise((resolve, reject) => {
          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              console.error(`Python script exited with code ${code}: ${errorOutput}`);
              return reject(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Falha ao gerar PDF: ${errorOutput}` }));
            }
            // O script Python deve imprimir o base64 do PDF para stdout
            const pdfBase64 = pdfBuffer.toString('base64');
            resolve({ pdfBase64 });
          });
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
