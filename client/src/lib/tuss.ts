import procedimentosRaw from "@/data/tuss_procedimentos.json";
import opmeRaw from "@/data/tuss_opme.json";

export interface TussProcedure {
  codigo: string;
  termo: string;
}

export interface TussOpme {
  codigo: string;
  termo: string;
  fabricante?: string;
  categoria?: string;
}

export const tussProcedures = procedimentosRaw as TussProcedure[];
export const tussOpme = opmeRaw as TussOpme[];

/** Normaliza texto para busca (remove acentos, caixa baixa). */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Busca procedimentos TUSS por termo ou código (máx. `limit`). */
export function searchProcedures(query: string, limit = 20): TussProcedure[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: TussProcedure; score: number }[] = [];
  for (const item of tussProcedures) {
    const hay = norm(item.termo) + " " + item.codigo;
    if (tokens.every((t) => hay.includes(t))) {
      // pontuação simples: começa com o termo > contém
      const score = norm(item.termo).startsWith(tokens[0]) ? 0 : 1;
      scored.push({ item, score });
    }
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/** Busca OPME por termo, fabricante, categoria ou código (máx. `limit`). */
export function searchOpme(query: string, limit = 20): TussOpme[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { item: TussOpme; score: number }[] = [];
  for (const item of tussOpme) {
    const hay =
      norm(item.termo) +
      " " +
      norm(item.fabricante || "") +
      " " +
      norm(item.categoria || "") +
      " " +
      item.codigo;
    if (tokens.every((t) => hay.includes(t))) {
      const score = norm(item.termo).startsWith(tokens[0]) ? 0 : 1;
      scored.push({ item, score });
    }
  }
  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/** Lista as categorias de OPME disponíveis. */
export function opmeCategories(): string[] {
  const set = new Set<string>();
  for (const o of tussOpme) if (o.categoria) set.add(o.categoria);
  return Array.from(set).sort();
}
