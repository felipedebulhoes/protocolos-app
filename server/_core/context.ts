import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME, PATIENT_COOKIE_NAME } from "@shared/const";
import { parseCookieHeader, verifySession } from "./sdk";
import { db } from "./dbClient";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface DoctorUser {
  id: number;
  openId: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: "admin" | "user";
  totpEnabled?: number;
}

export interface PatientSession {
  patientId: number;
  email: string;
}

export interface Context {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: DoctorUser | null;
  patient: PatientSession | null;
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  const cookies = parseCookieHeader(req.headers.cookie);

  let user: DoctorUser | null = null;
  const doctorToken = cookies[COOKIE_NAME];
  if (doctorToken) {
    const payload = await verifySession(doctorToken);
    // SECURITY: a "pending TOTP" token (issued right after OAuth, before the
    // 2FA code is verified — see server/_core/index.ts and
    // server/routers/totp.ts) is signed the same way as a real session. It
    // must never grant a real session just because it carries an openId.
    if (payload?.openId && payload.pendingTotp !== true) {
      const rows = await db.select().from(users).where(eq(users.openId, payload.openId)).limit(1);
      if (rows[0] && rows[0].openId) {
        user = {
          id: rows[0].id,
          openId: rows[0].openId,
          name: rows[0].name ?? "",
          email: rows[0].email,
          avatar: rows[0].avatar,
          role: rows[0].role,
          totpEnabled: rows[0].totpEnabled,
        };
      }
    }
  }

  let patient: PatientSession | null = null;
  const patientToken = cookies[PATIENT_COOKIE_NAME];
  if (patientToken) {
    const payload = await verifySession(patientToken);
    const pid = (payload as unknown as { patientId?: number })?.patientId;
    const pemail = (payload as unknown as { email?: string })?.email;
    if (pid && pemail) {
      patient = { patientId: pid, email: pemail };
    }
  }

  return { req, res, user, patient };
}
