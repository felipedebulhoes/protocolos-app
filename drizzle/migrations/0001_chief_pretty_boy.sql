ALTER TABLE `patients` MODIFY COLUMN `cpf` varchar(255);--> statement-breakpoint
ALTER TABLE `intake_forms` ADD `scheduled` tinyint DEFAULT 0 NOT NULL;