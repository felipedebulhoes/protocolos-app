import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

/**
 * Gera um código curto, legível e único para o documento.
 * Formato: ORC-XXXXXX (base32 sem caracteres ambíguos).
 */
function genCode(prefix = "ORC"): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // sem 0/O/1/I
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return `${prefix}-${out}`;
}

function contentHash(parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export const verificationRouter = router({
  // ----- Médico/equipe: registrar um documento emitido para verificação -----
  create: protectedProcedure
    .input(
      z.object({
        docType: z.enum(["orcamento", "outro"]).default("orcamento"),
        patientName: z.string().trim().max(255),
        procedureName: z.string().trim().max(500),
        totalLabel: z.string().trim().max(60).default(""),
        validUntil: z.string().trim().max(20).optional(),
        icpSigned: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Gera um código único (tenta algumas vezes em caso de colisão improvável)
      let code = genCode(input.docType === "orcamento" ? "ORC" : "DOC");
      for (let attempt = 0; attempt < 5; attempt++) {
        const existing = await db.getDocumentVerificationByCode(code);
        if (!existing) break;
        code = genCode(input.docType === "orcamento" ? "ORC" : "DOC");
      }

      const hash = contentHash([
        code,
        input.patientName,
        input.procedureName,
        input.totalLabel,
        input.validUntil ?? "",
      ]);

      const rec = await db.createDocumentVerification({
        code,
        contentHash: hash,
        docType: input.docType,
        patientName: input.patientName,
        procedureName: input.procedureName,
        totalLabel: input.totalLabel,
        validUntil: input.validUntil ?? null,
        icpSigned: input.icpSigned ? 1 : 0,
        createdByOpenId: ctx.user.openId,
      });

      return { code: rec.code, contentHash: rec.contentHash, id: rec.id };
    }),

  // ----- Público: validar um documento pelo código (página /verificar) -----
  getByCode: publicProcedure
    .input(z.object({ code: z.string().trim().min(3).max(32) }))
    .query(async ({ input }) => {
      const rec = await db.getDocumentVerificationByCode(input.code.toUpperCase());
      if (!rec) {
        return { valid: false as const };
      }
      return {
        valid: true as const,
        code: rec.code,
        docType: rec.docType,
        patientName: rec.patientName,
        procedureName: rec.procedureName,
        totalLabel: rec.totalLabel,
        issuedByName: rec.issuedByName,
        issuedByCrm: rec.issuedByCrm,
        icpSigned: rec.icpSigned === 1,
        validUntil: rec.validUntil,
        issuedAt: rec.createdAt,
      };
    }),

  // ----- Médico: listar documentos emitidos -----
  list: protectedProcedure.query(async () => {
    const rows = await db.listDocumentVerifications(200);
    return rows.map((r) => ({
      code: r.code,
      docType: r.docType,
      patientName: r.patientName,
      procedureName: r.procedureName,
      totalLabel: r.totalLabel,
      icpSigned: r.icpSigned === 1,
      validUntil: r.validUntil,
      issuedAt: r.createdAt,
    }));
  }),
});
