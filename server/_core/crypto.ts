// ---------------------------------------------------------------------------
// Field-level encryption for sensitive PII (currently: patient CPF).
//
// AES-256-GCM, authenticated. Ciphertext is stored as a single string:
//   v1:<base64 iv>:<base64 authTag>:<base64 ciphertext>
// so it round-trips through a plain varchar column.
//
// Requires CPF_ENCRYPTION_KEY in the environment: 32 raw bytes, given as
// either a 64-char hex string or a base64 string. Generate one with:
//   openssl rand -hex 32
// ---------------------------------------------------------------------------

import crypto from "crypto";
import { env, isProd } from "./env";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

let cachedKey: Buffer | null | undefined;

function resolveKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;

  const raw = env.CPF_ENCRYPTION_KEY;
  if (!raw) {
    cachedKey = null;
    return null;
  }

  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, "hex");
  } else {
    key = Buffer.from(raw, "base64");
  }

  if (key.length !== 32) {
    throw new Error(
      "[crypto] CPF_ENCRYPTION_KEY must decode to exactly 32 bytes (hex-64 or base64). " +
        "Generate one with `openssl rand -hex 32`.",
    );
  }
  cachedKey = key;
  return key;
}

/** True once a valid CPF_ENCRYPTION_KEY is configured. */
export function hasCpfEncryptionKey(): boolean {
  return resolveKey() !== null;
}

/**
 * Encrypts a CPF for storage. Returns null/empty input unchanged.
 * Throws in production if no key is configured (refuses to silently store
 * plaintext PII); in development, logs a warning and stores plaintext so
 * local work without a .env file still functions.
 */
export function encryptCpf(plain: string | null | undefined): string | null {
  if (!plain) return plain ?? null;
  const key = resolveKey();
  if (!key) {
    if (isProd()) {
      throw new Error("[crypto] Refusing to store CPF in plaintext: CPF_ENCRYPTION_KEY is not set.");
    }
    console.warn("[crypto] CPF_ENCRYPTION_KEY not set — storing CPF in PLAINTEXT (dev only).");
    return plain;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

/**
 * Decrypts a value produced by encryptCpf. If the value doesn't look like
 * our ciphertext format (e.g. legacy plaintext data, or no key configured
 * yet), it is returned as-is rather than throwing — callers always get
 * "the best available" CPF string instead of a hard failure.
 */
export function decryptCpf(stored: string | null | undefined): string | null {
  if (!stored) return stored ?? null;
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    // Not our format — likely legacy plaintext. Return unchanged.
    return stored;
  }
  const key = resolveKey();
  if (!key) {
    console.warn("[crypto] Cannot decrypt CPF: CPF_ENCRYPTION_KEY is not set.");
    return null;
  }
  try {
    const [, ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(data), decipher.final()]);
    return plain.toString("utf8");
  } catch (e) {
    console.error("[crypto] Failed to decrypt CPF value", e);
    return null;
  }
}
