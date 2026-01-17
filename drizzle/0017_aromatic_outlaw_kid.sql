CREATE TABLE `calendar_events_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`externalId` varchar(200),
	`title` varchar(500) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`isAllDay` boolean NOT NULL DEFAULT false,
	`location` varchar(500),
	`attendees` json,
	`source` varchar(50),
	`metadata` json,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evening_review_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reviewDate` timestamp NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`mode` enum('manual','auto_processed','delegated') NOT NULL DEFAULT 'manual',
	`tasksAccepted` int NOT NULL DEFAULT 0,
	`tasksDeferred` int NOT NULL DEFAULT 0,
	`tasksRejected` int NOT NULL DEFAULT 0,
	`moodScore` int,
	`wentWellNotes` text,
	`didntGoWellNotes` text,
	`signalItemsGenerated` int DEFAULT 0,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evening_review_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evening_review_task_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`taskId` int,
	`taskTitle` varchar(500) NOT NULL,
	`projectName` varchar(200),
	`decision` enum('accepted','deferred','rejected') NOT NULL,
	`priority` varchar(20),
	`estimatedTime` varchar(50),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evening_review_task_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_timing_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`averageStartTime` varchar(10),
	`averageDuration` int,
	`completionRate` float DEFAULT 0,
	`autoProcessRate` float DEFAULT 0,
	`sampleCount` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_timing_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signal_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceType` enum('evening_review','overnight_task','calendar','news','project_update','manual') NOT NULL,
	`sourceId` int,
	`category` enum('task_summary','project_update','calendar_alert','intelligence','recommendation','reflection') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`targetDate` timestamp NOT NULL,
	`status` enum('pending','delivered','actioned','dismissed') NOT NULL DEFAULT 'pending',
	`deliveredAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signal_items_id` PRIMARY KEY(`id`)
);
