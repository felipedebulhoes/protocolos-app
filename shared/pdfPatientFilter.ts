// Funções puras para decidir e higienizar o conteúdo que vai para o PDF do PACIENTE.
// Regra central: NUNCA vazar conteúdo interno (script da secretaria, rapport/abordagem,
// contorno de objeções, referências científicas, modelos de prescrição, técnica cirúrgica,
// cálculo de anestésico, TCLE). MOSTRAR apenas o que conquista o paciente: a narrativa de
// acolhimento da CPP, a Medicina de Estilo de Vida (MEV) e a Linha de Cuidado Integral.

export interface ProtocolSection {
  title?: string;
  content?: string;
  is_secretary?: boolean;
  is_references?: boolean;
  is_prescription?: boolean;
  is_mev?: boolean;
  [key: string]: unknown;
}

// Normaliza texto para comparação (remove acentos e caixa)
export const normalizeText = (s: string): string =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Seções de destaque (jornada completa de cuidado)
export const isCareJourneySection = (title: string): boolean => {
  const t = normalizeText(title);
  return (
    t.includes("linha de cuidado") ||
    t.includes("acompanhamento premium") ||
    t.includes("jornada completa")
  );
};

// Seção de abertura (Jornada do Paciente Premium / CPP) que precisa ser higienizada
export const isJourneyIntroSection = (title: string): boolean => {
  const t = normalizeText(title);
  return t.includes("jornada do paciente premium") || t.includes("(cpp)");
};

// Títulos de seções INTERNAS que nunca devem aparecer no PDF do paciente
export const isInternalTitle = (title: string): boolean => {
  const t = normalizeText(title);
  return (
    t.includes("secretaria") ||
    t.includes("contorno de objec") ||
    t.includes("objecoes") ||
    t.includes("referencia") ||
    t.includes("tecnica cirurgica") ||
    t.includes("calculo de anestesico") ||
    t.includes("anestesico") ||
    t.includes("modelo de prescric") ||
    t.includes("prescricao") ||
    t.includes("receituario") ||
    t.includes("tcle") ||
    t.includes("termo de consentimento") ||
    t.includes("modelos de protese") ||
    t.includes("modelo de protese")
  );
};

// Remove blocos internos (rapport, scripts, objeções) do conteúdo da seção de abertura CPP,
// preservando apenas a narrativa empática inicial que conquista o paciente.
export const sanitizeJourneyContent = (content: string): string => {
  if (!content) return "";
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    const t = normalizeText(line);
    const isHeading = /^\s*#{1,6}\s+/.test(line);
    if (
      isHeading &&
      (t.includes("primeiro contato") ||
        t.includes("agendamento") ||
        t.includes("abertura da consulta") ||
        t.includes("rapport") ||
        t.includes("quebra ativa") ||
        t.includes("objec") ||
        t.includes("script") ||
        t.includes("alinhamento de identidade") ||
        t.includes("conexao"))
    ) {
      break;
    }
    if (/^\s*>/.test(line) && /\[nome\]|\bnome\b/i.test(line)) continue;
    if (t.includes("rapport de acolhimento") || t.includes("frase de alinhamento")) continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};

// Aplica todo o pipeline: filtra seções internas e higieniza a CPP.
// Retorna apenas as seções (já tratadas) que devem ir para o PDF do paciente.
export const buildPatientSections = (sections: ProtocolSection[]): ProtocolSection[] => {
  return (sections || [])
    .filter(
      s =>
        !s.is_secretary &&
        !s.is_references &&
        !s.is_prescription &&
        !isInternalTitle(s.title || "")
    )
    .map(s => {
      if (isJourneyIntroSection(s.title || "")) {
        return { ...s, content: sanitizeJourneyContent(s.content || "") };
      }
      return s;
    })
    .filter(s => (s.content || "").trim().length > 0);
};
