CREATE TABLE `sme_feedback_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`taskId` int,
	`feedbackType` enum('positive','constructive','correction','training') NOT NULL,
	`feedback` text NOT NULL,
	`context` varchar(200),
	`applied` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sme_feedback_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sme_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`role` varchar(100),
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sme_team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sme_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`purpose` varchar(300),
	`projectId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sme_teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `task_qa_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`reviewType` enum('cos_review','secondary_ai','sme_feedback') NOT NULL,
	`reviewerId` varchar(100),
	`score` int,
	`feedback` text,
	`status` enum('pending','approved','rejected','needs_revision') NOT NULL DEFAULT 'pending',
	`improvements` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_qa_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tasks` MODIFY COLUMN `status` enum('not_started','in_progress','blocked','review','cos_approved','verified','completed','cancelled') NOT NULL DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE `tasks` ADD `teamId` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `progress` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `tasks` ADD `assignedExperts` json;--> statement-breakpoint
ALTER TABLE `tasks` ADD `cosScore` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `secondaryAiScore` int;--> statement-breakpoint
ALTER TABLE `tasks` ADD `qaStatus` enum('pending','cos_reviewed','secondary_reviewed','approved','rejected') DEFAULT 'pending';