import { describe, it, expect } from "vitest";
import protocols from "../client/src/data/protocols.json";

describe("Integridade dos protocolos", () => {
  it("todos os protocolos têm campos essenciais", () => {
    for (const p of protocols as any[]) {
      expect(p.id, `id ausente em ${p.title}`).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(Array.isArray(p.sections)).toBe(true);
    }
  });

  it("nenhum protocolo tem seção de Acompanhamento Premium duplicada", () => {
    for (const p of protocols as any[]) {
      const premiumSections = (p.sections as any[]).filter((s) =>
        /acompanhamento premium/i.test(s.title || "")
      );
      expect(
        premiumSections.length,
        `Protocolo "${p.title}" tem ${premiumSections.length} blocos premium`
      ).toBeLessThanOrEqual(1);
    }
  });

  it("o protocolo de prótese peniana possui seções clínicas para impressão", () => {
    const protese = (protocols as any[]).find(
      (p) => p.id === "1_implante_protese_peniana"
    );
    expect(protese).toBeDefined();
    const clinical = (protese.sections as any[]).filter(
      (s) =>
        !s.is_secretary &&
        !s.is_references &&
        !/técnica cirúrgica|tecnica cirurgica/i.test(s.title || "")
    );
    expect(clinical.length).toBeGreaterThan(0);
  });

  it("cada seção clínica tem título e conteúdo", () => {
    for (const p of protocols as any[]) {
      for (const s of p.sections as any[]) {
        expect(s.title, `Seção sem título em ${p.title}`).toBeTruthy();
        expect(typeof s.content).toBe("string");
      }
    }
  });
});
