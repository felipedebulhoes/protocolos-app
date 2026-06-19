#!/usr/bin/env python3
"""
Update the Drizzle snapshot to match the actual database schema.
The actual DB has camelCase columns (original) + snake_case (added via ALTER TABLE).
"""
import json
import copy

snapshot_path = "drizzle/migrations/meta/0000_snapshot.json"

with open(snapshot_path) as f:
    data = json.load(f)

# Build the new exam_files columns that match the actual DB
new_exam_files_columns = {
    "id": {
        "name": "id",
        "type": "int",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": True
    },
    "patientId": {
        "name": "patientId",
        "type": "int",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "intakeFormId": {
        "name": "intakeFormId",
        "type": "int",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "fileName": {
        "name": "fileName",
        "type": "varchar(300)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "mimeType": {
        "name": "mimeType",
        "type": "varchar(120)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "storageKey": {
        "name": "storageKey",
        "type": "varchar(500)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "storageUrl": {
        "name": "storageUrl",
        "type": "varchar(600)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "processStatus": {
        "name": "processStatus",
        "type": "enum('pending','processing','done','failed')",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "'pending'"
    },
    "processError": {
        "name": "processError",
        "type": "text",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "examDate": {
        "name": "examDate",
        "type": "varchar(20)",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "labName": {
        "name": "labName",
        "type": "varchar(255)",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "summary": {
        "name": "summary",
        "type": "text",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "createdAt": {
        "name": "createdAt",
        "type": "timestamp",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "(now())"
    },
    "updatedAt": {
        "name": "updatedAt",
        "type": "timestamp",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "(now())",
        "onUpdate": "now()"
    },
    "file_key": {
        "name": "file_key",
        "type": "varchar(512)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "file_url": {
        "name": "file_url",
        "type": "varchar(1024)",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "''"
    },
    "file_size": {
        "name": "file_size",
        "type": "int",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "0"
    },
    "raw_extraction": {
        "name": "raw_extraction",
        "type": "json",
        "primaryKey": False,
        "notNull": False,
        "autoincrement": False
    },
    "uploaded_by": {
        "name": "uploaded_by",
        "type": "enum('patient','doctor')",
        "primaryKey": False,
        "notNull": True,
        "autoincrement": False,
        "default": "'patient'"
    }
}

# Update the exam_files table in the snapshot
data["tables"]["exam_files"]["columns"] = new_exam_files_columns

# Update indexes to use new column names
data["tables"]["exam_files"]["indexes"] = {
    "examfiles_patient_idx": {
        "name": "examfiles_patient_idx",
        "columns": ["patientId"],
        "isUnique": False
    },
    "examfiles_intake_idx": {
        "name": "examfiles_intake_idx",
        "columns": ["intakeFormId"],
        "isUnique": False
    }
}

# Remove compositePrimaryKeys and uniqueConstraints if they reference old columns
if "compositePrimaryKeys" in data["tables"]["exam_files"]:
    data["tables"]["exam_files"]["compositePrimaryKeys"] = {}
if "uniqueConstraints" in data["tables"]["exam_files"]:
    data["tables"]["exam_files"]["uniqueConstraints"] = {}

with open(snapshot_path, "w") as f:
    json.dump(data, f, indent=2)

print("Snapshot updated successfully!")
print(f"New columns: {list(new_exam_files_columns.keys())}")
