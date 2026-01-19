CREATE TABLE `voice_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`category` enum('task','idea','reminder','observation','question','follow_up') NOT NULL DEFAULT 'observation',
	`audioUrl` varchar(500),
	`duration` int,
	`projectId` int,
	`projectName` varchar(300),
	`isActionItem` boolean DEFAULT false,
	`isProcessed` boolean DEFAULT false,
	`extractedTasks` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `voice_notes_id` PRIMARY KEY(`id`)
);
