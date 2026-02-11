CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` varchar(100) NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `credit_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('referral','achievement','purchase','spend','bonus') NOT NULL,
	`description` varchar(500),
	`referenceId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `credit_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_bank` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('personal','work','preference','relationship','fact') NOT NULL,
	`key` varchar(200) NOT NULL,
	`value` text NOT NULL,
	`confidence` float DEFAULT 1,
	`source` varchar(100),
	`lastAccessed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memory_bank_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredEmail` varchar(320) NOT NULL,
	`referredUserId` int,
	`status` enum('pending','signed_up','active','churned') NOT NULL DEFAULT 'pending',
	`creditsAwarded` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`convertedAt` timestamp,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `streaks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(300) NOT NULL,
	`type` enum('document','conversation','preference','memory') NOT NULL,
	`content` text,
	`fileUrl` text,
	`fileSize` int,
	`tokenCount` int,
	`processed` boolean DEFAULT false,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`lifetimeEarned` int NOT NULL DEFAULT 0,
	`lifetimeSpent` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200),
	`referralCode` varchar(20) NOT NULL,
	`referredBy` varchar(20),
	`position` int NOT NULL,
	`status` enum('waiting','invited','joined','churned') NOT NULL DEFAULT 'waiting',
	`invitedAt` timestamp,
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `waitlist_id` PRIMARY KEY(`id`),
	CONSTRAINT `waitlist_email_unique` UNIQUE(`email`),
	CONSTRAINT `waitlist_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `wellness_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`overallScore` float NOT NULL,
	`moodScore` float,
	`productivityScore` float,
	`balanceScore` float,
	`momentumScore` float,
	`factors` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wellness_scores_id` PRIMARY KEY(`id`)
);
