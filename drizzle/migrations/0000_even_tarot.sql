CREATE TABLE `exam_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int,
	`intakeFormId` int,
	`fileName` varchar(300) NOT NULL DEFAULT '',
	`mimeType` varchar(120) NOT NULL DEFAULT '',
	`storageKey` varchar(500) NOT NULL DEFAULT '',
	`storageUrl` varchar(600) NOT NULL DEFAULT '',
	`processStatus` enum('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
	`processError` text,
	`examDate` varchar(20),
	`labName` varchar(255),
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`file_key` varchar(512) NOT NULL DEFAULT '',
	`file_url` varchar(1024) NOT NULL DEFAULT '',
	`file_size` int NOT NULL DEFAULT 0,
	`raw_extraction` json,
	`uploaded_by` enum('patient','doctor') NOT NULL DEFAULT 'patient',
	CONSTRAINT `exam_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examFileId` int NOT NULL,
	`patientId` int,
	`analyteKey` varchar(80) NOT NULL,
	`analyteName` varchar(255) NOT NULL DEFAULT '',
	`valueNum` double,
	`valueText` varchar(255),
	`unit` varchar(60),
	`refRange` varchar(120),
	`flag` varchar(20),
	`measuredAt` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intake_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(48) NOT NULL,
	`patient_id` int,
	`status` enum('pending','in_progress','submitted','reviewed') NOT NULL DEFAULT 'pending',
	`invited_name` varchar(255),
	`invited_email` varchar(255),
	`invited_phone` varchar(40),
	`appointmentContext` text,
	`answers` json,
	`suggested_protocols` json,
	`rapport_summary` text,
	`doctorNotes` text,
	`submitted_at` timestamp,
	`reviewed_at` timestamp,
	`created_by_open_id` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intake_forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `intake_forms_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255),
	`full_name` varchar(255) NOT NULL DEFAULT '',
	`phone` varchar(40),
	`birth_date` varchar(20),
	`sex` varchar(16),
	`cpf` varchar(20),
	`city` varchar(120),
	`state` varchar(40),
	`notes` text,
	`lastSignedIn` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invitation_token` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`role` enum('viewer','editor','admin') NOT NULL DEFAULT 'viewer',
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`user_id` int,
	`invited_at` timestamp NOT NULL DEFAULT (now()),
	`signed_up_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_members_invitation_token_unique` UNIQUE(`invitation_token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`avatar` varchar(1024),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`phone` varchar(40),
	`crm` varchar(50),
	`specialization` varchar(255),
	`location` varchar(255),
	`bio` text,
	`totpSecret` varchar(255),
	`totpEnabled` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `examfiles_patient_idx` ON `exam_files` (`patientId`);--> statement-breakpoint
CREATE INDEX `examfiles_intake_idx` ON `exam_files` (`intakeFormId`);--> statement-breakpoint
CREATE INDEX `examresults_patient_idx` ON `exam_results` (`patientId`);--> statement-breakpoint
CREATE INDEX `examresults_analyte_idx` ON `exam_results` (`analyteKey`);--> statement-breakpoint
CREATE INDEX `intake_token_idx` ON `intake_forms` (`token`);--> statement-breakpoint
CREATE INDEX `intake_patient_idx` ON `intake_forms` (`patient_id`);--> statement-breakpoint
CREATE INDEX `patients_email_idx` ON `patients` (`email`);--> statement-breakpoint
CREATE INDEX `team_members_email_idx` ON `team_members` (`email`);--> statement-breakpoint
CREATE INDEX `team_members_token_idx` ON `team_members` (`invitation_token`);