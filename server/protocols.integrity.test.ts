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

  it("os 4 novos protocolos de mentoria estão presentes", () => {
    const ids = (protocols as any[]).map((p) => p.id);
    for (const id of [
      "sindrome_metabolica_saude_masculina",
      "toxina_botulinica_estetica_genital",
      "escrotoplastia_estetica",
      "glandulas_tyson_laser",
    ]) {
      expect(ids, `Protocolo ${id} ausente`).toContain(id);
    }
  });

  it("nenhum protocolo tem seção de Linha de Cuidado duplicada", () => {
    for (const p of protocols as any[]) {
      const linha = (p.sections as any[]).filter((s) =>
        /linha de cuidado/i.test(s.title || "")
      );
      expect(
        linha.length,
        `Protocolo "${p.title}" tem ${linha.length} blocos de Linha de Cuidado`
      ).toBeLessThanOrEqual(1);
    }
  });

  it("cada seção clínica tem título e conteúdo", () => {
    for (const p of protocols as any[]) {
      for (const s of p.sections as any[]) {
        expect(s.title, `Seção sem título em ${p.title}`).toBeTruthy();
        expect(typeof s.content).toBe("string");
      }
    }
  });

  it("nenhum protocolo contém placeholder de CRM/RQE (XXXXX)", () => {
    for (const p of protocols as any[]) {
      const blob = JSON.stringify(p);
      expect(
        blob.includes("XXXXX"),
        `Protocolo "${p.title}" ainda contém placeholder XXXXX (CRM/RQE não preenchido)`
      ).toBe(false);
    }
  });

  it("nenhum protocolo contém o CRM antigo incorreto (241.135)", () => {
    for (const p of protocols as any[]) {
      const blob = JSON.stringify(p);
      expect(
        blob.includes("241.135"),
        `Protocolo "${p.title}" contém CRM incorreto 241.135`
      ).toBe(false);
    }
  });

  it("toda assinatura de receituário usa o CRM/RQE reais do Dr. Felipe", () => {
    for (const p of protocols as any[]) {
      const blob = JSON.stringify(p);
      // Se menciona CRM-SP, deve ser o número real
      if (blob.includes("CRM-SP")) {
        expect(
          blob.includes("CRM-SP 202291"),
          `Protocolo "${p.title}" menciona CRM-SP mas não o número real 202291`
        ).toBe(true);
      }
      // Se menciona RQE, deve ser o número real de Urologia
      if (/RQE\s/.test(blob)) {
        expect(
          blob.includes("RQE 146538"),
          `Protocolo "${p.title}" menciona RQE mas não o número real 146538`
        ).toBe(true);
      }
    }
  });
});
