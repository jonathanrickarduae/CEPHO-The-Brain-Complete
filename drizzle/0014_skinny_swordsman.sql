CREATE TABLE `business_plan_review_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectName` varchar(300) NOT NULL,
	`versionNumber` int NOT NULL,
	`versionLabel` varchar(100),
	`overallScore` int,
	`sectionScores` json,
	`reviewData` json,
	`expertTeam` json,
	`teamSelectionMode` varchar(50),
	`businessPlanContent` text,
	`sectionDocuments` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_plan_review_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_follow_up_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reviewVersionId` int NOT NULL,
	`sectionId` varchar(100) NOT NULL,
	`expertId` varchar(100) NOT NULL,
	`question` text NOT NULL,
	`answer` text,
	`status` enum('pending','answered') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`answeredAt` timestamp,
	CONSTRAINT `expert_follow_up_questions_id` PRIMARY KEY(`id`)
);
