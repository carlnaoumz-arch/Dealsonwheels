CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`vehicle_name` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`branch` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointments_created_at_idx` ON `appointments` (`created_at`);