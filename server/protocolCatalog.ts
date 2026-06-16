// ---------------------------------------------------------------------------
// Protocol catalog used for automatic protocol matching from intake answers.
// Only clinically-actionable protocols are included (surgical document
// templates "Modelos UroDocx" are intentionally excluded from matching).
// ---------------------------------------------------------------------------

export type ProtocolCatalogEntry = {
  id: string;
  title: string;
  category: string;
  keywords: string[];
};

export const PROTOCOL_CATALOG: ProtocolCatalogEntry[] = [
  {
    id: "4_disfuncao_eretil",
    title: "Disfunção Erétil - Abordagem Escalonada",
    category: "Andrologia",
    keywords: [
      "disfuncao eretil",
      "erecao",
      "impotencia",
      "rigidez",
      "manter erecao",
      "perda de erecao",
      "dificuldade de erecao",
      "tadalafila",
      "sildenafila",
      "viagra",
      "cialis",
    ],
  },
  {
    id: "15_ejaculacao_precoce",
    title: "Ejaculação Precoce - Abordagem Multimodal",
    category: "Andrologia",
    keywords: [
      "ejaculacao precoce",
      "ejaculo rapido",
      "gozo rapido",
      "controle da ejaculacao",
      "tempo curto",
      "precoce",
    ],
  },
  {
    id: "16_ejaculacao_retardada",
    title: "Ejaculação Retardada e Anorgasmia",
    category: "Andrologia",
    keywords: [
      "ejaculacao retardada",
      "demora para ejacular",
      "nao consigo ejacular",
      "anorgasmia",
      "ausencia de orgasmo",
    ],
  },
  {
    id: "3_doenca_peyronie",
    title: "Doença de Peyronie - Abordagem Completa",
    category: "Andrologia",
    keywords: [
      "peyronie",
      "curvatura",
      "penis torto",
      "placa peniana",
      "tortuosidade",
      "encurvamento",
      "dor na erecao",
    ],
  },
  {
    id: "24_medicina_sexual_casal",
    title: "Medicina Sexual do Casal - Abordagem Integrada",
    category: "Andrologia",
    keywords: [
      "libido",
      "desejo sexual",
      "relacionamento",
      "casal",
      "frequencia sexual",
      "satisfacao sexual",
    ],
  },
  {
    id: "20_reabilitacao_peniana_pos_prostatectomia",
    title: "Reabilitação Peniana Pós-Prostatectomia Radical",
    category: "Andrologia",
    keywords: [
      "prostatectomia",
      "retirei a prostata",
      "cirurgia de prostata",
      "pos prostatectomia",
      "reabilitacao peniana",
      "cancer de prostata operado",
    ],
  },
  {
    id: "8_trt_performance",
    title: "TRT e Otimização Hormonal Masculina",
    category: "Hormônios & Performance",
    keywords: [
      "testosterona baixa",
      "reposicao hormonal",
      "trt",
      "cansaco",
      "fadiga",
      "disposicao",
      "hipogonadismo",
      "perda de massa muscular",
      "humor",
      "energia baixa",
    ],
  },
  {
    id: "22_checkup_performance",
    title: "Check-up de Performance e Longevidade Masculina",
    category: "Hormônios & Performance",
    keywords: [
      "checkup",
      "check-up",
      "longevidade",
      "performance",
      "prevencao",
      "exames de rotina",
      "qualidade de vida",
    ],
  },
  {
    id: "9_trt_estetico_danos",
    title: "Manejo de Danos por Esteroides Anabolizantes",
    category: "Hormônios & Performance",
    keywords: [
      "anabolizante",
      "esteroide",
      "ciclo",
      "academia",
      "bombei",
      "hormonio para academia",
    ],
  },
  {
    id: "10_terapia_pos_ciclo",
    title: "Terapia Pós-Ciclo (TPC) Baseada em Evidências",
    category: "Hormônios & Performance",
    keywords: ["pos ciclo", "tpc", "parar ciclo", "recuperar testiculo"],
  },
  {
    id: "14_infertilidade_masculina",
    title: "Investigação e Manejo da Infertilidade Masculina",
    category: "Infertilidade & Microcirurgia",
    keywords: [
      "infertilidade",
      "nao consigo engravidar",
      "tentando engravidar",
      "dificuldade para ter filho",
      "espermograma",
      "azoospermia",
      "oligospermia",
      "fertilidade",
    ],
  },
  {
    id: "2_varicocelectomia",
    title: "Varicocelectomia Subinguinal Microcirúrgica",
    category: "Infertilidade & Microcirurgia",
    keywords: ["varicocele", "veia dilatada no testiculo", "varizes no testiculo"],
  },
  {
    id: "5b_reversao_vasectomia",
    title: "Reversão de Vasectomia Microcirúrgica",
    category: "Infertilidade & Microcirurgia",
    keywords: [
      "reversao de vasectomia",
      "reverter vasectomia",
      "voltar a ter filhos",
      "desfazer vasectomia",
    ],
  },
  {
    id: "19_preservacao_fertilidade_oncologica",
    title: "Preservação de Fertilidade Oncológica Masculina",
    category: "Infertilidade & Microcirurgia",
    keywords: [
      "congelar esperma",
      "preservar fertilidade",
      "quimioterapia",
      "cancer e fertilidade",
      "criopreservacao",
    ],
  },
  {
    id: "6_vasectomia_sem_bisturi",
    title: "Vasectomia Sem Bisturi",
    category: "Procedimentos de Consultório",
    keywords: [
      "vasectomia",
      "nao quero mais filhos",
      "esterilizacao",
      "contracepcao definitiva",
    ],
  },
  {
    id: "21_li_eswt_ondas_choque",
    title: "Terapia por Ondas de Choque Extracorpóreas (Li-ESWT)",
    category: "Procedimentos de Consultório",
    keywords: ["ondas de choque", "li-eswt", "eswt"],
  },
  {
    id: "13_hpb_manejo_completo",
    title: "Hiperplasia Prostática Benigna (HPB) - Manejo Clínico e Cirúrgico",
    category: "Urologia Geral",
    keywords: [
      "jato fraco",
      "levanto a noite para urinar",
      "noctúria",
      "nocturia",
      "esvaziamento",
      "prostata aumentada",
      "hiperplasia",
      "hpb",
      "dificuldade para urinar",
      "urgencia urinaria",
      "gotejamento",
    ],
  },
  {
    id: "29_itu_repeticao",
    title: "Infecção do Trato Urinário (ITU) de Repetição no Homem",
    category: "Urologia Geral",
    keywords: [
      "infeccao urinaria",
      "itu",
      "ardencia para urinar",
      "cistite",
      "infeccao de repeticao",
    ],
  },
  {
    id: "27_litiase_renal",
    title: "Litíase Renal Masculina e Feminina",
    category: "Urologia Geral",
    keywords: ["pedra no rim", "calculo renal", "litiase", "colica renal"],
  },
  {
    id: "28_incontinencia_urinaria",
    title: "Incontinência Urinária Masculina e Feminina",
    category: "Urologia Geral",
    keywords: [
      "perco urina",
      "incontinencia",
      "escapa urina",
      "perda de urina",
      "uso de fralda",
    ],
  },
  {
    id: "18_dor_escrotal_cronica",
    title: "Dor Escrotal Crônica - Investigação e Manejo",
    category: "Urologia Geral",
    keywords: ["dor no testiculo", "dor escrotal", "dor na bolsa", "orquialgia"],
  },
  {
    id: "17_priapismo_emergencia",
    title: "Priapismo - Protocolo de Emergência",
    category: "Urgências Urológicas",
    keywords: ["priapismo", "erecao que nao baixa", "erecao prolongada"],
  },
];

export function getProtocolById(id: string): ProtocolCatalogEntry | undefined {
  return PROTOCOL_CATALOG.find((p) => p.id === id);
}
