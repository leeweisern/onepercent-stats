CREATE TABLE `advertising_costs` (
	`id` integer PRIMARY KEY NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`cost` real NOT NULL,
	`currency` text DEFAULT 'RM',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
