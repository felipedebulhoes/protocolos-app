import bcrypt from "bcryptjs";
import { serialize } from "cookie";
import type { Response } from "express";
import { signSession } from "./_core/sdk";
import { getSessionCookieOptions, getClearCookieOptions } from "./_core/cookies";
import { PATIENT_COOKIE_NAME } from "@shared/const";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/** Sign a patient session JWT and set it as an httpOnly cookie. */
export async function setPatientSessionCookie(
  res: Response,
  patient: { patientId: number; email: string },
): Promise<void> {
  const token = await signSession({ patientId: patient.patientId, email: patient.email });
  res.setHeader("Set-Cookie", serialize(PATIENT_COOKIE_NAME, token, getSessionCookieOptions()));
}

export function clearPatientSessionCookie(res: Response): void {
  res.setHeader("Set-Cookie", serialize(PATIENT_COOKIE_NAME, "", getClearCookieOptions()));
}
