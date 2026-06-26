// ════════════════════════════════════════════════════════════════════════
// JORNADAS PREMIUM POR PROCEDIMENTO — Dr. Felipe de Bulhões
// Conteúdo clínico estruturado, baseado em evidências (EAU 2024/2025, AUA).
// Cada jornada: visão geral, fases ANTES/DURANTE/DEPOIS, cronograma de
// acompanhamento (até 6 meses), sinais de alerta e fontes citadas.
// ════════════════════════════════════════════════════════════════════════

export interface JornadaFase {
  /** Rótulo curto da fase (ex.: "ANTES — Otimização"). */
  titulo: string;
  /** Janela temporal aproximada (ex.: "2–4 semanas antes"). */
  janela: string;
  /** Itens objetivos da fase. */
  itens: string[];
}

export interface JornadaEtapaSeguimento {
  /** Momento (ex.: "Semana 6", "Mês 3"). */
  quando: string;
  /** O que é feito/avaliado nesse retorno. */
  acao: string;
}

export interface Jornada {
  id: string;
  /** Nome exibido no seletor. */
  nome: string;
  /** Categoria para agrupar no seletor. */
  categoria:
    | "Andrologia & Sexual"
    | "Fertilidade & Microcirurgia"
    | "Urologia Geral"
    | "Hormônios";
  /** Subtítulo curto que aparece no cabeçalho da jornada. */
  resumo: string;
  /** Frequência/relevância para destacar os mais comuns. */
  destaque?: boolean;
  /** Tipo principal: cirúrgico, procedimento de consultório ou clínico. */
  tipo: "Cirúrgico" | "Procedimento" | "Clínico";
  fases: JornadaFase[];
  seguimento: JornadaEtapaSeguimento[];
  /** Sinais de alerta para contato imediato. */
  alertas: string[];
  /** Referências de alto nível de evidência. */
  fontes: string[];
}

const otimizacaoCicatrizacao =
  "Otimização nutricional para cicatrização: vitamina C 500–1000 mg/dia, zinco 15–30 mg/dia, vitamina D 2000 UI/dia, ômega-3 2–3 g/dia e proteína 1,2–1,5 g/kg/dia (Bechara 2022, Antioxidants; AUA Pre-Operative White Paper 2018).";

const mevBase =
  "Estilo de vida (MEV): cessação de tabaco e álcool, sono 7–9 h/noite, caminhadas 30 min/dia e hidratação 2–3 L/dia para reduzir complicações e acelerar a recuperação.";

