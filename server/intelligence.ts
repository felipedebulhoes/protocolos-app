// ---------------------------------------------------------------------------
// Intelligence module:
//  1) readExamFile  -> AI multimodal extraction of standardized lab values
//  2) scoreProtocols -> match intake answers to clinical protocols
//  3) buildRapportSummary -> short pre-consultation briefing for the doctor
// ---------------------------------------------------------------------------

import { invokeLLM } from "./_core/llm";
import { storageGetSignedUrl } from "./_core/storageProxy";
import { PROTOCOL_CATALOG, type ProtocolCatalogEntry } from "./protocolCatalog";
import { ANALYTE_KEYS, analyteLabel } from "@shared/analyteCategories";
import { allIntakeFields, intakeFieldLabel } from "@shared/intakeSchema";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Lowercase + strip accents for robust keyword matching. */
export function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// 1) Exam reading (AI multimodal extraction)
// ---------------------------------------------------------------------------

export type ExtractedResult = {
  analyteKey: string;
  rawLabel: string;
  valueNum: number | null;
  valueText: string | null;
  unit: string | null;
  refRange: string | null;
  abnormalFlag: "low" | "normal" | "high" | "unknown";
};

export type ExamExtraction = {
  examType: string | null;
  examDate: string | null; // ISO yyyy-mm-dd
  labName: string | null;
  results: ExtractedResult[];
};

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    examType: { type: ["string", "null"], description: "Tipo geral do exame (ex.: 'perfil hormonal', 'PSA', 'espermograma', 'hemograma')." },
    examDate: { type: ["string", "null"], description: "Data de coleta do exame em formato ISO yyyy-mm-dd, se encontrada." },
    labName: { type: ["string", "null"], description: "Nome do laboratório, se identificável." },
    results: {
      type: "array",
      description: "Lista de resultados laboratoriais padronizados.",
      items: {
        type: "object",
        properties: {
          analyteKey: {
            type: "string",
            description: "Chave padronizada do analito. DEVE ser uma das chaves permitidas; se não houver correspondência, use 'outro'.",
            enum: [...ANALYTE_KEYS, "outro"],
          },
          rawLabel: { type: "string", description: "Nome do exame exatamente como impresso no laudo." },
          valueNum: { type: ["number", "null"], description: "Valor numérico, se aplicável." },
          valueText: { type: ["string", "null"], description: "Valor textual (ex.: 'negativo'), se não for numérico." },
          unit: { type: ["string", "null"], description: "Unidade de medida (ex.: ng/dL)." },
          refRange: { type: ["string", "null"], description: "Intervalo de referência impresso no laudo." },
          abnormalFlag: {
            type: "string",
            enum: ["low", "normal", "high", "unknown"],
            description: "Se o valor está abaixo, dentro, acima do intervalo de referência, ou desconhecido.",
          },
        },
        required: ["analyteKey", "rawLabel", "valueNum", "valueText", "unit", "refRange", "abnormalFlag"],
        additionalProperties: false,
      },
    },
  },
  required: ["examType", "examDate", "labName", "results"],
  additionalProperties: false,
} as const;

/**
 * Read an uploaded exam file (PDF or image) and extract standardized lab values
 * using the multimodal LLM. The file is referenced by its storage key.
 */
export async function readExamFile(args: {
  fileKey: string;
  mimeType: string;
}): Promise<ExamExtraction> {
  const signedUrl = await storageGetSignedUrl(args.fileKey);
  const isImage = args.mimeType.startsWith("image/");

  const instruction =
    "Você é um assistente médico especializado em ler laudos laboratoriais brasileiros. " +
    "Extraia TODOS os resultados de exames presentes no documento e padronize cada um " +
    "usando a chave (analyteKey) correta da lista permitida. Para cada resultado, informe " +
    "o valor numérico quando houver, a unidade, o intervalo de referência e se o valor está " +
    "baixo/normal/alto em relação à referência. Se um exame não tiver correspondência na lista, " +
    "use analyteKey='outro' e preencha rawLabel. Responda SOMENTE com o JSON solicitado.";

  const fileContent = isImage
    ? { type: "image_url" as const, image_url: { url: signedUrl, detail: "high" as const } }
    : { type: "file_url" as const, file_url: { url: signedUrl, mime_type: args.mimeType } };

  const resp = await invokeLLM({
    messages: [
      { role: "system", content: instruction },
      {
        role: "user",
        content: [
          { type: "text", text: "Leia este laudo e extraia os resultados em JSON padronizado." },
          fileContent,
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "exam_extraction", strict: true, schema: EXTRACTION_SCHEMA },
    },
    temperature: 0,
  });

  const content = resp.choices?.[0]?.message?.content ?? "{}";
  let parsed: ExamExtraction;
  try {
    parsed = JSON.parse(content) as ExamExtraction;
  } catch {
    // Some models wrap JSON in markdown fences; strip and retry.
    const cleaned = content.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned) as ExamExtraction;
  }

  // Drop "outro" entries without a numeric or textual value (noise).
  parsed.results = (parsed.results || []).filter(
    (r) => r.analyteKey !== "outro" || r.valueNum != null || (r.valueText && r.valueText.trim() !== ""),
  );
  return parsed;
}

