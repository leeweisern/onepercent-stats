PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leads` (
	`id` integer PRIMARY KEY NOT NULL,
	`month` text,
	`date` text NOT NULL,
	`name` text,
	`phone_number` text,
	`platform` text,
	`status` text DEFAULT 'New',
	`sales` integer,
	`remark` text,
	`trainer_handle` text,
	`closed_date` text,
	`closed_month` text,
	`closed_year` text,
	`contacted_date` text,
	`next_follow_up_date` text,
	`last_activity_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_leads`("id", "month", "date", "name", "phone_number", "platform", "status", "sales", "remark", "trainer_handle", "closed_date", "closed_month", "closed_year", "contacted_date", "next_follow_up_date", "last_activity_date", "created_at", "updated_at") SELECT "id", "month", "date", "name", "phone_number", "platform", "status", "sales", "remark", "trainer_handle", "closed_date", "closed_month", "closed_year", "contacted_date", "next_follow_up_date", "last_activity_date", "created_at", "updated_at" FROM `leads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;