export const JORNADAS: Jornada[] = [
  // ───────────────────────── 1. PRÓTESE PENIANA ─────────────────────────
  {
    id: "protese-peniana",
    nome: "Prótese Peniana (Implante)",
    categoria: "Andrologia & Sexual",
    resumo:
      "Tratamento definitivo da disfunção erétil refratária, com altíssima satisfação do casal.",
    destaque: true,
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Otimização e Preparo",
        janela: "2–4 semanas antes",
        itens: [
          "Confirmação diagnóstica e escolha do modelo (inflável de 3 volumes vs. semirrígido) conforme expectativa e destreza manual.",
          "Controle glicêmico rigoroso (HbA1c) no diabético — fator-chave de prevenção de infecção.",
          otimizacaoCicatrizacao,
          mevBase,
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Internação ~1–2 noites",
        itens: [
          "Implante sob antibioticoprofilaxia; dispositivo deixado parcialmente inflado nas primeiras semanas para modelar o espaço.",
          "Analgesia multimodal e orientação de cuidados com a ferida e drenos.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação e Ativação",
        janela: "0–6 semanas",
        itens: [
          "Dor diminui progressivamente em 3–6 semanas; atividades leves nos primeiros dias.",
          "Ativação do dispositivo e treino de manuseio em ~4–6 semanas.",
          "Retorno à atividade sexual liberado em ~4–6 semanas, após cicatrização e treino.",
        ],
      },
    ],
    seguimento: [
      { quando: "48 h", acao: "Orientação de curativo e sinais de alerta; retorno de dúvidas pelo canal direto." },
      { quando: "Semana 1–2", acao: "Revisão da ferida operatória e ajuste de analgesia." },
      { quando: "Semana 4–6", acao: "Ativação do dispositivo, treino de uso e liberação sexual." },
      { quando: "Mês 3", acao: "Avaliação de satisfação, função e domínio do manuseio." },
      { quando: "Mês 6", acao: "Reavaliação completa e plano de manutenção de longo prazo." },
    ],
    alertas: [
      "Febre, secreção purulenta, dor intensa e progressiva ou vermelhidão crescente (suspeita de infecção do implante).",
      "Dificuldade para urinar, sangramento ativo ou edema súbito e doloroso da bolsa.",
    ],
    fontes: [
      "EAU Guidelines on Sexual and Reproductive Health (Erectile Dysfunction).",
      "Bechara A. et al. (2022), Antioxidants; AUA Pre-Operative White Paper (2018).",
    ],
  },

  // ─────────────────── 2. VARICOCELECTOMIA MICROCIRÚRGICA ───────────────────
  {
    id: "varicocelectomia",
    nome: "Varicocelectomia Microcirúrgica",
    categoria: "Fertilidade & Microcirurgia",
    resumo:
      "Correção microcirúrgica da varicocele para melhora de parâmetros seminais e/ou dor.",
    destaque: true,
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Avaliação",
        janela: "2–4 semanas antes",
        itens: [
          "Dois espermogramas de base e dosagens hormonais; definição da indicação (infertilidade, dor ou hipotrofia).",
          "Documentação da varicocele (exame físico ± Doppler) e definição de metas com o casal.",
          mevBase,
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Ambulatorial / day-hospital",
        itens: [
          "Ligadura microcirúrgica subinguinal com preservação arterial e linfática (padrão-ouro, menor recidiva).",
          "Analgesia e orientação de repouso relativo.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–6 meses",
        itens: [
          "Retorno gradual às atividades em poucos dias; evitar esforço intenso nas primeiras semanas.",
          "Melhora de parâmetros seminais já a partir de 3 meses, com principal recuperação até 6 meses.",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 1–2", acao: "Revisão da ferida e controle de dor/edema." },
      { quando: "Mês 3", acao: "Espermograma de controle — primeira janela de melhora mensurável." },
      { quando: "Mês 6", acao: "Espermograma + reavaliação — principal janela de recuperação; planejamento reprodutivo." },
    ],
    alertas: [
      "Hidrocele de aparecimento progressivo, dor escrotal crescente ou sinais de infecção.",
      "Edema/eritema importante ou febre.",
    ],
    fontes: [
      "EAU Guidelines on Sexual and Reproductive Health (Male Infertility).",
      "Meta-análise (Int Urol Nephrol, 2024): 3 meses como janela ótima de reavaliação seminal.",
    ],
  },

  // ───────────────────────── 3. VASECTOMIA ─────────────────────────
  {
    id: "vasectomia",
    nome: "Vasectomia (Sem Bisturi)",
    categoria: "Andrologia & Sexual",
    resumo:
      "Contracepção masculina definitiva, minimamente invasiva, sem bisturi e sem agulha.",
    destaque: true,
    tipo: "Procedimento",
    fases: [
      {
        titulo: "ANTES — Decisão Informada",
        janela: "Consulta prévia",
        itens: [
          "Aconselhamento sobre o caráter permanente do método e sobre a necessidade de espermograma de confirmação.",
          "Manutenção de contracepção até a confirmação de azoospermia.",
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Consultório (~20–30 min)",
        itens: [
          "Técnica sem bisturi e sem agulha, com anestesia local e mínima manipulação.",
          "Orientações de repouso, gelo local e suporte escrotal.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–12 semanas",
        itens: [
          "Retorno a atividades leves em poucos dias; evitar esforço e atividade sexual por alguns dias.",
          "Espermograma de confirmação entre 8 e 16 semanas (idealmente ~12 semanas).",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 1", acao: "Verificação de cicatrização e controle de desconforto." },
      { quando: "Semana 12", acao: "Espermograma pós-vasectomia para confirmar azoospermia." },
      { quando: "Após confirmação", acao: "Liberação para suspender outros métodos contraceptivos." },
    ],
    alertas: [
      "Dor intensa e progressiva, hematoma volumoso ou sinais de infecção (febre, secreção).",
      "Edema escrotal importante.",
    ],
    fontes: [
      "AUA Vasectomy Guideline (2024/2026): espermograma 8–16 semanas pós-procedimento.",
    ],
  },

  // ─────────────────── 4. REVERSÃO DE VASECTOMIA ───────────────────
  {
    id: "reversao-vasectomia",
    nome: "Reversão de Vasectomia",
    categoria: "Fertilidade & Microcirurgia",
    resumo:
      "Microcirurgia para restaurar a fertilidade após vasectomia, com altas taxas de patência.",
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Avaliação",
        janela: "2–4 semanas antes",
        itens: [
          "Avaliação do casal, incluindo fatores femininos e tempo desde a vasectomia.",
          "Aconselhamento sobre patência (~90–98%) e taxas de gravidez.",
          mevBase,
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Centro cirúrgico",
        itens: [
          "Vasovasostomia ou vasoepididimostomia microcirúrgica conforme achado intraoperatório do fluido vasal.",
          "Presença de espermatozoides móveis no vaso prediz patência mais rápida.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–6 meses",
        itens: [
          "Repouso relativo e suporte escrotal; retorno gradual às atividades.",
          "Retorno de espermatozoides ao ejaculado geralmente em 2–6 meses (até ~95% de patência aos 6 meses em casos favoráveis).",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 2", acao: "Revisão da ferida e do conforto." },
      { quando: "Mês 3", acao: "Primeiro espermograma de controle." },
      { quando: "Mês 6", acao: "Espermograma + plano reprodutivo conforme evolução." },
    ],
    alertas: [
      "Dor intensa, hematoma volumoso ou sinais de infecção.",
    ],
    fontes: [
      "AUA Vasectomy Guideline; séries microcirúrgicas (patência 90–98%).",
      "Kinetics of return of motile sperm (J Urol): 95% de patência até 6 meses com esperma móvel intraoperatório.",
    ],
  },

  // ───────────────────────── 5. MICROTESE ─────────────────────────
  {
    id: "microtese",
    nome: "MicroTESE (Recuperação de Espermatozoides)",
    categoria: "Fertilidade & Microcirurgia",
    resumo:
      "Microdissecção testicular para recuperação de espermatozoides na azoospermia não obstrutiva.",
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Preparo do Casal",
        janela: "Semanas antes",
        itens: [
          "Investigação completa da azoospermia (hormonal, genética) e otimização clínica quando aplicável.",
          "Coordenação com a equipe de reprodução assistida (sincronização com a coleta de óvulos / criopreservação).",
          mevBase,
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Centro cirúrgico",
        itens: [
          "Microdissecção testicular com magnificação para identificar túbulos com espermatogênese.",
          "Criopreservação dos espermatozoides recuperados.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–6 meses",
        itens: [
          "Repouso relativo e suporte escrotal; controle de dor.",
          "Acompanhamento hormonal (testosterona) pós-procedimento, dado o risco de queda transitória.",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 2", acao: "Revisão da ferida e do conforto." },
      { quando: "Mês 3", acao: "Avaliação clínica e hormonal; plano com a reprodução assistida." },
      { quando: "Mês 6", acao: "Reavaliação hormonal e de bem-estar." },
    ],
    alertas: [
      "Dor intensa progressiva, hematoma volumoso ou sinais de infecção.",
      "Sintomas sugestivos de hipogonadismo (fadiga, libido baixa) no seguimento.",
    ],
    fontes: [
      "EAU Guidelines on Sexual and Reproductive Health (Male Infertility).",
      "Séries de microTESE em azoospermia não obstrutiva.",
    ],
  },

  // ─────────────────── 6. Li-ESWT / PRP (DISFUNÇÃO ERÉTIL) ───────────────────
  {
    id: "li-eswt-prp",
    nome: "Li-ESWT / PRP (Disfunção Erétil)",
    categoria: "Andrologia & Sexual",
    resumo:
      "Terapias regenerativas de consultório para disfunção erétil vasculogênica leve a moderada.",
    destaque: true,
    tipo: "Procedimento",
    fases: [
      {
        titulo: "ANTES — Seleção do Candidato",
        janela: "Consulta",
        itens: [
          "Avaliação da DE e do perfil vascular; melhor resposta em DE vasculogênica leve a moderada.",
          "Alinhamento de expectativas: a Li-ESWT tem recomendação em diretrizes; o PRP intracavernoso ainda é considerado experimental.",
        ],
      },
      {
        titulo: "DURANTE — Sessões",
        janela: "3–6 semanas",
        itens: [
          "Li-ESWT: protocolo típico de 6–12 sessões ao longo de 3–6 semanas, baixa energia, sem afastamento.",
          "PRP intracavernoso quando indicado, com consentimento sobre o nível de evidência.",
        ],
      },
      {
        titulo: "DEPOIS — Avaliação de Resposta",
        janela: "4–12 semanas",
        itens: [
          "Reavaliação funcional (IIEF) entre 4 e 12 semanas após o término.",
          "Combinação com MEV e, se necessário, terapia farmacológica (PDE5i).",
        ],
      },
    ],
    seguimento: [
      { quando: "Durante o ciclo", acao: "Acompanhamento de tolerância e adesão às sessões." },
      { quando: "Semana 4–12", acao: "Reavaliação funcional formal da resposta." },
      { quando: "Mês 6", acao: "Avaliação de durabilidade e plano de manutenção." },
    ],
    alertas: [
      "Dor persistente, equimose importante ou ereção prolongada/dolorosa (priapismo) após injeção — contato imediato.",
    ],
    fontes: [
      "EAU Guidelines on Erectile Dysfunction (Li-ESWT como opção em DE vasculogênica).",
      "Revisões sistemáticas de PRP intracavernoso (evidência ainda preliminar).",
    ],
  },
];

// ─────────────────── 7. POSTECTOMIA / FRENULOPLASTIA ───────────────────
JORNADAS.push(
  {
    id: "postectomia-frenuloplastia",
    nome: "Postectomia / Frenuloplastia",
    categoria: "Andrologia & Sexual",
    resumo:
      "Correção de fimose, parafimose, balanopostite de repetição ou freio curto.",
    tipo: "Procedimento",
    fases: [
      {
        titulo: "ANTES — Indicação",
        janela: "Consulta",
        itens: [
          "Definição da indicação (fimose, balanopostite recorrente, líquen escleroso, freio curto) e técnica.",
          "Orientação sobre abstinência sexual no pós-operatório para cicatrização.",
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Ambulatorial",
        itens: [
          "Postectomia (técnica conforme indicação estética/funcional) ou frenuloplastia, com anestesia local.",
          "Curativo e orientações de higiene local.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–6 semanas",
        itens: [
          "Edema e desconforto nas primeiras 1–2 semanas; evitar esforço por 1–2 semanas.",
          "Abstinência de atividade sexual/masturbação por 4–6 semanas até cicatrização completa.",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 1–2", acao: "Revisão da ferida, retirada de pontos se aplicável." },
      { quando: "Semana 4–6", acao: "Confirmação de cicatrização e liberação sexual." },
      { quando: "Mês 3", acao: "Avaliação estética/funcional final." },
    ],
    alertas: [
      "Sangramento ativo, edema importante, secreção purulenta ou febre.",
      "Dor desproporcional ou deiscência da sutura.",
    ],
    fontes: [
      "Consensos de circuncisão no adulto: abstinência sexual de 4–6 semanas para cicatrização.",
    ],
  },

  // ───────────────────────── 8. LITÍASE URINÁRIA ─────────────────────────
  {
    id: "litiase",
    nome: "Litíase Urinária (Cálculo)",
    categoria: "Urologia Geral",
    resumo:
      "Da cólica ao tratamento (LECO/ureterolitotripsia) e prevenção metabólica de recidiva.",
    destaque: true,
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Diagnóstico e Planejamento",
        janela: "Avaliação inicial",
        itens: [
          "Controle da dor, imagem (TC) e definição da melhor estratégia conforme tamanho/localização do cálculo.",
          "Análise do cálculo e investigação metabólica nos formadores de cálculo.",
        ],
      },
      {
        titulo: "DURANTE — Tratamento",
        janela: "Day-hospital / internação curta",
        itens: [
          "LECO (extracorpórea) ou ureterolitotripsia a laser, frequentemente com cateter duplo-J temporário.",
          "Orientação sobre sintomas do cateter e hidratação.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação e Prevenção",
        janela: "Dias a 3 meses",
        itens: [
          "Recuperação de 2–5 dias (LECO) ou 3–5 dias (ureteroscopia com duplo-J).",
          "Eliminação de fragmentos pode levar de 24 h a semanas; retirada do duplo-J programada.",
          "Início de prevenção metabólica (dieta + medicação conforme perfil).",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 1–2", acao: "Controle de sintomas, programação de retirada do duplo-J." },
      { quando: "Semana 8–12", acao: "Primeira urina de 24 h de controle após início da profilaxia (EAU)." },
      { quando: "Mês 3–6", acao: "Imagem de controle e ajuste do plano de prevenção de recidiva." },
    ],
    alertas: [
      "Febre com calafrios (suspeita de infecção/obstrução — urgência), dor incontrolável ou vômitos persistentes.",
      "Ausência de urina ou sangramento volumoso.",
    ],
    fontes: [
      "EAU Guidelines on Urolithiasis (avaliação metabólica e prevenção de recidiva; urina 24 h em 8–12 semanas).",
    ],
  },

  // ───────────────────────── 9. HPB (CIRÚRGICO) ─────────────────────────
  {
    id: "hpb",
    nome: "HPB — Próstata (Clínico e Cirúrgico)",
    categoria: "Urologia Geral",
    resumo:
      "Manejo dos sintomas do trato urinário inferior, do tratamento clínico à desobstrução cirúrgica.",
    destaque: true,
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Avaliação",
        janela: "Consulta",
        itens: [
          "Escore de sintomas (IPSS), fluxometria, resíduo pós-miccional e exclusão de outras causas.",
          "Otimização clínica (bloqueador alfa ± 5-ARI) e definição da técnica cirúrgica quando indicada (RTU, HoLEP, etc.).",
          mevBase,
        ],
      },
      {
        titulo: "DURANTE — Procedimento",
        janela: "Internação curta",
        itens: [
          "Desobstrução transuretral (RTU-P, HoLEP/enucleação a laser) conforme volume prostático e perfil.",
          "Sonda vesical por curto período (frequentemente <24 h em HoLEP).",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–12 semanas",
        itens: [
          "Retirada de sonda precoce; retorno a atividades em 2–6 semanas, evitando esforço pesado.",
          "Melhora do fluxo costuma ser imediata; cicatrização completa em 8–12 semanas (sintomas irritativos podem persistir transitoriamente).",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 1–2", acao: "Confirmar micção espontânea e controlar sintomas irritativos." },
      { quando: "Semana 6", acao: "Revisão e retorno gradual a atividades plenas." },
      { quando: "Mês 3", acao: "Reavaliação de sintomas (IPSS) e fluxometria." },
    ],
    alertas: [
      "Retenção urinária, febre, hematúria volumosa com coágulos ou incapacidade de urinar.",
    ],
    fontes: [
      "EAU Guidelines on Management of Non-Neurogenic Male LUTS / BPO.",
      "Séries de HoLEP/RTU: retirada de sonda precoce e recuperação 2–6 semanas.",
    ],
  },

  // ───────────────────────── 10. TRT (HORMONAL) ─────────────────────────
  {
    id: "trt",
    nome: "TRT — Reposição de Testosterona",
    categoria: "Hormônios",
    resumo:
      "Otimização hormonal masculina baseada em evidências, com monitorização de segurança.",
    destaque: true,
    tipo: "Clínico",
    fases: [
      {
        titulo: "ANTES — Diagnóstico",
        janela: "Avaliação",
        itens: [
          "Confirmação de hipogonadismo com pelo menos duas dosagens matinais de testosterona total + sintomas.",
          "Avaliação basal: hematócrito, PSA, perfil lipídico e discussão sobre fertilidade (TRT suprime a espermatogênese).",
        ],
      },
      {
        titulo: "DURANTE — Início e Titulação",
        janela: "Primeiros meses",
        itens: [
          "Escolha da formulação (gel, injetável, pellets) conforme preferência e objetivo.",
          "Em quem deseja preservar fertilidade, considerar alternativas (ex.: clomifeno/hCG) em vez de testosterona exógena.",
        ],
      },
      {
        titulo: "DEPOIS — Manutenção",
        janela: "Contínuo",
        itens: [
          "Ajuste de dose pela resposta clínica e laboratorial; manejo de eritrocitose e demais efeitos.",
          "Reforço de MEV (sono, atividade física, composição corporal).",
        ],
      },
    ],
    seguimento: [
      { quando: "Mês 3", acao: "Testosterona, hematócrito e PSA; avaliação de sintomas." },
      { quando: "Mês 6", acao: "Reavaliação de testosterona, hematócrito e PSA." },
      { quando: "Mês 12 e anual", acao: "Reavaliação completa (T, Hct, PSA) e plano de manutenção." },
    ],
    alertas: [
      "Hematócrito elevado (risco trombótico), alteração relevante de PSA, edema ou dor torácica.",
    ],
    fontes: [
      "AUA Testosterone Deficiency Guideline; EAU: T, hematócrito e PSA a 3, 6 e 12 meses, depois anual.",
    ],
  },

  // ─────────────────── 11. INCONTINÊNCIA URINÁRIA ───────────────────
  {
    id: "incontinencia",
    nome: "Incontinência Urinária (Masc. e Fem.)",
    categoria: "Urologia Geral",
    resumo:
      "Da reabilitação do assoalho pélvico às soluções cirúrgicas (sling / esfíncter artificial).",
    tipo: "Cirúrgico",
    fases: [
      {
        titulo: "ANTES — Avaliação",
        janela: "Consulta",
        itens: [
          "Caracterização do tipo (esforço, urgência, mista) com diário miccional e teste do absorvente.",
          "No homem pós-prostatectomia: fisioterapia do assoalho pélvico (PFMT) como primeira linha; cirurgia (sling/esfíncter) na incontinência persistente.",
          "Na mulher: PFMT e, na IUE refratária, opções cirúrgicas individualizadas.",
        ],
      },
      {
        titulo: "DURANTE — Tratamento",
        janela: "Conforme indicação",
        itens: [
          "Sling masculino na incontinência leve a moderada; esfíncter urinário artificial na moderada a grave.",
          "Procedimento minimamente invasivo conforme o caso.",
        ],
      },
      {
        titulo: "DEPOIS — Recuperação",
        janela: "0–6 semanas",
        itens: [
          "Esfíncter artificial / dispositivos ativados em ~4–6 semanas (preservando a cicatrização uretral).",
          "Continuidade da fisioterapia do assoalho pélvico.",
        ],
      },
    ],
    seguimento: [
      { quando: "Semana 2", acao: "Revisão da ferida e orientações." },
      { quando: "Semana 4–6", acao: "Ativação do dispositivo (quando aplicável) e treino de uso." },
      { quando: "Mês 3–6", acao: "Avaliação de continência e satisfação; ajuste do plano." },
    ],
    alertas: [
      "Retenção urinária, dor importante, febre, sangramento ou sinais de infecção do dispositivo.",
    ],
    fontes: [
      "EAU Guidelines on Urinary Incontinence (PFMT, sling e esfíncter artificial).",
      "Séries de esfíncter artificial: ativação em 4–6 semanas.",
    ],
  },

  // ─────────────────── 12. ITU DE REPETIÇÃO ───────────────────
  {
    id: "itu-repeticao",
    nome: "ITU de Repetição",
    categoria: "Urologia Geral",
    resumo:
      "Investigação das causas e profilaxia baseada em evidências para reduzir recorrências.",
    tipo: "Clínico",
    fases: [
      {
        titulo: "ANTES — Investigação",
        janela: "Avaliação",
        itens: [
          "Confirmação com urocultura e investigação de fatores de risco / causas estruturais.",
          "No homem, considerar próstata e trato urinário; evitar tratar bacteriúria assintomática.",
        ],
      },
      {
        titulo: "DURANTE — Estratégia",
        janela: "Plano individualizado",
        itens: [
          "Medidas comportamentais e correção de fatores predisponentes.",
          "Profilaxia: cranberry e D-manose como opções; profilaxia antibiótica (contínua ou pós-coito) quando indicada.",
          "Na mulher pós-menopausa, estrogênio vaginal quando apropriado.",
        ],
      },
      {
        titulo: "DEPOIS — Acompanhamento",
        janela: "Até 6 meses",
        itens: [
          "Monitorização da frequência de episódios e revisão da estratégia.",
          "Reavaliação para descalonar antibiótico assim que possível.",
        ],
      },
    ],
    seguimento: [
      { quando: "Mês 1", acao: "Revisão da adesão e tolerância às medidas." },
      { quando: "Mês 3", acao: "Avaliação de recorrências e ajuste da profilaxia." },
      { quando: "Mês 6", acao: "Reavaliação global e plano de manutenção / desescalonamento." },
    ],
    alertas: [
      "Febre alta com dor lombar (suspeita de pielonefrite), vômitos ou hematúria importante.",
    ],
    fontes: [
      "AUA Recurrent uUTI Guideline; EAU Guidelines on Urological Infections (profilaxia, cranberry, D-manose).",
    ],
  },
);

/** Categorias na ordem de exibição do seletor. */
export const CATEGORIAS_JORNADA: Jornada["categoria"][] = [
  "Andrologia & Sexual",
  "Fertilidade & Microcirurgia",
  "Urologia Geral",
  "Hormônios",
];
