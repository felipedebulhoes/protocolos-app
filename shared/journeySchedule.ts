// Helpers puros para o "Cronograma da Jornada" no PDF do paciente.
// 1) Identificar a seção de cronograma.
// 2) Dada a data do procedimento, anexar a data real estimada a cada marcador de tempo
//    da coluna "Momento" da tabela (ex.: "Semana 6" -> "Semana 6 (≈ 07/08/2026)").
//
// Regras de cálculo (a partir da data do procedimento = dia 0):
//   - "N h" / "N hora(s)"        -> + N horas
//   - "Dia N" / "D+N" / "N dia"  -> + N dias
//   - "Semana N"                 -> + N*7 dias
//   - "Mês N" / "Mes N"          -> + N meses (calendário)
//   - Intervalos ("Semana 4–6", "Mês 3-6", "Semana 1–2"): usa o LIMITE INICIAL.
//   - Rótulos sem tempo ("Durante o ciclo", "Após confirmação"): inalterados.

export const isJourneyTimelineSection = (title: string): boolean => {
  const t = (title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return t.includes("cronograma da jornada");
};

const pad = (n: number) => String(n).padStart(2, "0");

export const formatDateBR = (d: Date): string =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

const addDays = (base: Date, days: number): Date => {
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + days);
  return d;
};

const addMonths = (base: Date, months: number): Date => {
  const d = new Date(base.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Corrige overflow de mês (ex.: 31/01 + 1 mês não vira 03/03)
  if (d.getDate() < day) d.setDate(0);
  return d;
};

// Extrai o primeiro número (limite inicial em intervalos) de um trecho.
const firstNumber = (s: string): number | null => {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

/**
 * Calcula a data real para um rótulo de "Momento". Retorna null se o rótulo
 * não tiver componente temporal calculável (ex.: "Durante o ciclo").
 */
export const computeMomentDate = (label: string, procedureDate: Date): Date | null => {
  const raw = (label || "").trim();
  const t = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  // Horas: "48 h", "24 horas"
  if (/\b\d+\s*h(oras?)?\b/.test(t)) {
    const n = firstNumber(t);
    if (n != null) return addDays(procedureDate, Math.round(n / 24));
  }
  // Semanas: "semana 6", "semana 4-6", "semana 1 2"
  if (/\bsemanas?\b/.test(t)) {
    const n = firstNumber(t);
    if (n != null) return addDays(procedureDate, n * 7);
  }
  // Meses: "mes 3", "mes 12 e anual", "mes 3 6"
  if (/\bmes(es)?\b/.test(t)) {
    const n = firstNumber(t);
    if (n != null) return addMonths(procedureDate, n);
  }
  // Dias: "dia 1", "d+7", "7 dias"
  if (/\bdias?\b/.test(t) || /\bd\s*\+\s*\d+/.test(t)) {
    const n = firstNumber(t);
    if (n != null) return addDays(procedureDate, n);
  }
  return null;
};

/**
 * Recebe o markdown da seção de cronograma e a data do procedimento (ISO yyyy-mm-dd).
 * Anexa a data real estimada a cada célula "Momento" que tenha componente temporal.
 * Idempotente: não duplica se já houver "(≈".
 */
export const applyRealDatesToTimeline = (
  markdown: string,
  procedureDateISO: string,
): string => {
  if (!markdown || !procedureDateISO) return markdown;
  const procedureDate = new Date(procedureDateISO + "T00:00:00");
  if (isNaN(procedureDate.getTime())) return markdown;

  const lines = markdown.split(/\r?\n/);
  const out = lines.map(line => {
    // Linha de tabela cujo primeiro campo está em negrito: | **Semana 6** | ... |
    const m = line.match(/^(\s*\|\s*)\*\*(.+?)\*\*(\s*\|)/);
    if (!m) return line;
    const label = m[2];
    if (label.includes("(≈")) return line; // já anotado
    const d = computeMomentDate(label, procedureDate);
    if (!d) return line;
    const annotated = `**${label} (≈ ${formatDateBR(d)})**`;
    return line.replace(/\*\*(.+?)\*\*/, annotated);
  });
  return out.join("\n");
};
