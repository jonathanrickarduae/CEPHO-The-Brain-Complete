CREATE TABLE `ai_smes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`title` varchar(256) NOT NULL,
	`domain` varchar(64) NOT NULL,
	`subDomain` varchar(128),
	`expertise` text NOT NULL DEFAULT ('[]'),
	`systemPrompt` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`consultCount` int NOT NULL DEFAULT 0,
	`avgRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_smes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`smeId` int NOT NULL,
	`smeName` varchar(128) NOT NULL,
	`projectId` int,
	`messages` text NOT NULL DEFAULT ('[]'),
	`rating` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`name` varchar(256) NOT NULL,
	`fileType` varchar(16) NOT NULL,
	`fileSize` int,
	`storageKey` varchar(512) NOT NULL,
	`storageUrl` text,
	`isConfidential` int NOT NULL DEFAULT 0,
	`uploadedBy` varchar(64),
	`tags` text NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `genesis_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaTitle` varchar(256) NOT NULL,
	`ideaSummary` text NOT NULL,
	`stage` enum('concept','market','model','team','risk','execution','complete') NOT NULL DEFAULT 'concept',
	`answers` text NOT NULL DEFAULT ('{}'),
	`aiAnalysis` text NOT NULL DEFAULT ('{}'),
	`overallScore` int,
	`recommendation` enum('proceed','pivot','pause','stop'),
	`convertedToProjectId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `genesis_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `innovations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`category` enum('product','process','market','technology','partnership','other') NOT NULL DEFAULT 'other',
	`status` enum('idea','exploring','testing','adopted','archived') NOT NULL DEFAULT 'idea',
	`linkedProjectId` int,
	`aiInsight` text,
	`tags` text NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `innovations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('victoria','sme','genesis','project','user') NOT NULL,
	`sourceId` varchar(64),
	`category` varchar(64) NOT NULL,
	`insight` text NOT NULL,
	`context` text NOT NULL DEFAULT ('{}'),
	`confidence` int NOT NULL DEFAULT 50,
	`appliedCount` int NOT NULL DEFAULT 0,
	`isVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`status` enum('red','amber','green') NOT NULL DEFAULT 'green',
	`accentColor` varchar(16) NOT NULL DEFAULT '#00D4FF',
	`initials` varchar(4) NOT NULL,
	`overview` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `projects_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `victoria_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int,
	`context` varchar(64) NOT NULL DEFAULT 'general',
	`messages` text NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `victoria_conversations_id` PRIMARY KEY(`id`)
);
