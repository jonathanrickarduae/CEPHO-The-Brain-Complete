CREATE TABLE `collaborative_review_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('joined','viewed_section','commented','reviewed_section','completed_review') NOT NULL,
	`sectionId` varchar(100),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collaborative_review_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaborative_review_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`sectionId` varchar(100) NOT NULL,
	`comment` text NOT NULL,
	`parentCommentId` int,
	`status` enum('active','resolved','deleted') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaborative_review_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaborative_review_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','reviewer','viewer') NOT NULL DEFAULT 'viewer',
	`invitedBy` int,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`joinedAt` timestamp,
	`lastActiveAt` timestamp,
	CONSTRAINT `collaborative_review_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collaborative_review_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`templateId` varchar(100),
	`status` enum('active','completed','archived') NOT NULL DEFAULT 'active',
	`reviewData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaborative_review_sessions_id` PRIMARY KEY(`id`)
);
