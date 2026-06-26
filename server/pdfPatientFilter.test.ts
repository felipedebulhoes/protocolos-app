import { describe, it, expect } from "vitest";
import {
  buildPatientSections,
  isInternalTitle,
  isCareJourneySection,
  isJourneyIntroSection,
  sanitizeJourneyContent,
  type ProtocolSection,
} from "../shared/pdfPatientFilter";
import protocols from "../client/src/data/protocols.json";

type Protocol = { id: string; title: string; sections: ProtocolSection[] };
const allProtocols = protocols as unknown as Protocol[];

describe("pdfPatientFilter — classificação de títulos", () => {
  it("marca seções internas corretamente", () => {
    expect(isInternalTitle("Script da Secretaria & Contorno de Objeções")).toBe(true);
    expect(isInternalTitle("5. REFERÊNCIAS")).toBe(true);
    expect(isInternalTitle("2. TÉCNICA CIRÚRGICA PADRÃO-OURO")).toBe(true);
    expect(isInternalTitle("3. CÁLCULO DE ANESTÉSICO (LIMITE CLINOVI)")).toBe(true);
    expect(isInternalTitle("4. MODELO DE PRESCRIÇÃO PÓS-OPERATÓRIA")).toBe(true);
    expect(isInternalTitle("TCLE - Implante de Prótese Peniana")).toBe(true);
    expect(isInternalTitle("4. MODELOS DE PRÓTESE SEMIRRÍGIDA DISPONÍVEIS")).toBe(true);
  });

  it("NÃO marca seções voltadas ao paciente como internas", () => {
    expect(isInternalTitle("1. JORNADA DO PACIENTE PREMIUM (CPP)")).toBe(false);
    expect(isInternalTitle("3. MEDICINA DE ESTILO DE VIDA (MEV) APLICADA")).toBe(false);
    expect(isInternalTitle("Linha de Cuidado Integral — Jornada Completa")).toBe(false);
    expect(isInternalTitle("Plano de Acompanhamento Premium — Jornada Completa")).toBe(false);
  });

  it("identifica seções de Linha de Cuidado / Acompanhamento Premium", () => {
    expect(isCareJourneySection("Linha de Cuidado Integral — Jornada Completa")).toBe(true);
    expect(isCareJourneySection("Plano de Acompanhamento Premium — Jornada Clínica Continuada")).toBe(true);
    expect(isCareJourneySection("3. MEDICINA DE ESTILO DE VIDA (MEV) APLICADA")).toBe(false);
  });

  it("identifica a seção de abertura CPP", () => {
    expect(isJourneyIntroSection("1. JORNADA DO PACIENTE PREMIUM (CPP)")).toBe(true);
    expect(isJourneyIntroSection("2. TÉCNICA CIRÚRGICA")).toBe(false);
  });
});

describe("pdfPatientFilter — sanitização da CPP", () => {
  const cpp = `O paciente vive um sofrimento silencioso e merece acolhimento sem julgamento.

### 1.1 Primeiro Contato e Agendamento
*   **Rapport de Acolhimento:**
    > *"Olá, [Nome]. Vamos agendar sua consulta."*

### 1.3 Quebra Ativa de Objeções (Antecipação)
*   **Objeção 1: "Vou ficar dependente do remédio?"**
    > *"Não necessariamente, [Nome]."*`;

  it("mantém a narrativa inicial e remove rapport/objeções/scripts", () => {
    const out = sanitizeJourneyContent(cpp);
    expect(out).toContain("sofrimento silencioso");
    expect(out.toLowerCase()).not.toContain("rapport");
    expect(out.toLowerCase()).not.toContain("objeç");
    expect(out.toLowerCase()).not.toContain("quebra ativa");
    expect(out).not.toContain("[Nome]");
    expect(out.toLowerCase()).not.toContain("primeiro contato");
  });
});

describe("pdfPatientFilter — integridade contra os 73 protocolos reais", () => {
  it("NENHUM PDF de paciente inclui seções internas (secretaria/referências/prescrição/técnica/anestésico/TCLE)", () => {
    for (const p of allProtocols) {
      if (!Array.isArray(p.sections)) continue;
      const patientSections = buildPatientSections(p.sections);
      for (const s of patientSections) {
        expect(s.is_secretary, `${p.id}: vazou seção is_secretary`).not.toBe(true);
        expect(s.is_references, `${p.id}: vazou seção is_references`).not.toBe(true);
        expect(s.is_prescription, `${p.id}: vazou seção is_prescription`).not.toBe(true);
        expect(isInternalTitle(s.title || ""), `${p.id}: vazou título interno "${s.title}"`).toBe(false);
      }
    }
  });

  it("NENHUM conteúdo de paciente contém scripts de rapport/objeções residuais", () => {
    const forbidden = [
      "rapport de acolhimento",
      "contorno de obje",
      "quebra ativa de obje",
      "frase de alinhamento",
      "script de abordagem",
    ];
    for (const p of allProtocols) {
      if (!Array.isArray(p.sections)) continue;
      const patientSections = buildPatientSections(p.sections);
      for (const s of patientSections) {
        const content = (s.content || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        for (const term of forbidden) {
          expect(content.includes(term), `${p.id}/"${s.title}": contém termo proibido "${term}"`).toBe(false);
        }
      }
    }
  });

  it("protocolos com Linha de Cuidado/Acompanhamento Premium preservam essa seção no PDF", () => {
    let checked = 0;
    for (const p of allProtocols) {
      if (!Array.isArray(p.sections)) continue;
      const hasCare = p.sections.some(s => isCareJourneySection(s.title || ""));
      if (!hasCare) continue;
      const patientSections = buildPatientSections(p.sections);
      const carePreserved = patientSections.some(s => isCareJourneySection(s.title || ""));
      expect(carePreserved, `${p.id}: perdeu a seção de Linha de Cuidado no PDF`).toBe(true);
      checked++;
    }
    // Garante que o teste realmente exercitou protocolos reais
    expect(checked).toBeGreaterThan(10);
  });

  it("cada PDF de paciente tem ao menos uma seção de conteúdo", () => {
    for (const p of allProtocols) {
      if (!Array.isArray(p.sections) || p.sections.length === 0) continue;
      const patientSections = buildPatientSections(p.sections);
      expect(patientSections.length, `${p.id}: PDF de paciente ficou vazio`).toBeGreaterThan(0);
    }
  });
});
