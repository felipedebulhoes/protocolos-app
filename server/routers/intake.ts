import { z } from "zod";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, ownerProcedure } from "../_core/trpc";
import * as db from "../db";
import { scoreProtocols, buildRapportSummary } from "../intelligence";
import { notifyOwner } from "../_core/notification";

function genToken(): string {
  return randomBytes(24).toString("base64url");
}

const answersSchema = z.record(z.string(), z.any());

export const intakeRouter = router({
  // ----- Doctor: generate a new pre-consultation link -----------------------
  createLink: ownerProcedure
    .input(
      z.object({
        invitedName: z.string().trim().max(255).optional(),
        invitedEmail: z.string().trim().email().optional().or(z.literal("")),
        invitedPhone: z.string().trim().max(40).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const token = genToken();
      const form = await db.createIntakeForm({
        token,
        status: "pending",
        invitedName: input.invitedName || null,
        invitedEmail: input.invitedEmail || null,
        invitedPhone: input.invitedPhone || null,
        createdByOpenId: ctx.user.openId,
      });
      return { id: form.id, token: form.token };
    }),

  // ----- Doctor: list all intake forms --------------------------------------
  list: ownerProcedure.query(async () => {
    const forms = await db.listIntakeForms();
    return forms.map((f) => ({
      id: f.id,
      token: f.token,
      status: f.status,
      patientId: f.patientId,
      invitedName: f.invitedName,
      invitedEmail: f.invitedEmail,
      invitedPhone: f.invitedPhone,
      submittedAt: f.submittedAt,
      createdAt: f.createdAt,
    }));
  }),

  // ----- Doctor: full detail of one intake form -----------------------------
  detail: ownerProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const form = await db.getIntakeById(input.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada." });
      const patient = form.patientId ? await db.getPatientById(form.patientId) : undefined;
      const examFiles = await db.listExamFilesByIntake(form.id);
      const examResults = form.patientId
        ? await db.listExamResultsByPatient(form.patientId)
        : [];
      return { form, patient, examFiles, examResults };
    }),

  // ----- Doctor: mark as reviewed / save notes ------------------------------
  review: ownerProcedure
    .input(z.object({ id: z.number().int().positive(), notes: z.string().optional() }))
    .mutation(async ({ input }) => {
      const form = await db.getIntakeById(input.id);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada." });
      await db.updateIntakeForm(input.id, { status: "reviewed", reviewedAt: new Date() });
      if (input.notes != null && form.patientId) {
        await db.updatePatientProfile(form.patientId, { notes: input.notes });
      }
      return { ok: true };
    }),

  // ----- Public: load a form by token (for the patient to fill) -------------
  getByToken: publicProcedure
    .input(z.object({ token: z.string().min(8) }))
    .query(async ({ input }) => {
      const form = await db.getIntakeByToken(input.token);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido ou expirado." });
      return {
        token: form.token,
        status: form.status,
        invitedName: form.invitedName,
        invitedEmail: form.invitedEmail,
        invitedPhone: form.invitedPhone,
        answers: (form.answers as Record<string, unknown>) ?? {},
        alreadySubmitted: form.status !== "pending",
      };
    }),

  // ----- Public: submit the filled form -------------------------------------
  submit: publicProcedure
    .input(
      z.object({
        token: z.string().min(8),
        answers: answersSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const form = await db.getIntakeByToken(input.token);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido." });

      const answers = input.answers as Record<string, unknown>;
      const email = String(answers.email || form.invitedEmail || "").toLowerCase().trim();
      if (!email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "E-mail é obrigatório." });
      }

      // Upsert patient from the answers.
      const sexRaw = String(answers.sex || "nao_informado");
      const sex = (["masculino", "feminino", "outro"].includes(sexRaw) ? sexRaw : "nao_informado") as
        | "masculino"
        | "feminino"
        | "outro"
        | "nao_informado";

      const patient = await db.upsertPatientByEmail({
        email,
        fullName: String(answers.fullName || form.invitedName || ""),
        phone: answers.phone ? String(answers.phone) : null,
        birthDate: answers.birthDate ? String(answers.birthDate) : null,
        sex,
        city: answers.city ? String(answers.city) : null,
        state: answers.state ? String(answers.state) : null,
      });

      // Run protocol scoring (deterministic, cheap).
      const suggestions = scoreProtocols(answers);

      // Attach any exam files that were uploaded against this intake to the patient.
      const intakeExamFiles = await db.listExamFilesByIntake(form.id);
      for (const ef of intakeExamFiles) {
        if (!ef.patientId) await db.updateExamFile(ef.id, { patientId: patient.id });
      }
      const examResults = await db.listExamResultsByPatient(patient.id);

      // Build rapport summary (LLM, with offline fallback).
      const rapport = await buildRapportSummary({
        answers,
        suggestions,
        examResults: examResults.map((r) => ({
          analyteKey: r.analyteKey,
          valueNum: r.valueNum,
          valueText: r.valueText,
          unit: r.unit,
          abnormalFlag: r.abnormalFlag,
        })),
      });

      await db.updateIntakeForm(form.id, {
        status: "submitted",
        patientId: patient.id,
        answers,
        suggestedProtocols: suggestions,
        rapportSummary: rapport,
        submittedAt: new Date(),
      });

      // Notify the doctor (owner) that a new pre-consultation form was submitted.
      // Fire-and-forget: never block or fail the patient submission on notification errors.
      try {
        const topProtocols = suggestions
          .slice(0, 3)
          .map((s) => s.title)
          .filter(Boolean);
        const patientName = patient.fullName || email;
        const lines = [
          `Paciente: ${patientName}`,
          `E-mail: ${email}`,
          patient.phone ? `Telefone: ${patient.phone}` : null,
          intakeExamFiles.length
            ? `Exames enviados: ${intakeExamFiles.length}`
            : "Exames enviados: nenhum",
          topProtocols.length
            ? `Protocolos sugeridos: ${topProtocols.join(", ")}`
            : null,
        ].filter(Boolean) as string[];
        await notifyOwner({
          title: `Nova ficha pré-consulta: ${patientName}`,
          content: lines.join("\n"),
        });
      } catch (e) {
        console.error("[intake.submit] notifyOwner failed", e);
      }

      return { ok: true, patientId: patient.id, email, hasPassword: !!patient.passwordHash };
    }),
});
