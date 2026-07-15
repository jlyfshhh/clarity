CREATE TABLE `aquatic_events` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text,
	`habitat_id` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`due_date` text,
	`occurred_at` text NOT NULL,
	`actor_role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aquatic_event_task_due_unique` ON `aquatic_events` (`task_id`,`due_date`);--> statement-breakpoint
CREATE TABLE `aquatic_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`habitat_id` text NOT NULL,
	`title` text NOT NULL,
	`details` text NOT NULL,
	`category` text NOT NULL,
	`due_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `habitats` (
	`id` text PRIMARY KEY NOT NULL,
	`shared_habitat_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`location` text NOT NULL,
	`volume_gallons` real,
	`volume_label` text NOT NULL,
	`livestock` text NOT NULL,
	`linked_to_shed` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `water_readings` (
	`id` text PRIMARY KEY NOT NULL,
	`habitat_id` text NOT NULL,
	`parameter` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`recorded_at` text NOT NULL,
	`actor_role` text NOT NULL
);
