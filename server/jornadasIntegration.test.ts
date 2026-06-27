import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Garante que o conteúdo das jornadas foi integrado aos protocolos existentes
// (sem página separada) e sem duplicação.

const protocols = JSON.parse(
  readFileSync(resolve(__dirname, "../client/src/data/protocols.json"), "utf-8"),
) as Array<{ id: string; sections?: Array<{ title?: string; content?: string; is_journey?: boolean }> }>;

const SECTION_TITLE = "📅 Cronograma da Jornada (Resumo) & Sinais de Alerta";

// Pelo menos um protocolo por jornada deve conter a seção integrada.
const TARGET_IDS = [
  "1_implante_protese_peniana",
  "2_varicocelectomia",
  "6_vasectomia_sem_bisturi",
  "5b_reversao_vasectomia",
  "5_micro_tese",
  "21_li_eswt_ondas_choque",
  "11_circuncisao_frenuloplastia",
  "27_litiase_renal",
  "13_hpb_manejo_completo",
  "8_trt_performance",
  "28_incontinencia_urinaria",
  "29_itu_repeticao",
];

const byId = new Map(protocols.map(p => [p.id, p]));

describe("Integração das jornadas nos protocolos", () => {
  it("os 12 protocolos-alvo possuem a seção de cronograma da jornada", () => {
    for (const id of TARGET_IDS) {
      const p = byId.get(id);
      expect(p, `protocolo ausente: ${id}`).toBeTruthy();
      const sec = (p!.sections || []).filter(s => s.title === SECTION_TITLE);
      expect(sec.length, `${id} deveria ter exatamente 1 seção de jornada`).toBe(1);
    }
  });

  it("a seção de jornada nunca aparece duplicada em nenhum protocolo", () => {
    for (const p of protocols) {
      const count = (p.sections || []).filter(s => s.title === SECTION_TITLE).length;
      expect(count, `${p.id} tem ${count} seções de jornada (esperado <= 1)`).toBeLessThanOrEqual(1);
    }
  });

  it("a seção de jornada contém tabela de seguimento e sinais de alerta", () => {
    for (const id of TARGET_IDS) {
      const sec = (byId.get(id)!.sections || []).find(s => s.title === SECTION_TITLE)!;
      expect(sec.content || "").toContain("| Momento |");
      expect(sec.content || "").toContain("Sinais de alerta");
      expect(sec.content || "").toContain("Fontes:");
    }
  });

  it("mantém 73 protocolos no catálogo (sem criar novos)", () => {
    expect(protocols.length).toBe(73);
  });
});
