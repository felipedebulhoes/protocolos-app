import { describe, it, expect } from "vitest";
import {
  isJourneyTimelineSection,
  computeMomentDate,
  applyRealDatesToTimeline,
  formatDateBR,
} from "./journeySchedule";

describe("journeySchedule", () => {
  it("identifica a seção de cronograma da jornada (com/sem acento e emoji)", () => {
    expect(isJourneyTimelineSection("📅 Cronograma da Jornada (Resumo) & Sinais de Alerta")).toBe(true);
    expect(isJourneyTimelineSection("Cronograma da jornada")).toBe(true);
    expect(isJourneyTimelineSection("Referências")).toBe(false);
  });

  const proc = new Date("2026-07-01T00:00:00");

  it("calcula horas como dias arredondados", () => {
    expect(formatDateBR(computeMomentDate("48 h", proc)!)).toBe("03/07/2026");
    expect(formatDateBR(computeMomentDate("24 horas", proc)!)).toBe("02/07/2026");
  });

  it("calcula semanas a partir do procedimento", () => {
    expect(formatDateBR(computeMomentDate("Semana 6", proc)!)).toBe("12/08/2026");
    expect(formatDateBR(computeMomentDate("Semana 2", proc)!)).toBe("15/07/2026");
  });

  it("usa o limite inicial em intervalos de semana", () => {
    expect(formatDateBR(computeMomentDate("Semana 4–6", proc)!)).toBe("29/07/2026");
    expect(formatDateBR(computeMomentDate("Semana 1–2", proc)!)).toBe("08/07/2026");
  });

  it("calcula meses por calendário", () => {
    expect(formatDateBR(computeMomentDate("Mês 3", proc)!)).toBe("01/10/2026");
    expect(formatDateBR(computeMomentDate("Mês 12 e anual", proc)!)).toBe("01/07/2027");
    expect(formatDateBR(computeMomentDate("Mês 3–6", proc)!)).toBe("01/10/2026");
  });

  it("calcula dias (Dia N / D+N)", () => {
    expect(formatDateBR(computeMomentDate("Dia 1", proc)!)).toBe("02/07/2026");
    expect(formatDateBR(computeMomentDate("D+7", proc)!)).toBe("08/07/2026");
  });

  it("retorna null para rótulos sem componente temporal", () => {
    expect(computeMomentDate("Durante o ciclo", proc)).toBeNull();
    expect(computeMomentDate("Após confirmação", proc)).toBeNull();
  });

  it("anota a tabela com datas reais e é idempotente", () => {
    const md = [
      "| Momento | O que é avaliado/feito |",
      "|---|---|",
      "| **Semana 2** | Revisão da ferida. |",
      "| **Mês 3** | Avaliação hormonal. |",
      "| **Durante o ciclo** | Acompanhamento. |",
    ].join("\n");
    const once = applyRealDatesToTimeline(md, "2026-07-01");
    expect(once).toContain("**Semana 2 (≈ 15/07/2026)**");
    expect(once).toContain("**Mês 3 (≈ 01/10/2026)**");
    expect(once).toContain("**Durante o ciclo**"); // inalterado
    // idempotência
    const twice = applyRealDatesToTimeline(once, "2026-07-01");
    expect(twice).toBe(once);
  });

  it("sem data do procedimento, retorna o markdown original", () => {
    const md = "| **Semana 2** | x |";
    expect(applyRealDatesToTimeline(md, "")).toBe(md);
  });
});
