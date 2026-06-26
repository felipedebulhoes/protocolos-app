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
import { and, desc, lt, sql } from "drizzle-orm";
import { encryptCpf, decryptCpf } from "./_core/crypto";

// ---- Patients -------------------------------------------------------------

// SECURITY: `cpf` is stored encrypted (see server/_core/crypto.ts). These two
// read functions are the single choke point patient rows pass through, so
// decryption happens here once instead of at every call site.
function withDecryptedCpf(row: Patient): Patient {
  return { ...row, cpf: decryptCpf(row.cpf) };
}

export async function getPatientById(id: number): Promise<Patient | undefined> {
  const rows = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return rows[0] ? withDecryptedCpf(rows[0]) : undefined;
}

export async function getPatientByEmail(email: string): Promise<Patient | undefined> {
  const rows = await db
    .select()
    .from(patients)
    .where(eq(patients.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ? withDecryptedCpf(rows[0]) : undefined;
}

export async function createPatient(data: NewPatient): Promise<Patient> {
  const email = data.email.toLowerCase().trim();
  await db.insert(patients).values({ ...data, email, cpf: encryptCpf(data.cpf) });
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
    if (data.cpf) patch.cpf = encryptCpf(data.cpf);
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
  // Guard against any future caller writing a raw CPF through this generic
  // patch path — always encrypt before it reaches the database.
  const safePatch = patch.cpf ? { ...patch, cpf: encryptCpf(patch.cpf) } : patch;
  await db.update(patients).set(safePatch).where(eq(patients.id, id));
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

export async function deleteIntakeForm(id: number): Promise<void> {
  // Apaga exames associados primeiro (exam_results e exam_files)
  const files = await db.select({ id: examFiles.id }).from(examFiles).where(eq(examFiles.intakeFormId, id));
  for (const f of files) {
    await db.delete(examResults).where(eq(examResults.examFileId, f.id));
  }
  await db.delete(examFiles).where(eq(examFiles.intakeFormId, id));
  await db.delete(intakeForms).where(eq(intakeForms.id, id));
}

// ---- Exam files -----------------------------------------------------------

export async function createExamFile(data: NewExamFile): Promise<ExamFile> {
  const result = await db.insert(examFiles).values(data);
  // Drizzle mysql2 returns [ResultSetHeader, FieldPacket[]] — insertId is in result[0]
  const header = (result as unknown as [{ insertId: number }, unknown])[0];
  const insertId = header?.insertId;
  const rows = await db.select().from(examFiles).where(eq(examFiles.id, insertId)).limit(1);
  return rows[0];
}

export async function getExamFileById(id: number): Promise<ExamFile | undefined> {
  const rows = await db.select().from(examFiles).where(eq(examFiles.id, id)).limit(1);
  return rows[0];
}

/** Look up an exam file by its storage key (used by the storage proxy to authorize access). */
export async function getExamFileByKey(fileKey: string): Promise<ExamFile | undefined> {
  const rows = await db.select().from(examFiles).where(eq(examFiles.fileKey, fileKey)).limit(1);
  return rows[0];
}

export async function updateExamFile(
  id: number,
  patch: Partial<NewExamFile>,
): Promise<void> {
  await db.update(examFiles).set(patch).where(eq(examFiles.id, id));
}

export async function listExamFilesByPatient(patientId: number): Promise<ExamFile[]> {
  const result = await db
    .select()
    .from(examFiles)
    .where(eq(examFiles.patientId, patientId))
    .orderBy(desc(examFiles.createdAt));
  return result;
}

export async function listExamFilesByIntake(intakeFormId: number): Promise<ExamFile[]> {
  try {
    const result = await db
      .select()
      .from(examFiles)
      .where(eq(examFiles.intakeFormId, intakeFormId))
      .orderBy(desc(examFiles.createdAt));
    return result;
  } catch (error) {
    console.error(`[DB] Error fetching exam files for intake ${intakeFormId}:`, error);
    return [];
  }
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

// ---- Doctor profile -------------------------------------------------------

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export async function updateUserProfile(
  openId: string,
  patch: {
    name?: string;
    phone?: string | null;
    crm?: string | null;
    specialization?: string | null;
    location?: string | null;
    bio?: string | null;
  },
): Promise<User | undefined> {
  await db.update(users).set(patch).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

// ---- Activity stats -------------------------------------------------------

export async function getDashboardStats(): Promise<{
  totalPatients: number;
  totalFichas: number;
  fichasPendentes: number;
  fichasRevisadas: number;
  fichasEnviadas: number;
  taxaPreenchimento: number;
  fichasAgendadas: number;
  taxaConversao: number;
}> {
  const [totalPatientsRows, totalFichasRows, fichasPendentesRows, fichasRevisadasRows, fichasEnviadasRows, fichasAgendadasRows] =
    await Promise.all([
      db.select({ id: patients.id }).from(patients),
      db.select({ id: intakeForms.id }).from(intakeForms),
      db
        .select({ id: intakeForms.id })
        .from(intakeForms)
        .where(eq(intakeForms.status, "pending")),
      db
        .select({ id: intakeForms.id })
        .from(intakeForms)
        .where(eq(intakeForms.status, "reviewed")),
      db
        .select({ id: intakeForms.id })
        .from(intakeForms)
        .where(sql`${intakeForms.status} != 'pending'`),
      db
        .select({ id: intakeForms.id })
        .from(intakeForms)
        .where(eq(intakeForms.scheduled, 1)),
    ]);
  const totalFichas = totalFichasRows.length;
  const fichasEnviadas = fichasEnviadasRows.length;
  const fichasAgendadas = fichasAgendadasRows.length;
  const taxaPreenchimento = totalFichas > 0 ? Math.round((fichasEnviadas / totalFichas) * 100) : 0;
  const taxaConversao = fichasEnviadas > 0 ? Math.round((fichasAgendadas / fichasEnviadas) * 100) : 0;
  return {
    totalPatients: totalPatientsRows.length,
    totalFichas,
    fichasPendentes: fichasPendentesRows.length,
    fichasRevisadas: fichasRevisadasRows.length,
    fichasEnviadas,
    taxaPreenchimento,
    fichasAgendadas,
    taxaConversao,
  };
}

/**
 * Returns pending intake forms created more than `olderThanMs` milliseconds ago.
 * Used by the Heartbeat reminder job to identify patients who haven't filled their form.
 */
export async function listPendingIntakesOlderThan(
  olderThanMs: number,
): Promise<IntakeForm[]> {
  const cutoff = new Date(Date.now() - olderThanMs);
  return db
    .select()
    .from(intakeForms)
    .where(and(eq(intakeForms.status, "pending"), lt(intakeForms.createdAt, cutoff)))
    .orderBy(desc(intakeForms.createdAt));
}

export async function getRecentFichas(limit = 5): Promise<IntakeForm[]> {
  return db
    .select()
    .from(intakeForms)
    .orderBy(desc(intakeForms.createdAt))
    .limit(limit);
}

// ---- Exam analytics -------------------------------------------------------

/** Aggregate counts per analyteKey for the analytics dashboard. */
export async function getAnalyteDistribution(): Promise<
  { analyteKey: string; total: number; normalCount: number; lowCount: number; highCount: number; unknownCount: number }[]
> {
  const rows = await db
    .select({
      analyteKey: examResults.analyteKey,
      abnormalFlag: examResults.abnormalFlag,
    })
    .from(examResults);

  const map = new Map<
    string,
    { total: number; normalCount: number; lowCount: number; highCount: number; unknownCount: number }
  >();
  for (const r of rows) {
    const key = r.analyteKey;
    if (!map.has(key)) map.set(key, { total: 0, normalCount: 0, lowCount: 0, highCount: 0, unknownCount: 0 });
    const entry = map.get(key)!;
    entry.total++;
    const flag = (r.abnormalFlag ?? "unknown").toLowerCase();
    if (flag === "normal") entry.normalCount++;
    else if (flag === "low") entry.lowCount++;
    else if (flag === "high") entry.highCount++;
    else entry.unknownCount++;
  }

  return Array.from(map.entries())
    .map(([analyteKey, counts]) => ({ analyteKey, ...counts }))
    .sort((a, b) => b.total - a.total);
}

/** Returns exam results flagged as high or low (critical alerts). */
export async function getCriticalAlerts(limit = 50): Promise<
  {
    id: number;
    patientId: number | null;
    examFileId: number;
    analyteKey: string;
    analyteName: string;
    valueNum: number | null;
    unit: string | null;
    refRange: string | null;
    abnormalFlag: string | null;
    measuredAt: string | null;
    createdAt: Date;
  }[]
> {
  const rows = await db
    .select()
    .from(examResults)
    .where(sql`LOWER(${examResults.abnormalFlag}) IN ('high', 'low')`)
    .orderBy(desc(examResults.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId ?? null,
    examFileId: r.examFileId,
    analyteKey: r.analyteKey,
    analyteName: r.analyteName,
    valueNum: r.valueNum ?? null,
    unit: r.unit ?? null,
    refRange: r.refRange ?? null,
    abnormalFlag: r.abnormalFlag ?? null,
    measuredAt: r.measuredAt ?? null,
    createdAt: r.createdAt,
  }));
}

/** Monthly volume of exam files processed (last 12 months). */
export async function getExamVolumeByMonth(): Promise<{ month: string; count: number }[]> {
  const rows = await db
    .select({
      month: sql<string>`DATE_FORMAT(${examFiles.createdAt}, '%Y-%m')`,
      count: sql<number>`COUNT(*)`,
    })
    .from(examFiles)
    .where(
      and(
        eq(examFiles.processStatus, "done"),
        sql`${examFiles.createdAt} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`,
      ),
    )
    .groupBy(sql`DATE_FORMAT(${examFiles.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${examFiles.createdAt}, '%Y-%m')`);
  return rows.map((r) => ({ month: r.month, count: Number(r.count) }));
}

/** Summary totals for the analytics header cards. */
export async function getExamAnalyticsSummary(): Promise<{
  totalFiles: number;
  totalResults: number;
  criticalCount: number;
  labsDistribution: { labName: string; count: number }[];
}> {
  const [filesRows, resultsRows, criticalRows, labRows] = await Promise.all([
    db.select({ id: examFiles.id }).from(examFiles).where(eq(examFiles.processStatus, "done")),
    db.select({ id: examResults.id }).from(examResults),
    db
      .select({ id: examResults.id })
      .from(examResults)
      .where(sql`LOWER(${examResults.abnormalFlag}) IN ('high', 'low')`),
    db
      .select({
        labName: examFiles.labName,
        count: sql<number>`COUNT(*)`,
      })
      .from(examFiles)
      .where(sql`${examFiles.labName} IS NOT NULL AND ${examFiles.labName} != ''`)
      .groupBy(examFiles.labName)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10),
  ]);
  return {
    totalFiles: filesRows.length,
    totalResults: resultsRows.length,
    criticalCount: criticalRows.length,
    labsDistribution: labRows.map((r) => ({ labName: r.labName ?? "", count: Number(r.count) })),
  };
}

// ---- Admin audit logs (track admin actions for security) ----

import { adminAuditLogs, type NewAdminAuditLog } from "../drizzle/schema";

export async function logAdminAction(data: NewAdminAuditLog): Promise<void> {
  try {
    await db.insert(adminAuditLogs).values(data);
  } catch (error) {
    console.error("[DB] Error logging admin action:", error);
    // Don't throw — audit failures shouldn't break the main flow
  }
}

export async function getAdminAuditLogs(limit = 100): Promise<typeof adminAuditLogs.$inferSelect[]> {
  return db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}

export async function getAdminAuditLogsByUserId(userId: number, limit = 50): Promise<typeof adminAuditLogs.$inferSelect[]> {
  return db
    .select()
    .from(adminAuditLogs)
    .where(eq(adminAuditLogs.adminId, userId))
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit);
}

// ---- Document verifications (autenticação de orçamentos via QR/código) ----
import {
  documentVerifications,
  type NewDocumentVerification,
  type DocumentVerification,
} from "../drizzle/schema";

export async function createDocumentVerification(
  data: NewDocumentVerification,
): Promise<DocumentVerification> {
  await db.insert(documentVerifications).values(data);
  const rows = await db
    .select()
    .from(documentVerifications)
    .where(eq(documentVerifications.code, data.code))
    .limit(1);
  return rows[0];
}

export async function getDocumentVerificationByCode(
  code: string,
): Promise<DocumentVerification | null> {
  const rows = await db
    .select()
    .from(documentVerifications)
    .where(eq(documentVerifications.code, code))
    .limit(1);
  return rows[0] ?? null;
}

export async function listDocumentVerifications(
  limit = 100,
): Promise<DocumentVerification[]> {
  return db
    .select()
    .from(documentVerifications)
    .orderBy(desc(documentVerifications.createdAt))
    .limit(limit);
}
