CREATE TABLE `leads` (
	`id` integer PRIMARY KEY NOT NULL,
	`month` text,
	`date` text,
	`name` text,
	`phone_number` text,
	`platform` text,
	`is_closed` integer,
	`status` text,
	`sales` integer,
	`follow_up` text,
	`appointment` text,
	`remark` text,
	`trainer_handle` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
