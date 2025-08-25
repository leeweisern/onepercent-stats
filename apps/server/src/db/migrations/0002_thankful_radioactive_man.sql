CREATE TABLE `lead_status_history` (
	`id` integer PRIMARY KEY NOT NULL,
	`lead_id` integer NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`changed_at` text NOT NULL,
	`source` text DEFAULT 'api' NOT NULL,
	`changed_by` text,
	`note` text,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_lsh_lead_id` ON `lead_status_history` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_lsh_to_status_changed_at` ON `lead_status_history` (`to_status`,`changed_at`);--> statement-breakpoint
CREATE INDEX `idx_lsh_changed_at` ON `lead_status_history` (`changed_at`);--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platforms_name_unique` ON `platforms` (`name`);--> statement-breakpoint
CREATE TABLE `trainers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`handle` text NOT NULL,
	`name` text,
	`active` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trainers_handle_unique` ON `trainers` (`handle`);--> statement-breakpoint
ALTER TABLE `leads` ADD `platform_id` integer REFERENCES platforms(id);--> statement-breakpoint
ALTER TABLE `leads` ADD `trainer_id` integer REFERENCES trainers(id);