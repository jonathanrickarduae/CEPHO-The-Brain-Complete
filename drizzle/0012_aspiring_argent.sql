CREATE TABLE `expert_chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','expert','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`consultationId` int,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_chat_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`expertName` varchar(200) NOT NULL,
	`expertCategory` varchar(100),
	`topic` varchar(300),
	`summary` text,
	`recommendations` json,
	`userRating` int,
	`userFeedback` text,
	`duration` int,
	`messageCount` int DEFAULT 0,
	`projectId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expert_consultations_id` PRIMARY KEY(`id`)
);
