import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("resolveJwtSecret (via server/_core/env)", () => {
  const original = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...original };
    vi.resetModules();
  });

  it("accepts a sufficiently long, non-placeholder secret", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "a".repeat(40);
    process.env.OWNER_OPEN_ID = "owner";
    const { env } = await import("./env");
    expect(env.JWT_SECRET).toBe("a".repeat(40));
  });

  it("throws in production when JWT_SECRET is missing", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;
    await expect(import("./env")).rejects.toThrow(/FATAL/);
  });

  it("throws in production for a known placeholder value, even if long enough", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "generate-a-32-byte-random-secret-do-not-use-this-value";
    await expect(import("./env")).rejects.toThrow(/FATAL/);
  });

  it("throws in production for the .env.example placeholder regardless of case", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "REPLACE_ME";
    await expect(import("./env")).rejects.toThrow(/FATAL/);
  });

  it("falls back to a random secret in development without throwing", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_SECRET;
    const { env } = await import("./env");
    expect(env.JWT_SECRET).toHaveLength(64); // 32 random bytes, hex-encoded
  });
});
