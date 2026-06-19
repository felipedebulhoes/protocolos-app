#!/usr/bin/env python3
"""
Rebuild the Drizzle snapshot to match the actual database schema.
This avoids interactive prompts from drizzle-kit generate when it detects column renames.
"""
import json
import time

snapshot_path = "drizzle/migrations/meta/0000_snapshot.json"

with open(snapshot_path) as f:
    data = json.load(f)

# ---- USERS TABLE ----
data["tables"]["users"]["columns"] = {
    "id": {"name": "id", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": True},
    "openId": {"name": "openId", "type": "varchar(64)", "primaryKey": False, "notNull": True, "autoincrement": False},
    "name": {"name": "name", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "email": {"name": "email", "type": "varchar(320)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "avatar": {"name": "avatar", "type": "varchar(1024)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "loginMethod": {"name": "loginMethod", "type": "varchar(64)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "role": {"name": "role", "type": "enum('user','admin')", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "'user'"},
    "createdAt": {"name": "createdAt", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
    "updatedAt": {"name": "updatedAt", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())", "onUpdate": "now()"},
    "lastSignedIn": {"name": "lastSignedIn", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
    "phone": {"name": "phone", "type": "varchar(40)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "crm": {"name": "crm", "type": "varchar(50)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "specialization": {"name": "specialization", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "location": {"name": "location", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "bio": {"name": "bio", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "totpSecret": {"name": "totpSecret", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "totpEnabled": {"name": "totpEnabled", "type": "tinyint(1)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "0"},
}

# ---- PATIENTS TABLE ----
data["tables"]["patients"]["columns"] = {
    "id": {"name": "id", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": True},
    "email": {"name": "email", "type": "varchar(320)", "primaryKey": False, "notNull": True, "autoincrement": False},
    "password_hash": {"name": "password_hash", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "full_name": {"name": "full_name", "type": "varchar(255)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "phone": {"name": "phone", "type": "varchar(40)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "birth_date": {"name": "birth_date", "type": "varchar(20)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "sex": {"name": "sex", "type": "varchar(16)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "cpf": {"name": "cpf", "type": "varchar(20)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "city": {"name": "city", "type": "varchar(120)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "state": {"name": "state", "type": "varchar(40)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "notes": {"name": "notes", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "lastSignedIn": {"name": "lastSignedIn", "type": "timestamp", "primaryKey": False, "notNull": False, "autoincrement": False},
    "created_at": {"name": "created_at", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
    "updated_at": {"name": "updated_at", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())", "onUpdate": "now()"},
}

# ---- INTAKE_FORMS TABLE ----
data["tables"]["intake_forms"]["columns"] = {
    "id": {"name": "id", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": True},
    "token": {"name": "token", "type": "varchar(48)", "primaryKey": False, "notNull": True, "autoincrement": False},
    "patient_id": {"name": "patient_id", "type": "int", "primaryKey": False, "notNull": False, "autoincrement": False},
    "status": {"name": "status", "type": "enum('pending','in_progress','submitted','reviewed')", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "'pending'"},
    "invited_name": {"name": "invited_name", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "invited_email": {"name": "invited_email", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "invited_phone": {"name": "invited_phone", "type": "varchar(40)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "appointmentContext": {"name": "appointmentContext", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "answers": {"name": "answers", "type": "json", "primaryKey": False, "notNull": False, "autoincrement": False},
    "suggested_protocols": {"name": "suggested_protocols", "type": "json", "primaryKey": False, "notNull": False, "autoincrement": False},
    "rapport_summary": {"name": "rapport_summary", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "doctorNotes": {"name": "doctorNotes", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "submitted_at": {"name": "submitted_at", "type": "timestamp", "primaryKey": False, "notNull": False, "autoincrement": False},
    "reviewed_at": {"name": "reviewed_at", "type": "timestamp", "primaryKey": False, "notNull": False, "autoincrement": False},
    "created_by_open_id": {"name": "created_by_open_id", "type": "varchar(128)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "created_at": {"name": "created_at", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
    "updated_at": {"name": "updated_at", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())", "onUpdate": "now()"},
}

# ---- EXAM_FILES TABLE ----
data["tables"]["exam_files"]["columns"] = {
    "id": {"name": "id", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": True},
    "patientId": {"name": "patientId", "type": "int", "primaryKey": False, "notNull": False, "autoincrement": False},
    "intakeFormId": {"name": "intakeFormId", "type": "int", "primaryKey": False, "notNull": False, "autoincrement": False},
    "fileName": {"name": "fileName", "type": "varchar(300)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "mimeType": {"name": "mimeType", "type": "varchar(120)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "storageKey": {"name": "storageKey", "type": "varchar(500)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "storageUrl": {"name": "storageUrl", "type": "varchar(600)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "processStatus": {"name": "processStatus", "type": "enum('pending','processing','done','failed')", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "'pending'"},
    "processError": {"name": "processError", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "examDate": {"name": "examDate", "type": "varchar(20)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "labName": {"name": "labName", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "summary": {"name": "summary", "type": "text", "primaryKey": False, "notNull": False, "autoincrement": False},
    "createdAt": {"name": "createdAt", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
    "updatedAt": {"name": "updatedAt", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())", "onUpdate": "now()"},
    "file_key": {"name": "file_key", "type": "varchar(512)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "file_url": {"name": "file_url", "type": "varchar(1024)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "file_size": {"name": "file_size", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "0"},
    "raw_extraction": {"name": "raw_extraction", "type": "json", "primaryKey": False, "notNull": False, "autoincrement": False},
    "uploaded_by": {"name": "uploaded_by", "type": "enum('patient','doctor')", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "'patient'"},
}
data["tables"]["exam_files"]["indexes"] = {
    "examfiles_patient_idx": {"name": "examfiles_patient_idx", "columns": ["patientId"], "isUnique": False},
    "examfiles_intake_idx": {"name": "examfiles_intake_idx", "columns": ["intakeFormId"], "isUnique": False},
}

# ---- EXAM_RESULTS TABLE ----
data["tables"]["exam_results"]["columns"] = {
    "id": {"name": "id", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": True},
    "examFileId": {"name": "examFileId", "type": "int", "primaryKey": False, "notNull": True, "autoincrement": False},
    "patientId": {"name": "patientId", "type": "int", "primaryKey": False, "notNull": False, "autoincrement": False},
    "analyteKey": {"name": "analyteKey", "type": "varchar(80)", "primaryKey": False, "notNull": True, "autoincrement": False},
    "analyteName": {"name": "analyteName", "type": "varchar(255)", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "''"},
    "valueNum": {"name": "valueNum", "type": "double", "primaryKey": False, "notNull": False, "autoincrement": False},
    "valueText": {"name": "valueText", "type": "varchar(255)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "unit": {"name": "unit", "type": "varchar(60)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "refRange": {"name": "refRange", "type": "varchar(120)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "flag": {"name": "flag", "type": "varchar(20)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "measuredAt": {"name": "measuredAt", "type": "varchar(20)", "primaryKey": False, "notNull": False, "autoincrement": False},
    "createdAt": {"name": "createdAt", "type": "timestamp", "primaryKey": False, "notNull": True, "autoincrement": False, "default": "(now())"},
}
data["tables"]["exam_results"]["indexes"] = {
    "examresults_patient_idx": {"name": "examresults_patient_idx", "columns": ["patientId"], "isUnique": False},
    "examresults_analyte_idx": {"name": "examresults_analyte_idx", "columns": ["analyteKey"], "isUnique": False},
}

with open(snapshot_path, "w") as f:
    json.dump(data, f, indent=2)

print("Snapshot rebuilt successfully!")
print("Tables updated: users, patients, intake_forms, exam_files, exam_results")
