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
} from "drizzle-orm/mysql-core";

// ---------------------------------------------------------------------------
// Doctor / staff users (Manus OAuth)
// ---------------------------------------------------------------------------
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("open_id", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull().default(""),
  email: varchar("email", { length: 255 }),
  avatar: varchar("avatar", { length: 1024 }),
  role: mysqlEnum("role", ["admin", "user"]).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ---------------------------------------------------------------------------
// Patients (own e-mail/password login for the patient portal)
// ---------------------------------------------------------------------------
export const patients = mysqlTable(
  "patients",
  {
    id: int("id").autoincrement().primaryKey(),
    // Identity / login
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }), // null until patient sets a password
    fullName: varchar("full_name", { length: 255 }).notNull().default(""),
    phone: varchar("phone", { length: 40 }),
    birthDate: varchar("birth_date", { length: 20 }), // ISO yyyy-mm-dd
    sex: mysqlEnum("sex", ["masculino", "feminino", "outro", "nao_informado"])
      .notNull()
      .default("nao_informado"),
    cpf: varchar("cpf", { length: 20 }),
    city: varchar("city", { length: 120 }),
    state: varchar("state", { length: 40 }),
    // Funnel / CRM linkage
    notes: text("notes"),
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
// ---------------------------------------------------------------------------
export const intakeForms = mysqlTable(
  "intake_forms",
  {
    id: int("id").autoincrement().primaryKey(),
    // Public access token (shared with the patient after appointment confirmation)
    token: varchar("token", { length: 64 }).notNull().unique(),
    status: mysqlEnum("status", ["pending", "submitted", "reviewed"])
      .notNull()
      .default("pending"),
    // Linked patient (set once submitted / account created)
    patientId: int("patient_id"),
    // Optional pre-fill data set by the doctor when generating the link
    invitedName: varchar("invited_name", { length: 255 }),
    invitedEmail: varchar("invited_email", { length: 255 }),
    invitedPhone: varchar("invited_phone", { length: 40 }),
    // The full set of answers (keyed by question id from shared/intakeSchema)
    answers: json("answers"),
    // AI-generated outputs
    suggestedProtocols: json("suggested_protocols"), // [{id,title,score,reasons}]
    rapportSummary: text("rapport_summary"),
    // Audit
    submittedAt: timestamp("submitted_at"),
    reviewedAt: timestamp("reviewed_at"),
    createdByOpenId: varchar("created_by_open_id", { length: 128 }),
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
// ---------------------------------------------------------------------------
export const examFiles = mysqlTable(
  "exam_files",
  {
    id: int("id").autoincrement().primaryKey(),
    patientId: int("patient_id"),
    intakeFormId: int("intake_form_id"),
    fileKey: varchar("file_key", { length: 512 }).notNull(),
    fileUrl: varchar("file_url", { length: 1024 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull().default(""),
    mimeType: varchar("mime_type", { length: 120 }).notNull().default(""),
    fileSize: int("file_size").notNull().default(0),
    // Processing status of the AI reader
    processStatus: mysqlEnum("process_status", [
      "pending",
      "processing",
      "done",
      "failed",
    ])
      .notNull()
      .default("pending"),
    processError: text("process_error"),
    // Raw structured extraction (full JSON returned by the AI)
    rawExtraction: json("raw_extraction"),
    examDate: varchar("exam_date", { length: 20 }), // ISO yyyy-mm-dd if found
    labName: varchar("lab_name", { length: 255 }),
    uploadedBy: mysqlEnum("uploaded_by", ["patient", "doctor"])
      .notNull()
      .default("patient"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
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
// ---------------------------------------------------------------------------
export const examResults = mysqlTable(
  "exam_results",
  {
    id: int("id").autoincrement().primaryKey(),
    patientId: int("patient_id").notNull(),
    examFileId: int("exam_file_id").notNull(),
    // Standardized analyte key (e.g. "psa_total", "testosterona_total")
    analyteKey: varchar("analyte_key", { length: 80 }).notNull(),
    // Original label as printed on the report
    rawLabel: varchar("raw_label", { length: 255 }).notNull().default(""),
    valueNum: double("value_num"),
    valueText: varchar("value_text", { length: 255 }),
    unit: varchar("unit", { length: 60 }),
    refRange: varchar("ref_range", { length: 120 }),
    abnormalFlag: mysqlEnum("abnormal_flag", ["low", "normal", "high", "unknown"])
      .notNull()
      .default("unknown"),
    measuredAt: varchar("measured_at", { length: 20 }), // ISO date of the exam
    confidence: double("confidence"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    patientIdx: index("examresults_patient_idx").on(t.patientId),
    analyteIdx: index("examresults_analyte_idx").on(t.analyteKey),
  }),
);

export type ExamResult = typeof examResults.$inferSelect;
export type NewExamResult = typeof examResults.$inferInsert;
