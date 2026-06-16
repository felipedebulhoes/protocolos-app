/**
 * Pure helpers for building exam-evolution chart series.
 * Extracted from the chart component so the grouping/filtering/ordering
 * logic can be unit-tested without rendering recharts.
 */

export type EvolutionResultInput = {
  analyteKey: string;
  valueNum: number | null;
  unit: string | null;
  measuredAt: string | null;
  createdAt: Date | string;
};

export type SeriesPoint = {
  /** ms timestamp for sorting / axis */
  t: number;
  /** pre-formatted dd/mm/yy label */
  label: string;
  value: number;
};

export type AnalyteSeries = {
  key: string;
  unit: string | null;
  points: SeriesPoint[];
};

/** Urology-relevant markers shown first. */
export const EVOLUTION_PRIORITY = [
  "psa_total",
  "psa_livre",
  "testosterona_total",
  "testosterona_livre",
];

export function parseResultDate(r: EvolutionResultInput): number {
  if (r.measuredAt) {
    const d = new Date(r.measuredAt);
    if (!Number.isNaN(d.getTime())) return d.getTime();
  }
  const c = new Date(r.createdAt);
  return Number.isNaN(c.getTime()) ? 0 : c.getTime();
}

export function formatPtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

/**
 * Group numeric, dated results by analyte. Keeps only analytes with >= 2
 * dated points, sorts each series chronologically, and orders series by the
 * urology priority list (then alphabetically by remaining keys).
 */
export function buildEvolutionSeries(results: EvolutionResultInput[]): AnalyteSeries[] {
  const byAnalyte = new Map<string, { unit: string | null; points: SeriesPoint[] }>();
  for (const r of results) {
    if (r.valueNum == null || Number.isNaN(r.valueNum)) continue;
    const ts = parseResultDate(r);
    if (!ts) continue;
    if (!byAnalyte.has(r.analyteKey)) byAnalyte.set(r.analyteKey, { unit: r.unit, points: [] });
    byAnalyte.get(r.analyteKey)!.points.push({ t: ts, label: formatPtDate(ts), value: r.valueNum });
  }

  const out: AnalyteSeries[] = [];
  Array.from(byAnalyte.entries()).forEach(([key, { unit, points }]) => {
    if (points.length < 2) return;
    points.sort((a: SeriesPoint, b: SeriesPoint) => a.t - b.t);
    out.push({ key, unit, points });
  });

  out.sort((a, b) => {
    const pa = EVOLUTION_PRIORITY.indexOf(a.key);
    const pb = EVOLUTION_PRIORITY.indexOf(b.key);
    return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
  });

  return out;
}
