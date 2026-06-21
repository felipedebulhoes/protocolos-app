import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { router, publicProcedure, patientProcedure } from "../_core/trpc";
import * as db from "../db";
import {
  hashPassword,
  verifyPassword,
  setPatientSessionCookie,
  clearPatientSessionCookie,
} from "../patientAuth";
import { checkRateLimit } from "../_core/rateLimit";

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(6).max(100);

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 min
const REGISTER_MAX_ATTEMPTS = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const GENERIC_RATE_LIMIT_MSG = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

function clientIp(req: CreateExpressContextOptions["req"]): string {
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

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
      // SECURITY: throttle account creation per IP and per target e-mail so
      // this endpoint can't be used to mass-create accounts or hammer the
      // "already exists" branch to enumerate registered patients.
      const ip = clientIp(ctx.req);
      if (
        !checkRateLimit(`register:ip:${ip}`, REGISTER_MAX_ATTEMPTS, REGISTER_WINDOW_MS) ||
        !checkRateLimit(`register:email:${input.email}`, REGISTER_MAX_ATTEMPTS, REGISTER_WINDOW_MS)
      ) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: GENERIC_RATE_LIMIT_MSG });
      }

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
      // SECURITY: throttle login attempts per IP and per target e-mail to
      // make password brute-forcing impractical.
      const ip = clientIp(ctx.req);
      if (
        !checkRateLimit(`login:ip:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS) ||
        !checkRateLimit(`login:email:${input.email}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)
      ) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: GENERIC_RATE_LIMIT_MSG });
      }

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
