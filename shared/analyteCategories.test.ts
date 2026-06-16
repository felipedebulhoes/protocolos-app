import { describe, it, expect } from "vitest";
import {
  ANALYTE_DEFS,
  CATEGORY_LABELS,
  categoryForAnalyte,
  analyteLabel,
  getAnalyteDef,
} from "./analyteCategories";

describe("analyteCategories", () => {
  it("maps known analyte keys to their category", () => {
    expect(categoryForAnalyte("psa_total")).toBe("prostata");
    expect(categoryForAnalyte("testosterona_total")).toBe("hormonal");
    expect(categoryForAnalyte("concentracao_esperm")).toBe("seminal");
  });

  it("falls back to 'outro' for unknown keys", () => {
    expect(categoryForAnalyte("chave_inexistente")).toBe("outro");
  });

  it("returns a human label for known keys and echoes unknown keys", () => {
    expect(analyteLabel("psa_total")).toBe("PSA Total");
    expect(analyteLabel("chave_inexistente")).toBe("chave_inexistente");
  });

  it("has a label for every category used by the defs", () => {
    for (const def of ANALYTE_DEFS) {
      expect(CATEGORY_LABELS[def.category]).toBeTruthy();
    }
  });

  it("getAnalyteDef returns full definition or undefined", () => {
    expect(getAnalyteDef("psa_total")?.unit).toBe("ng/mL");
    expect(getAnalyteDef("nope")).toBeUndefined();
  });

  it("has no duplicate analyte keys", () => {
    const keys = ANALYTE_DEFS.map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
