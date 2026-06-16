CREATE TABLE `exam_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int,
	`intake_form_id` int,
	`file_key` varchar(512) NOT NULL,
	`file_url` varchar(1024) NOT NULL,
	`file_name` varchar(255) NOT NULL DEFAULT '',
	`mime_type` varchar(120) NOT NULL DEFAULT '',
	`file_size` int NOT NULL DEFAULT 0,
	`process_status` enum('pending','processing','done','failed') NOT NULL DEFAULT 'pending',
	`process_error` text,
	`raw_extraction` json,
	`exam_date` varchar(20),
	`lab_name` varchar(255),
	`uploaded_by` enum('patient','doctor') NOT NULL DEFAULT 'patient',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`exam_file_id` int NOT NULL,
	`analyte_key` varchar(80) NOT NULL,
	`raw_label` varchar(255) NOT NULL DEFAULT '',
	`value_num` double,
	`value_text` varchar(255),
	`unit` varchar(60),
	`ref_range` varchar(120),
	`abnormal_flag` enum('low','normal','high','unknown') NOT NULL DEFAULT 'unknown',
	`measured_at` varchar(20),
	`confidence` double,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `intake_forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`status` enum('pending','submitted','reviewed') NOT NULL DEFAULT 'pending',
	`patient_id` int,
	`invited_name` varchar(255),
	`invited_email` varchar(255),
	`invited_phone` varchar(40),
	`answers` json,
	`suggested_protocols` json,
	`rapport_summary` text,
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
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`full_name` varchar(255) NOT NULL DEFAULT '',
	`phone` varchar(40),
	`birth_date` varchar(20),
	`sex` enum('masculino','feminino','outro','nao_informado') NOT NULL DEFAULT 'nao_informado',
	`cpf` varchar(20),
	`city` varchar(120),
	`state` varchar(40),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`open_id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT '',
	`email` varchar(255),
	`avatar` varchar(1024),
	`role` enum('admin','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_open_id_unique` UNIQUE(`open_id`)
);
--> statement-breakpoint
CREATE INDEX `examfiles_patient_idx` ON `exam_files` (`patient_id`);--> statement-breakpoint
CREATE INDEX `examfiles_intake_idx` ON `exam_files` (`intake_form_id`);--> statement-breakpoint
CREATE INDEX `examresults_patient_idx` ON `exam_results` (`patient_id`);--> statement-breakpoint
CREATE INDEX `examresults_analyte_idx` ON `exam_results` (`analyte_key`);--> statement-breakpoint
CREATE INDEX `intake_token_idx` ON `intake_forms` (`token`);--> statement-breakpoint
CREATE INDEX `intake_patient_idx` ON `intake_forms` (`patient_id`);--> statement-breakpoint
CREATE INDEX `patients_email_idx` ON `patients` (`email`);