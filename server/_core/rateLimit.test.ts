import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows attempts up to the configured max", () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    }
  });

  it("rejects once the max is exceeded within the window", () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000)).toBe(true);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
    expect(checkRateLimit(key, 2, 60_000)).toBe(false);
  });

  it("tracks independent keys separately", () => {
    const keyA = `test:a:${Math.random()}`;
    const keyB = `test:b:${Math.random()}`;
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(true);
    expect(checkRateLimit(keyA, 1, 60_000)).toBe(false);
    // A different key has its own independent budget.
    expect(checkRateLimit(keyB, 1, 60_000)).toBe(true);
  });

  it("resets the count after the window expires", async () => {
    const key = `test:${Math.random()}`;
    expect(checkRateLimit(key, 1, 20)).toBe(true);
    expect(checkRateLimit(key, 1, 20)).toBe(false);
    await new Promise((r) => setTimeout(r, 30));
    expect(checkRateLimit(key, 1, 20)).toBe(true);
  });
});
