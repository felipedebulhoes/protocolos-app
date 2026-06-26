import { describe, it, expect } from "vitest";
import { JORNADAS, CATEGORIAS_JORNADA, type Jornada } from "./jornadas";

const IDS_ESPERADOS = [
  "protese-peniana",
  "varicocelectomia",
  "vasectomia",
  "reversao-vasectomia",
  "microtese",
  "li-eswt-prp",
  "postectomia-frenuloplastia",
  "litiase",
  "hpb",
  "trt",
  "incontinencia",
  "itu-repeticao",
];

describe("Dados das Jornadas Premium", () => {
  it("contém exatamente as 12 jornadas esperadas", () => {
    expect(JORNADAS).toHaveLength(12);
    const ids = JORNADAS.map((j) => j.id).sort();
    expect(ids).toEqual([...IDS_ESPERADOS].sort());
  });

  it("não possui IDs duplicados", () => {
    const ids = JORNADAS.map((j) => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda jornada tem campos obrigatórios preenchidos", () => {
    for (const j of JORNADAS) {
      expect(j.nome.trim().length).toBeGreaterThan(0);
      expect(j.resumo.trim().length).toBeGreaterThan(0);
      expect(CATEGORIAS_JORNADA).toContain(j.categoria);
      expect(["Cirúrgico", "Procedimento", "Clínico"]).toContain(j.tipo);
    }
  });

  it("toda jornada tem 3 fases (ANTES/DURANTE/DEPOIS) com itens", () => {
    for (const j of JORNADAS) {
      expect(j.fases).toHaveLength(3);
      for (const f of j.fases) {
        expect(f.titulo.trim().length).toBeGreaterThan(0);
        expect(f.janela.trim().length).toBeGreaterThan(0);
        expect(f.itens.length).toBeGreaterThan(0);
      }
    }
  });

  it("toda jornada tem cronograma, alertas e fontes", () => {
    for (const j of JORNADAS) {
      expect(j.seguimento.length).toBeGreaterThan(0);
      for (const s of j.seguimento) {
        expect(s.quando.trim().length).toBeGreaterThan(0);
        expect(s.acao.trim().length).toBeGreaterThan(0);
      }
      expect(j.alertas.length).toBeGreaterThan(0);
      expect(j.fontes.length).toBeGreaterThan(0);
    }
  });

  it("destaca os procedimentos mais comuns", () => {
    const destaques = JORNADAS.filter((j: Jornada) => j.destaque).map((j) => j.id);
    // Procedimentos de alta frequência na prática uro/andrológica
    for (const id of ["protese-peniana", "vasectomia", "litiase", "hpb", "trt"]) {
      expect(destaques).toContain(id);
    }
  });
});
