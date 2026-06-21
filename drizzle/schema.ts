import {
  mysqlTable,
  varchar,
  int,
  timestamp,
  mysqlEnum,
  text,
  json,
  double,
  index,
  tinyint,
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// Doctor / staff users (Manus OAuth)
// NOTE: DB uses camelCase column names
// ---------------------------------------------------------------------------
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: varchar("avatar", { length: 1024 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
  lastSignedIn: timestamp("lastSignedIn").notNull().defaultNow(),
  // Doctor profile fields
  phone: varchar("phone", { length: 40 }),
  crm: varchar("crm", { length: 50 }),
  specialization: varchar("specialization", { length: 255 }),
  location: varchar("location", { length: 255 }),
  bio: text("bio"),
  totpSecret: varchar("totpSecret", { length: 255 }),
  totpEnabled: tinyint("totpEnabled").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Patients (own e-mail/password login for the patient portal)
// NOTE: DB uses snake_case column names for patients table
// ---------------------------------------------------------------------------
export const patients = mysqlTable(
  "patients",
  {
    id: int("id").autoincrement().primaryKey(),
    // Identity / login
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    fullName: varchar("full_name", { length: 255 }).notNull().default(""),
    phone: varchar("phone", { length: 40 }),
    birthDate: varchar("birth_date", { length: 20 }),
    sex: varchar("sex", { length: 16 }),
    // Stores an encrypted blob (see server/_core/crypto.ts), not the raw CPF.
    // Widened from 20 to fit "v1:<iv>:<tag>:<ciphertext>" (~110 chars for an 11-digit CPF).
    cpf: varchar("cpf", { length: 255 }),
    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 40 }),
    notes: text("notes"),
    lastSignedIn: timestamp("lastSignedIn"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    emailIdx: index("patients_email_idx").on(t.email),
  }),
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

// ---------------------------------------------------------------------------
// Intake forms (pre-consultation forms — created by doctor, filled by patient)
// NOTE: DB uses snake_case for most columns, but some are camelCase
// ---------------------------------------------------------------------------
export const intakeForms = mysqlTable(
  "intake_forms",
  {
    id: int("id").autoincrement().primaryKey(),
    token: varchar("token", { length: 48 }).notNull().unique(),
    patientId: int("patient_id"),
    status: mysqlEnum("status", ["pending", "in_progress", "submitted", "reviewed"])
      .notNull()
      .default("pending"),
    invitedName: varchar("invited_name", { length: 255 }),
    invitedEmail: varchar("invited_email", { length: 255 }),
    invitedPhone: varchar("invited_phone", { length: 40 }),
    appointmentContext: text("appointmentContext"),
    answers: json("answers"),
    suggestedProtocols: json("suggested_protocols"),
    rapportSummary: text("rapport_summary"),
    doctorNotes: text("doctorNotes"),
    submittedAt: timestamp("submitted_at"),
    reviewedAt: timestamp("reviewed_at"),
    createdByOpenId: varchar("created_by_open_id", { length: 128 }),
    // Funil de conversão: indica se o paciente agendou no Doctoralia após a ficha
    scheduled: tinyint("scheduled").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    tokenIdx: index("intake_token_idx").on(t.token),
    patientIdx: index("intake_patient_idx").on(t.patientId),
  }),
);

export type IntakeForm = typeof intakeForms.$inferSelect;
export type NewIntakeForm = typeof intakeForms.$inferInsert;

// ---------------------------------------------------------------------------
// Exam files (uploaded PDFs/images, stored in S3)
// NOTE: The actual DB has camelCase columns (original) + snake_case (added via ALTER TABLE)
// ---------------------------------------------------------------------------
export const examFiles = mysqlTable(
  "exam_files",
  {
    id: int("id").autoincrement().primaryKey(),
    // Original camelCase columns
    patientId: int("patientId"),
    intakeFormId: int("intakeFormId"),
    fileName: varchar("fileName", { length: 300 }).notNull().default(""),
    mimeType: varchar("mimeType", { length: 120 }).notNull().default(""),
    storageKey: varchar("storageKey", { length: 500 }).notNull().default(""),
    storageUrl: varchar("storageUrl", { length: 600 }).notNull().default(""),
    processStatus: mysqlEnum("processStatus", [
      "pending",
      "processing",
      "done",
      "failed",
    ])
      .notNull()
      .default("pending"),
    processError: text("processError"),
    examDate: varchar("examDate", { length: 20 }),
    labName: varchar("labName", { length: 255 }),
    summary: text("summary"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow().onUpdateNow(),
    // snake_case columns added via ALTER TABLE
    fileKey: varchar("file_key", { length: 512 }).notNull().default(""),
    fileUrl: varchar("file_url", { length: 1024 }).notNull().default(""),
    fileSize: int("file_size").notNull().default(0),
    rawExtraction: json("raw_extraction"),
    uploadedBy: mysqlEnum("uploaded_by", ["patient", "doctor"])
      .notNull()
      .default("patient"),
  },
  (t) => ({
    patientIdx: index("examfiles_patient_idx").on(t.patientId),
    intakeIdx: index("examfiles_intake_idx").on(t.intakeFormId),
  }),
);

export type ExamFile = typeof examFiles.$inferSelect;
export type NewExamFile = typeof examFiles.$inferInsert;

// ---------------------------------------------------------------------------
// Exam results (standardized analyte values extracted from exam files)
// NOTE: DB uses camelCase column names for exam_results
// DB has: examFileId, patientId, analyteKey, analyteName, valueNum(varchar), valueText, unit, refRange, flag, measuredAt, createdAt
// ---------------------------------------------------------------------------
export const examResults = mysqlTable(
  "exam_results",
  {
    id: int("id").autoincrement().primaryKey(),
    examFileId: int("examFileId").notNull(),
    patientId: int("patientId"),
    analyteKey: varchar("analyteKey", { length: 80 }).notNull(),
    // analyteName is the display label (maps to rawLabel in code)
    analyteName: varchar("analyteName", { length: 255 }).notNull().default(""),
    // valueNum stored as varchar in DB but treated as number in code
    valueNum: double("valueNum"),
    valueText: varchar("valueText", { length: 255 }),
    unit: varchar("unit", { length: 60 }),
    refRange: varchar("refRange", { length: 120 }),
    // flag column maps to abnormalFlag in code
    abnormalFlag: varchar("flag", { length: 20 }),
    measuredAt: varchar("measuredAt", { length: 20 }),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => ({
    patientIdx: index("examresults_patient_idx").on(t.patientId),
    analyteIdx: index("examresults_analyte_idx").on(t.analyteKey),
  }),
);

export type ExamResult = typeof examResults.$inferSelect;
export type NewExamResult = typeof examResults.$inferInsert;

// ---------------------------------------------------------------------------
// Team members (invited users who can access protocols)
// NOTE: DB uses snake_case column names for team_members
// ---------------------------------------------------------------------------
export const teamMembers = mysqlTable(
  "team_members",
  {
    id: int("id").autoincrement().primaryKey(),
    invitationToken: varchar("invitation_token", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["viewer", "editor", "admin"]).notNull().default("viewer"),
    status: mysqlEnum("status", ["pending", "active", "inactive"]).notNull().default("pending"),
    userId: int("user_id"),
    invitedAt: timestamp("invited_at").notNull().defaultNow(),
    signedUpAt: timestamp("signed_up_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => ({
    emailIdx: index("team_members_email_idx").on(t.email),
    tokenIdx: index("team_members_token_idx").on(t.invitationToken),
  }),
);

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
