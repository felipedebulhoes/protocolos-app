import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, ownerProcedure, patientProcedure } from "../_core/trpc";
import * as db from "../db";
import { readExamFile } from "../intelligence";
import { storagePut } from "../_core/storageProxy";
import { categoryForAnalyte, analyteLabel, CATEGORY_LABELS, type AnalyteCategory } from "@shared/analyteCategories";

// Limit raw upload to ~12MB (base64 inflates ~33%).
const MAX_BASE64_LEN = 16 * 1024 * 1024;

const uploadInput = z.object({
  fileBase64: z.string().min(16).max(MAX_BASE64_LEN),
  fileName: z.string().trim().max(255),
  mimeType: z.string().trim().max(120),
  // Either an intake token (public flow) or rely on patient session.
  intakeToken: z.string().optional(),
});

/** Decode a base64 string that may carry a data: URL prefix. */
function decodeBase64(b64: string): Buffer {
  const comma = b64.indexOf(",");
  const raw = b64.startsWith("data:") && comma !== -1 ? b64.slice(comma + 1) : b64;
  return Buffer.from(raw, "base64");
}

/**
 * Core upload + AI reading routine. Resolves the target patient either from
 * the public intake token or the patient session, persists the file to S3,
 * runs the multimodal reader, and stores standardized results.
 */
async function processUpload(args: {
  fileBase64: string;
  fileName: string;
  mimeType: string;
  patientId: number | null;
  intakeFormId: number | null;
  uploadedBy: "patient" | "doctor";
}) {
  console.log(`[processUpload] starting for file: ${args.fileName}, size: ${args.fileBase64.length} chars`);
  const buffer = decodeBase64(args.fileBase64);
  console.log(`[processUpload] decoded buffer size: ${buffer.length} bytes`);
  const safeName = args.fileName.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "exame";
  const key = `exams/${args.patientId ?? "anon"}/${Date.now()}-${safeName}`;
  console.log(`[processUpload] uploading to key: ${key}`);
  const { url } = await storagePut(key, buffer, args.mimeType || "application/octet-stream");
  console.log(`[processUpload] upload successful, url: ${url}`);

  const file = await db.createExamFile({
    patientId: args.patientId,
    intakeFormId: args.intakeFormId,
    fileKey: key,
    fileUrl: url,
    fileName: args.fileName,
    mimeType: args.mimeType,
    fileSize: buffer.length,
    processStatus: "processing",
    uploadedBy: args.uploadedBy,
  });

  try {
    const extraction = await readExamFile({ fileKey: key, mimeType: args.mimeType });

    await db.updateExamFile(file.id, {
      processStatus: "done",
      rawExtraction: extraction,
      examDate: extraction.examDate ?? null,
      labName: extraction.labName ?? null,
    });

    if (args.patientId && extraction.results.length > 0) {
      await db.insertExamResults(
        extraction.results.map((r) => ({
          patientId: args.patientId!,
          examFileId: file.id,
          analyteKey: r.analyteKey,
          analyteName: r.rawLabel ?? "",
          valueNum: r.valueNum ?? null,
          valueText: r.valueText ?? null,
          unit: r.unit ?? null,
          refRange: r.refRange ?? null,
          abnormalFlag: r.abnormalFlag ?? "unknown",
          measuredAt: extraction.examDate ?? null,
        })),
      );
    }

    return {
      fileId: file.id,
      processStatus: "done" as const,
      examType: extraction.examType,
      examDate: extraction.examDate,
      labName: extraction.labName,
      resultCount: extraction.results.length,
      results: extraction.results,
    };
  } catch (err) {
    await db.updateExamFile(file.id, {
      processStatus: "failed",
      processError: err instanceof Error ? err.message.slice(0, 500) : "erro desconhecido",
    });
    return {
      fileId: file.id,
      processStatus: "failed" as const,
      examType: null,
      examDate: null,
      labName: null,
      resultCount: 0,
      results: [],
    };
  }
}

/** Group standardized results by analyte category for portal/doctor display. */
function groupResultsByCategory(
  results: Array<{
    analyteKey: string;
    rawLabel: string;
    valueNum: number | null;
    valueText: string | null;
    unit: string | null;
    refRange: string | null;
    abnormalFlag: string;
    measuredAt: string | null;
    examFileId: number;
  }>,
) {
  const groups = new Map<AnalyteCategory, typeof results>();
  for (const r of results) {
    const cat = categoryForAnalyte(r.analyteKey);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(r);
  }
  return Array.from(groups.entries()).map(([category, items]) => ({
    category,
    categoryLabel: CATEGORY_LABELS[category] ?? category,
    items: items.map((r) => ({ ...r, analyteLabel: analyteLabel(r.analyteKey) })),
  }));
}

export const examsRouter = router({
  // ----- Public upload (intake flow, before the patient has a password) -----
  uploadPublic: publicProcedure.input(uploadInput).mutation(async ({ input }) => {
    let patientId: number | null = null;
    let intakeFormId: number | null = null;
    if (input.intakeToken) {
      const form = await db.getIntakeByToken(input.intakeToken);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Link inválido." });
      intakeFormId = form.id;
      patientId = form.patientId ?? null;
    }
    return processUpload({
      fileBase64: input.fileBase64,
      fileName: input.fileName,
      mimeType: input.mimeType,
      patientId,
      intakeFormId,
      uploadedBy: "patient",
    });
  }),

  // ----- Patient portal upload ----------------------------------------------
  upload: patientProcedure.input(uploadInput).mutation(async ({ ctx, input }) => {
    return processUpload({
      fileBase64: input.fileBase64,
      fileName: input.fileName,
      mimeType: input.mimeType,
      patientId: ctx.patient.patientId,
      intakeFormId: null,
      uploadedBy: "patient",
    });
  }),

  // ----- Patient: list own exam files ---------------------------------------
  listMine: patientProcedure.query(async ({ ctx }) => {
    const files = await db.listExamFilesByPatient(ctx.patient.patientId);
    return files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      mimeType: f.mimeType,
      fileUrl: f.fileUrl,
      processStatus: f.processStatus,
      examDate: f.examDate,
      labName: f.labName,
      createdAt: f.createdAt,
    }));
  }),

  // ----- Patient: standardized results grouped by category ------------------
  myResults: patientProcedure.query(async ({ ctx }) => {
    const results = await db.listExamResultsByPatient(ctx.patient.patientId);
    return groupResultsByCategory(
      results.map((r) => ({
        analyteKey: r.analyteKey,
        rawLabel: r.analyteName,
        valueNum: r.valueNum,
        valueText: r.valueText,
        unit: r.unit,
        refRange: r.refRange,
        abnormalFlag: r.abnormalFlag ?? "unknown",
        measuredAt: r.measuredAt,
        examFileId: r.examFileId,
      })),
    );
  }),

  // ----- Doctor: list exam files for an intake form -------------------------
  listByIntake: ownerProcedure
    .input(z.object({ intakeFormId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const files = await db.listExamFilesByIntake(input.intakeFormId);
      return files;
    }),
});
