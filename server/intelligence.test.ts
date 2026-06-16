import { describe, it, expect } from "vitest";
import { scoreProtocols } from "./intelligence";

describe("scoreProtocols", () => {
  it("returns empty array when there are no matchable answers", () => {
    expect(scoreProtocols({})).toEqual([]);
    expect(scoreProtocols({ fullName: "Fulano", email: "a@b.com" })).toEqual([]);
  });

  it("matches an andrology protocol from erectile dysfunction symptoms", () => {
    const res = scoreProtocols({
      mainComplaint: "tenho dificuldade de ereção há meses",
      symptoms: ["disfuncao eretil", "libido"],
    });
    expect(res.length).toBeGreaterThan(0);
    // Every suggestion must carry a positive score and at least one matched keyword.
    for (const s of res) {
      expect(s.score).toBeGreaterThan(0);
      expect(s.matchedKeywords.length).toBeGreaterThan(0);
      expect(typeof s.title).toBe("string");
    }
  });

  it("returns results sorted by descending score", () => {
    const res = scoreProtocols({
      mainComplaint: "infertilidade e vontade de ter filhos, varicocele",
      symptoms: ["infertilidade"],
      wantsChildren: "sim",
    });
    const scores = res.map((r) => r.score);
    const sorted = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sorted);
  });

  it("respects the limit parameter", () => {
    const res = scoreProtocols(
      {
        mainComplaint: "disfuncao eretil, infertilidade, pedra no rim, jato fraco, testosterona baixa",
        symptoms: ["disfuncao eretil", "infertilidade", "pedra no rim", "jato fraco", "testosterona baixa"],
      },
      2,
    );
    expect(res.length).toBeLessThanOrEqual(2);
  });
});
