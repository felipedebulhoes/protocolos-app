import { describe, it, expect } from "vitest";
import { buildEvolutionSeries, type EvolutionResultInput } from "./examEvolution";

const base = { unit: "ng/mL", createdAt: "2026-01-01T00:00:00Z" };

describe("buildEvolutionSeries", () => {
  it("keeps only analytes with 2+ dated numeric points", () => {
    const results: EvolutionResultInput[] = [
      { ...base, analyteKey: "psa_total", valueNum: 1.2, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "psa_total", valueNum: 2.8, measuredAt: "2025-01-20" },
      // single point -> excluded
      { ...base, analyteKey: "creatinina", valueNum: 0.9, measuredAt: "2025-01-20" },
    ];
    const series = buildEvolutionSeries(results);
    expect(series).toHaveLength(1);
    expect(series[0].key).toBe("psa_total");
    expect(series[0].points).toHaveLength(2);
  });

  it("ignores non-numeric values and undated rows", () => {
    const results: EvolutionResultInput[] = [
      { ...base, analyteKey: "psa_total", valueNum: 1.2, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "psa_total", valueNum: null, measuredAt: "2025-01-20" },
      { ...base, analyteKey: "psa_total", valueNum: 3.0, measuredAt: null, createdAt: "invalid-date" },
    ];
    const series = buildEvolutionSeries(results);
    // only one valid numeric+dated point remains -> below threshold -> excluded
    expect(series).toHaveLength(0);
  });

  it("sorts points chronologically regardless of input order", () => {
    const results: EvolutionResultInput[] = [
      { ...base, analyteKey: "psa_total", valueNum: 5.1, measuredAt: "2026-01-10" },
      { ...base, analyteKey: "psa_total", valueNum: 1.2, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "psa_total", valueNum: 2.8, measuredAt: "2025-01-20" },
    ];
    const [psa] = buildEvolutionSeries(results);
    expect(psa.points.map((p) => p.value)).toEqual([1.2, 2.8, 5.1]);
    expect(psa.points[0].t).toBeLessThan(psa.points[2].t);
  });

  it("orders series with urology priority first", () => {
    const results: EvolutionResultInput[] = [
      { ...base, analyteKey: "glicose", valueNum: 90, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "glicose", valueNum: 95, measuredAt: "2025-01-15" },
      { ...base, analyteKey: "testosterona_total", valueNum: 420, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "testosterona_total", valueNum: 380, measuredAt: "2025-01-15" },
      { ...base, analyteKey: "psa_total", valueNum: 1.2, measuredAt: "2024-01-15" },
      { ...base, analyteKey: "psa_total", valueNum: 2.8, measuredAt: "2025-01-15" },
    ];
    const series = buildEvolutionSeries(results);
    expect(series.map((s) => s.key)).toEqual(["psa_total", "testosterona_total", "glicose"]);
  });
});
