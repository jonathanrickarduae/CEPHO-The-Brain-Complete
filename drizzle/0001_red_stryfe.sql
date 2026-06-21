CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`projectSlug` varchar(64) DEFAULT '',
	`location` varchar(256) DEFAULT '',
	`notes` text DEFAULT (''),
	`isAllDay` int NOT NULL DEFAULT 0,
	`source` varchar(32) NOT NULL DEFAULT 'manual',
	`externalId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`context` text DEFAULT (''),
	`rationale` text DEFAULT (''),
	`outcome` text DEFAULT (''),
	`projectId` int,
	`impact` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('active','superseded','reversed') NOT NULL DEFAULT 'active',
	`madeBy` varchar(128) DEFAULT 'Jonathan',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companySlug` varchar(64) NOT NULL,
	`companyName` varchar(128) NOT NULL,
	`cashGbp` int NOT NULL DEFAULT 0,
	`burnMonthlyGbp` int NOT NULL DEFAULT 0,
	`revenueMonthlyGbp` int NOT NULL DEFAULT 0,
	`notes` text DEFAULT (''),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_data_companySlug_unique` UNIQUE(`companySlug`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`victoriaStyle` enum('direct','detailed','brief') NOT NULL DEFAULT 'direct',
	`victoriaAutobrief` int NOT NULL DEFAULT 1,
	`notificationsEmail` int NOT NULL DEFAULT 1,
	`notificationsPush` int NOT NULL DEFAULT 1,
	`googleCalendarConnected` int NOT NULL DEFAULT 0,
	`outlookConnected` int NOT NULL DEFAULT 0,
	`gmailConnected` int NOT NULL DEFAULT 0,
	`timezone` varchar(64) NOT NULL DEFAULT 'Europe/London',
	`currency` varchar(8) NOT NULL DEFAULT 'GBP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text DEFAULT (''),
	`projectId` int,
	`assignee` varchar(128) DEFAULT '',
	`dueDate` timestamp,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('todo','in_progress','done','blocked') NOT NULL DEFAULT 'todo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
