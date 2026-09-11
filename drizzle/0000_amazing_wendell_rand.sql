CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_alerts_status` ON `alerts` (`status`);--> statement-breakpoint
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_items_status_workspace` ON `items` (`status`,`workspace`);