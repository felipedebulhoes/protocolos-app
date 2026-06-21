import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import type { SessionPayload } from "./types/manusTypes";

// env.JWT_SECRET is always a resolved, sufficiently long secret by this point
// (see server/_core/env.ts — it throws at boot in production if unset).
const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export async function signSession(payload: SessionPayload, expiresIn: string = "365d"): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function parseCookieHeader(header: string | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}
