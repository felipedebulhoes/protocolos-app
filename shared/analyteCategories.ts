// ---------------------------------------------------------------------------
// Standardized analyte keys + categorization, shared between the AI exam reader
// (backend) and the patient/doctor timelines (frontend).
// The AI is instructed to map every detected lab value into one of these keys.
// ---------------------------------------------------------------------------

export type AnalyteCategory =
  | "hormonal"
  | "prostata"
  | "metabolico"
  | "renal"
  | "hematologico"
  | "seminal"
  | "outro";

export type AnalyteDef = {
  key: string;
  label: string;
  category: AnalyteCategory;
  unit?: string;
  /** Common aliases printed on lab reports, lowercased & unaccented. */
  aliases: string[];
};

export const ANALYTE_DEFS: AnalyteDef[] = [
  // Hormonal
  { key: "testosterona_total", label: "Testosterona Total", category: "hormonal", unit: "ng/dL", aliases: ["testosterona total", "testosterona"] },
  { key: "testosterona_livre", label: "Testosterona Livre", category: "hormonal", unit: "pg/mL", aliases: ["testosterona livre"] },
  { key: "shbg", label: "SHBG", category: "hormonal", unit: "nmol/L", aliases: ["shbg", "globulina ligadora"] },
  { key: "lh", label: "LH", category: "hormonal", unit: "mUI/mL", aliases: ["lh", "hormonio luteinizante"] },
  { key: "fsh", label: "FSH", category: "hormonal", unit: "mUI/mL", aliases: ["fsh", "hormonio foliculo"] },
  { key: "estradiol", label: "Estradiol", category: "hormonal", unit: "pg/mL", aliases: ["estradiol", "e2"] },
  { key: "prolactina", label: "Prolactina", category: "hormonal", unit: "ng/mL", aliases: ["prolactina"] },
  { key: "tsh", label: "TSH", category: "hormonal", unit: "mUI/L", aliases: ["tsh"] },
  { key: "t4_livre", label: "T4 Livre", category: "hormonal", unit: "ng/dL", aliases: ["t4 livre", "tiroxina livre"] },

  // Próstata
  { key: "psa_total", label: "PSA Total", category: "prostata", unit: "ng/mL", aliases: ["psa total", "psa", "antigeno prostatico"] },
  { key: "psa_livre", label: "PSA Livre", category: "prostata", unit: "ng/mL", aliases: ["psa livre", "psa free"] },
  { key: "relacao_psa", label: "Relação PSA Livre/Total", category: "prostata", unit: "%", aliases: ["relacao psa", "psa livre/total", "free/total"] },

  // Metabólico
  { key: "glicose", label: "Glicose", category: "metabolico", unit: "mg/dL", aliases: ["glicose", "glicemia"] },
  { key: "hba1c", label: "Hemoglobina Glicada", category: "metabolico", unit: "%", aliases: ["hemoglobina glicada", "hba1c", "a1c"] },
  { key: "colesterol_total", label: "Colesterol Total", category: "metabolico", unit: "mg/dL", aliases: ["colesterol total"] },
  { key: "hdl", label: "HDL", category: "metabolico", unit: "mg/dL", aliases: ["hdl"] },
  { key: "ldl", label: "LDL", category: "metabolico", unit: "mg/dL", aliases: ["ldl"] },
  { key: "triglicerides", label: "Triglicerídeos", category: "metabolico", unit: "mg/dL", aliases: ["triglicerides", "triglicerideos"] },
  { key: "vitamina_d", label: "Vitamina D (25-OH)", category: "metabolico", unit: "ng/mL", aliases: ["vitamina d", "25-oh", "25 hidroxivitamina"] },

  // Renal
  { key: "creatinina", label: "Creatinina", category: "renal", unit: "mg/dL", aliases: ["creatinina"] },
  { key: "ureia", label: "Ureia", category: "renal", unit: "mg/dL", aliases: ["ureia", "uréia"] },
  { key: "tfg", label: "Taxa de Filtração Glomerular", category: "renal", unit: "mL/min", aliases: ["tfg", "filtracao glomerular", "egfr", "clearance"] },

  // Hematológico
  { key: "hemoglobina", label: "Hemoglobina", category: "hematologico", unit: "g/dL", aliases: ["hemoglobina", "hb"] },
  { key: "hematocrito", label: "Hematócrito", category: "hematologico", unit: "%", aliases: ["hematocrito", "ht"] },

  // Seminal (espermograma)
  { key: "concentracao_esperm", label: "Concentração espermática", category: "seminal", unit: "mi/mL", aliases: ["concentracao", "espermatozoides por ml", "concentracao espermatica"] },
  { key: "motilidade_total", label: "Motilidade total", category: "seminal", unit: "%", aliases: ["motilidade total", "motilidade"] },
  { key: "morfologia", label: "Morfologia normal", category: "seminal", unit: "%", aliases: ["morfologia", "formas normais"] },
  { key: "volume_seminal", label: "Volume seminal", category: "seminal", unit: "mL", aliases: ["volume seminal", "volume do ejaculado"] },
];

export const CATEGORY_LABELS: Record<AnalyteCategory, string> = {
  hormonal: "Hormonal",
  prostata: "Próstata",
  metabolico: "Metabólico",
  renal: "Função Renal",
  hematologico: "Hematológico",
  seminal: "Espermograma",
  outro: "Outros",
};

const KEY_TO_DEF = new Map(ANALYTE_DEFS.map((d) => [d.key, d]));

export function getAnalyteDef(key: string): AnalyteDef | undefined {
  return KEY_TO_DEF.get(key);
}

export function categoryForAnalyte(key: string): AnalyteCategory {
  return KEY_TO_DEF.get(key)?.category ?? "outro";
}

export function analyteLabel(key: string): string {
  return KEY_TO_DEF.get(key)?.label ?? key;
}

/** The list of valid keys, used to constrain the AI extraction. */
export const ANALYTE_KEYS = ANALYTE_DEFS.map((d) => d.key);
