ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'manus';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT (now());