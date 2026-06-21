import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

function readVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`[env] Missing environment variable: ${name}`);
  }
  return value ?? "";
}

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProdEnv = NODE_ENV === "production";

/**
 * SECURITY: JWT_SECRET signs both doctor and patient session cookies.
 * - In production this MUST come from the environment. We fail fast at boot
 *   instead of silently falling back to a hardcoded/shared secret, which
 *   would let anyone forge valid sessions (including the doctor/owner
 *   session) for any deployment that forgot to set the variable.
 * - In development we generate a random per-process secret so local runs
 *   still work without a .env file (sessions just won't survive a restart).
 */
// Known placeholder/example values that must never be treated as a real
// secret, regardless of length — defense in depth on top of the length
// check below, in case a future example value happens to be long enough
// to pass it (this exact mistake was caught in review: an earlier
// .env.example value was 54 characters long and would have sailed through).
const JWT_SECRET_DENYLIST = new Set([
  "replace_me",
  "changeme",
  "change-me",
  "generate-a-32-byte-random-secret-do-not-use-this-value",
  "dev-secret-change-me",
]);

function resolveJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  const looksLikePlaceholder = !fromEnv || JWT_SECRET_DENYLIST.has(fromEnv.toLowerCase());

  if (fromEnv && !looksLikePlaceholder && fromEnv.length >= 32) {
    return fromEnv;
  }
  if (isProdEnv) {
    throw new Error(
      "[env] FATAL: JWT_SECRET is not set, is a known placeholder, or is shorter than " +
        "32 chars, in production. Refusing to start with an insecure/default session " +
        "secret. Set JWT_SECRET to a long random value (e.g. `openssl rand -hex 32`).",
    );
  }
  console.warn(
    "[env] JWT_SECRET not set (or is a placeholder) — generating a random development-only " +
      "secret. Sessions will be invalidated on every restart. Set JWT_SECRET in .env to avoid this.",
  );
  return crypto.randomBytes(32).toString("hex");
}

export const env = {
  NODE_ENV,
  PORT: process.env.PORT ?? "3000",
  DATABASE_URL: readVar("DATABASE_URL"),
  JWT_SECRET: resolveJwtSecret(),
  VITE_APP_ID: process.env.VITE_APP_ID ?? "",
  OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL ?? "https://api.manus.im",
  VITE_OAUTH_PORTAL_URL: process.env.VITE_OAUTH_PORTAL_URL ?? "https://manus.im",
  OWNER_OPEN_ID: process.env.OWNER_OPEN_ID ?? "",
  OWNER_NAME: process.env.OWNER_NAME ?? "",
  BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL ?? "https://forge.manus.ai",
  BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // 32-byte key (hex-64 or base64) used to encrypt the patient CPF column at rest.
  // See server/_core/crypto.ts. Generate with `openssl rand -hex 32`.
  CPF_ENCRYPTION_KEY: process.env.CPF_ENCRYPTION_KEY ?? "",
};

if (isProdEnv && !env.OWNER_OPEN_ID) {
  console.warn(
    "[env] OWNER_OPEN_ID is not set in production — owner-only routes (doctor dashboard, " +
      "patient exam files, TOTP) will reject every request until it is configured.",
  );
}

export function isProd(): boolean {
  return env.NODE_ENV === "production";
}