// ---------------------------------------------------------------------------
// 2) Protocol scoring from intake answers
// ---------------------------------------------------------------------------

export type ProtocolSuggestion = {
  id: string;
  title: string;
  category: string;
  score: number;
  matchedKeywords: string[];
};

/** Collect a single normalized text blob from all matchable intake answers. */
function collectMatchableText(answers: Record<string, unknown>): string {
  const matchableIds = new Set(
    allIntakeFields().filter((f) => f.matchable).map((f) => f.id),
  );
  const parts: string[] = [];
  for (const [key, value] of Object.entries(answers || {})) {
    if (!matchableIds.has(key)) continue;
    if (Array.isArray(value)) parts.push(value.join(" "));
    else if (value != null) parts.push(String(value));
  }
  return normalize(parts.join(" "));
}

/**
 * Score every protocol in the catalog against the intake answers.
 * Returns the top suggestions sorted by score (desc).
 */
export function scoreProtocols(
  answers: Record<string, unknown>,
  limit = 4,
): ProtocolSuggestion[] {
  const blob = collectMatchableText(answers);
  if (!blob) return [];

  const suggestions: ProtocolSuggestion[] = [];
  for (const p of PROTOCOL_CATALOG as ProtocolCatalogEntry[]) {
    const matched: string[] = [];
    for (const kw of p.keywords) {
      const nkw = normalize(kw);
      if (nkw && blob.includes(nkw)) matched.push(kw);
    }
    if (matched.length > 0) {
      suggestions.push({
        id: p.id,
        title: p.title,
        category: p.category,
        score: matched.length,
        matchedKeywords: Array.from(new Set(matched)),
      });
    }
  }
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, limit);
}

// ---------------------------------------------------------------------------
// 3) Rapport summary (doctor-facing pre-consultation briefing)
// ---------------------------------------------------------------------------

export type RapportInput = {
  answers: Record<string, unknown>;
  suggestions: ProtocolSuggestion[];
  examResults: Array<{ analyteKey: string; valueNum: number | null; valueText: string | null; unit: string | null; abnormalFlag: string }>;
};

/** Build a human-readable answers digest for the prompt. */
function answersDigest(answers: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(answers || {})) {
    if (value == null || value === "") continue;
    const label = intakeFieldLabel(key);
    const v = Array.isArray(value) ? value.join(", ") : String(value);
    lines.push(`- ${label}: ${v}`);
  }
  return lines.join("\n");
}

function examsDigest(results: RapportInput["examResults"]): string {
  if (!results || results.length === 0) return "Nenhum exame enviado.";
  return results
    .map((r) => {
      const v = r.valueNum != null ? `${r.valueNum}${r.unit ? " " + r.unit : ""}` : r.valueText ?? "—";
      const flag = r.abnormalFlag && r.abnormalFlag !== "unknown" ? ` (${r.abnormalFlag})` : "";
      return `- ${analyteLabel(r.analyteKey)}: ${v}${flag}`;
    })
    .join("\n");
}

/**
 * Generate a concise rapport briefing for the doctor. Falls back to a
 * deterministic template if the LLM call fails.
 */
export async function buildRapportSummary(input: RapportInput): Promise<string> {
  const digest = answersDigest(input.answers);
  const exams = examsDigest(input.examResults);
  const protocols = input.suggestions.length
    ? input.suggestions.map((s) => `${s.title} (${s.category})`).join("; ")
    : "Sem correspondência automática clara.";

  try {
    const resp = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é assistente clínico de um urologista/andrologista. Com base na ficha de pré-consulta " +
            "e nos exames de um paciente, escreva um BRIEFING curto (máx. 180 palavras) para o médico ler " +
            "ANTES da consulta, para criar rapport e antecipar a conduta. Use português do Brasil, tom " +
            "profissional e objetivo. Estruture em: (1) Quem é o paciente (1 linha), (2) Queixa e expectativa, " +
            "(3) Pontos de atenção clínica/exames relevantes, (4) Gancho de rapport (algo pessoal para acolher). " +
            "NÃO invente dados que não estejam presentes. NÃO faça diagnóstico definitivo.",
        },
        {
          role: "user",
          content: `FICHA DE PRÉ-CONSULTA:\n${digest}\n\nEXAMES PADRONIZADOS:\n${exams}\n\nPROTOCOLOS SUGERIDOS (automático): ${protocols}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });
    const text = resp.choices?.[0]?.message?.content?.trim();
    if (text) return text;
  } catch {
    // fall through to template
  }

  return [
    "Briefing automático (modo offline):",
    "",
    "FICHA:",
    digest || "—",
    "",
    "EXAMES:",
    exams,
    "",
    `PROTOCOLOS SUGERIDOS: ${protocols}`,
  ].join("\n");
}
