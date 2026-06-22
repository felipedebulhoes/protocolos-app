CREATE TABLE `admin_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_id` int NOT NULL,
	`action` enum('promote_to_admin','demote_from_admin','delete_user','update_user_role','password_reset_requested','login','logout') NOT NULL,
	`target_user_id` int,
	`target_email` varchar(320),
	`details` text,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `admin_audit_logs_admin_id_idx` ON `admin_audit_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_target_user_id_idx` ON `admin_audit_logs` (`target_user_id`);--> statement-breakpoint
CREATE INDEX `admin_audit_logs_created_at_idx` ON `admin_audit_logs` (`created_at`);