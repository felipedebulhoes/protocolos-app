import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, patientProcedure } from "../_core/trpc";
import * as db from "../db";
import {
  hashPassword,
  verifyPassword,
  setPatientSessionCookie,
  clearPatientSessionCookie,
} from "../patientAuth";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(6).max(100);

export const patientAuthRouter = router({
  // ----- Create a portal password (after filling the intake) ----------------
  register: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: passwordSchema,
        fullName: z.string().trim().max(255).optional(),
        phone: z.string().trim().max(40).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getPatientByEmail(input.email);
      if (existing?.passwordHash) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe uma conta com este e-mail. Faça login.",
        });
      }
      const hash = await hashPassword(input.password);
      let patient = existing;
      if (patient) {
        await db.setPatientPassword(patient.id, hash);
        if (input.fullName || input.phone) {
          await db.updatePatientProfile(patient.id, {
            ...(input.fullName ? { fullName: input.fullName } : {}),
            ...(input.phone ? { phone: input.phone } : {}),
          });
        }
        patient = await db.getPatientByEmail(input.email);
      } else {
        patient = await db.createPatient({
          email: input.email,
          fullName: input.fullName ?? "",
          phone: input.phone ?? null,
          passwordHash: hash,
        });
      }
      await setPatientSessionCookie(ctx.res, { patientId: patient!.id, email: patient!.email });
      return { ok: true, patientId: patient!.id };
    }),

  // ----- Login --------------------------------------------------------------
  login: publicProcedure
    .input(z.object({ email: emailSchema, password: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const patient = await db.getPatientByEmail(input.email);
      const ok = patient && (await verifyPassword(input.password, patient.passwordHash));
      if (!patient || !ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha inválidos." });
      }
      await setPatientSessionCookie(ctx.res, { patientId: patient.id, email: patient.email });
      return { ok: true, patientId: patient.id };
    }),

  // ----- Current patient ----------------------------------------------------
  me: patientProcedure.query(async ({ ctx }) => {
    const patient = await db.getPatientById(ctx.patient.patientId);
    if (!patient) return null;
    return {
      id: patient.id,
      email: patient.email,
      fullName: patient.fullName,
      phone: patient.phone,
      birthDate: patient.birthDate,
      sex: patient.sex,
      city: patient.city,
      state: patient.state,
    };
  }),

  // ----- Logout -------------------------------------------------------------
  logout: patientProcedure.mutation(async ({ ctx }) => {
    clearPatientSessionCookie(ctx.res);
    return { ok: true };
  }),

  // ----- Update profile -----------------------------------------------------
  updateProfile: patientProcedure
    .input(
      z.object({
        fullName: z.string().trim().max(255).optional(),
        phone: z.string().trim().max(40).optional(),
        birthDate: z.string().trim().max(20).optional(),
        city: z.string().trim().max(120).optional(),
        state: z.string().trim().max(60).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.updatePatientProfile(ctx.patient.patientId, input);
      return { ok: true };
    }),
});
