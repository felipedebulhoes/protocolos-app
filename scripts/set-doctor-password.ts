/**
 * One-time script to set (or reset) the password for a doctor account by email.
 *
 * Usage:
 *   DOCTOR_EMAIL=felipe@example.com DOCTOR_PASSWORD=MinhaS3nha! npx tsx scripts/set-doctor-password.ts
 *
 * This works for both Manus-created accounts (just adds passwordHash) and
 * local email/password accounts.
 */
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { db } from "../server/_core/dbClient";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const email = process.env.DOCTOR_EMAIL;
const password = process.env.DOCTOR_PASSWORD;

if (!email || !password) {
  console.error("Usage: DOCTOR_EMAIL=xxx DOCTOR_PASSWORD=yyy npx tsx scripts/set-doctor-password.ts");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters");
  process.exit(1);
}

async function main() {
  const rows = await db.select().from(users).where(eq(users.email, email!)).limit(1);

  if (rows.length === 0) {
    console.error(`No user found with email: ${email}`);
    console.error("If this is a new account, create it first via the invite flow.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password!, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.email, email!));

  console.log(`✅ Password set for ${email} (id=${rows[0].id}, role=${rows[0].role})`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
