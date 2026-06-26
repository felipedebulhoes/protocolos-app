import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Testes de integridade das bases TUSS/OPME usadas no gerador de orçamentos.
 * As bases são derivadas do Padrão TISS oficial (ANS) — versão 202605.
 */

interface TussProcedure {
  codigo: string;
  termo: string;
}
interface TussOpme {
  codigo: string;
  termo: string;
  fabricante?: string;
  categoria?: string;
}

const dataDir = resolve(__dirname, "../client/src/data");
const procedimentos = JSON.parse(
  readFileSync(resolve(dataDir, "tuss_procedimentos.json"), "utf-8"),
) as TussProcedure[];
const opme = JSON.parse(
  readFileSync(resolve(dataDir, "tuss_opme.json"), "utf-8"),
) as TussOpme[];

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function search<T extends { codigo: string; termo: string }>(
  base: T[],
  query: string,
  limit = 20,
): T[] {
  const q = norm(query);
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return base
    .filter((item) => {
      const hay = norm(item.termo) + " " + item.codigo;
      return tokens.every((t) => hay.includes(t));
    })
    .slice(0, limit);
}

describe("Base TUSS de procedimentos", () => {
  it("contém um volume razoável de procedimentos", () => {
    expect(procedimentos.length).toBeGreaterThan(100);
  });

  it("todo item tem código numérico e termo não-vazio", () => {
    for (const p of procedimentos) {
      expect(p.codigo, `código vazio em ${JSON.stringify(p)}`).toMatch(/^\d+$/);
      expect(p.termo.trim().length).toBeGreaterThan(0);
    }
  });

  it("não há códigos TUSS duplicados", () => {
    const codigos = procedimentos.map((p) => p.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it("encontra procedimentos urológicos por termo (próstata, varicocele)", () => {
    expect(search(procedimentos, "prostata").length).toBeGreaterThan(0);
    expect(search(procedimentos, "varicocele").length).toBeGreaterThan(0);
  });

  it("encontra procedimento por código exato", () => {
    const algum = procedimentos[0];
    const achado = search(procedimentos, algum.codigo);
    expect(achado.some((p) => p.codigo === algum.codigo)).toBe(true);
  });
});

describe("Base OPME", () => {
  it("contém itens de OPME", () => {
    expect(opme.length).toBeGreaterThan(10);
  });

  it("todo item tem código e termo válidos", () => {
    for (const o of opme) {
      expect(o.codigo, `código vazio em ${JSON.stringify(o)}`).toMatch(/^\d+$/);
      expect(o.termo.trim().length).toBeGreaterThan(0);
    }
  });

  it("não há códigos OPME duplicados", () => {
    const codigos = opme.map((o) => o.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it("encontra prótese peniana na base de OPME", () => {
    const achado = search(opme, "protese peniana");
    expect(achado.length).toBeGreaterThan(0);
  });
});
