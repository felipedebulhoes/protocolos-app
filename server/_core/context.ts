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
    if (payload?.openId) {
      const rows = await db.select().from(users).where(eq(users.openId, payload.openId)).limit(1);
      if (rows[0]) {
        user = {
          id: rows[0].id,
          openId: rows[0].openId,
          name: rows[0].name,
          email: rows[0].email,
          avatar: rows[0].avatar,
          role: rows[0].role,
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
