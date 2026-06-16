import { db } from "./_core/dbClient";
import { users, type User } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export { db };

export async function upsertUserByOpenId(args: {
  openId: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
}): Promise<User> {
  const existing = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
  if (existing[0]) {
    await db
      .update(users)
      .set({ name: args.name, email: args.email ?? null, avatar: args.avatar ?? null })
      .where(eq(users.openId, args.openId));
    const updated = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
    return updated[0];
  }
  const count = await db.select().from(users).limit(1);
  const role = count.length === 0 ? "admin" : "user";
  await db.insert(users).values({
    openId: args.openId,
    name: args.name,
    email: args.email ?? null,
    avatar: args.avatar ?? null,
    role,
  });
  const created = await db.select().from(users).where(eq(users.openId, args.openId)).limit(1);
  return created[0];
}

// ---------------------------------------------------------------------------
// Domain helpers: patients, intake forms, exam files, exam results
// ---------------------------------------------------------------------------
import {
  patients,
  intakeForms,
  examFiles,
  examResults,
  type Patient,
  type NewPatient,
  type IntakeForm,
  type NewIntakeForm,
  type ExamFile,
  type NewExamFile,
  type NewExamResult,
  type ExamResult,
} from "../drizzle/schema";
import { and, desc } from "drizzle-orm";

// ---- Patients -------------------------------------------------------------

export async function getPatientById(id: number): Promise<Patient | undefined> {
  const rows = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return rows[0];
}

export async function getPatientByEmail(email: string): Promise<Patient | undefined> {
  const rows = await db
    .select()
    .from(patients)
    .where(eq(patients.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0];
}

export async function createPatient(data: NewPatient): Promise<Patient> {
  const email = data.email.toLowerCase().trim();
  await db.insert(patients).values({ ...data, email });
  const created = await getPatientByEmail(email);
  return created!;
}

/** Insert a patient if the email doesn't exist; otherwise update demographic fields. */
export async function upsertPatientByEmail(data: NewPatient): Promise<Patient> {
  const email = data.email.toLowerCase().trim();
  const existing = await getPatientByEmail(email);
  if (existing) {
    const patch: Partial<NewPatient> = {};
    if (data.fullName) patch.fullName = data.fullName;
    if (data.phone) patch.phone = data.phone;
    if (data.birthDate) patch.birthDate = data.birthDate;
    if (data.sex) patch.sex = data.sex;
    if (data.city) patch.city = data.city;
    if (data.state) patch.state = data.state;
    if (Object.keys(patch).length > 0) {
      await db.update(patients).set(patch).where(eq(patients.id, existing.id));
    }
    return (await getPatientById(existing.id))!;
  }
  return createPatient({ ...data, email });
}

export async function setPatientPassword(id: number, passwordHash: string): Promise<void> {
  await db.update(patients).set({ passwordHash }).where(eq(patients.id, id));
}

export async function updatePatientProfile(
  id: number,
  patch: Partial<NewPatient>,
): Promise<Patient | undefined> {
  await db.update(patients).set(patch).where(eq(patients.id, id));
  return getPatientById(id);
}

export async function listPatients(): Promise<Patient[]> {
  return db.select().from(patients).orderBy(desc(patients.createdAt));
}

// ---- Intake forms ---------------------------------------------------------

export async function createIntakeForm(data: NewIntakeForm): Promise<IntakeForm> {
  await db.insert(intakeForms).values(data);
  const rows = await db
    .select()
    .from(intakeForms)
    .where(eq(intakeForms.token, data.token))
    .limit(1);
  return rows[0];
}

export async function getIntakeByToken(token: string): Promise<IntakeForm | undefined> {
  const rows = await db.select().from(intakeForms).where(eq(intakeForms.token, token)).limit(1);
  return rows[0];
}

export async function getIntakeById(id: number): Promise<IntakeForm | undefined> {
  const rows = await db.select().from(intakeForms).where(eq(intakeForms.id, id)).limit(1);
  return rows[0];
}

export async function updateIntakeForm(
  id: number,
  patch: Partial<NewIntakeForm>,
): Promise<IntakeForm | undefined> {
  await db.update(intakeForms).set(patch).where(eq(intakeForms.id, id));
  return getIntakeById(id);
}

export async function listIntakeForms(): Promise<IntakeForm[]> {
  return db.select().from(intakeForms).orderBy(desc(intakeForms.createdAt));
}

export async function listIntakeFormsByPatient(patientId: number): Promise<IntakeForm[]> {
  return db
    .select()
    .from(intakeForms)
    .where(eq(intakeForms.patientId, patientId))
    .orderBy(desc(intakeForms.createdAt));
}

// ---- Exam files -----------------------------------------------------------

export async function createExamFile(data: NewExamFile): Promise<ExamFile> {
  const result = await db.insert(examFiles).values(data);
  const insertId = (result as unknown as { insertId: number }).insertId;
  const rows = await db.select().from(examFiles).where(eq(examFiles.id, insertId)).limit(1);
  return rows[0];
}

export async function getExamFileById(id: number): Promise<ExamFile | undefined> {
  const rows = await db.select().from(examFiles).where(eq(examFiles.id, id)).limit(1);
  return rows[0];
}

export async function updateExamFile(
  id: number,
  patch: Partial<NewExamFile>,
): Promise<void> {
  await db.update(examFiles).set(patch).where(eq(examFiles.id, id));
}

export async function listExamFilesByPatient(patientId: number): Promise<ExamFile[]> {
  return db
    .select()
    .from(examFiles)
    .where(eq(examFiles.patientId, patientId))
    .orderBy(desc(examFiles.createdAt));
}

export async function listExamFilesByIntake(intakeFormId: number): Promise<ExamFile[]> {
  return db
    .select()
    .from(examFiles)
    .where(eq(examFiles.intakeFormId, intakeFormId))
    .orderBy(desc(examFiles.createdAt));
}

// ---- Exam results ---------------------------------------------------------

export async function insertExamResults(rows: NewExamResult[]): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(examResults).values(rows);
}

export async function listExamResultsByPatient(patientId: number): Promise<ExamResult[]> {
  return db
    .select()
    .from(examResults)
    .where(eq(examResults.patientId, patientId))
    .orderBy(desc(examResults.measuredAt));
}

export async function listExamResultsByFile(examFileId: number): Promise<ExamResult[]> {
  return db.select().from(examResults).where(eq(examResults.examFileId, examFileId));
}

export async function deleteExamResultsByFile(examFileId: number): Promise<void> {
  await db.delete(examResults).where(eq(examResults.examFileId, examFileId));
}

export { and };
