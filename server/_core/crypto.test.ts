import { describe, it, expect, beforeEach, afterEach } from "vitest";

const TEST_KEY = "0".repeat(64); // 32 bytes hex — test-only key, not a real secret.

describe("CPF encryption", () => {
  const originalKey = process.env.CPF_ENCRYPTION_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.CPF_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    process.env.CPF_ENCRYPTION_KEY = originalKey;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("round-trips a CPF through encrypt/decrypt", async () => {
    const { encryptCpf, decryptCpf } = await import("./crypto");
    const cpf = "123.456.789-09";
    const encrypted = encryptCpf(cpf);
    expect(encrypted).not.toBeNull();
    expect(encrypted).not.toBe(cpf);
    expect(encrypted!.startsWith("v1:")).toBe(true);
    expect(decryptCpf(encrypted)).toBe(cpf);
  });

  it("passes null/empty values through unchanged", async () => {
    const { encryptCpf, decryptCpf } = await import("./crypto");
    expect(encryptCpf(null)).toBeNull();
    expect(encryptCpf(undefined)).toBeNull();
    expect(decryptCpf(null)).toBeNull();
  });

  it("returns legacy plaintext unchanged on decrypt (not in v1: format)", async () => {
    const { decryptCpf } = await import("./crypto");
    expect(decryptCpf("12345678909")).toBe("12345678909");
  });
});
