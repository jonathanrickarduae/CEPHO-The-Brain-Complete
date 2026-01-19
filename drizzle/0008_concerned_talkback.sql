CREATE TABLE `expert_coaching_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`coachType` enum('chief_of_staff','peer_expert','user') NOT NULL,
	`coachId` varchar(50),
	`focusArea` varchar(200) NOT NULL,
	`feedbackGiven` text NOT NULL,
	`improvementPlan` text,
	`metricsBeforeCoaching` json,
	`metricsAfterCoaching` json,
	`status` enum('scheduled','in_progress','completed','follow_up_needed') DEFAULT 'scheduled',
	`scheduledAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_coaching_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_collaboration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`initiatorExpertId` varchar(50) NOT NULL,
	`collaboratorExpertIds` json NOT NULL,
	`projectId` int,
	`taskDescription` text NOT NULL,
	`outcome` text,
	`qualityScore` int,
	`lessonsLearned` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_collaboration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`role` enum('user','expert','system') NOT NULL,
	`content` text NOT NULL,
	`projectId` int,
	`taskId` varchar(100),
	`sentiment` enum('positive','neutral','negative'),
	`qualityScore` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_domain_knowledge` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`domain` varchar(200) NOT NULL,
	`subDomain` varchar(200),
	`knowledgeLevel` enum('basic','intermediate','advanced','expert') DEFAULT 'advanced',
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	`updateFrequency` varchar(50) DEFAULT 'weekly',
	`sources` json,
	`keyFrameworks` json,
	`recentDevelopments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expert_domain_knowledge_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`category` varchar(100) NOT NULL,
	`title` varchar(300) NOT NULL,
	`insight` text NOT NULL,
	`evidence` text,
	`confidence` float DEFAULT 0.7,
	`tags` json,
	`projectId` int,
	`relatedExpertIds` json,
	`usageCount` int DEFAULT 0,
	`validatedBy` json,
	`status` enum('draft','validated','outdated','archived') DEFAULT 'draft',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expert_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`memoryType` enum('preference','fact','style','context','correction') NOT NULL,
	`key` varchar(200) NOT NULL,
	`value` text NOT NULL,
	`confidence` float DEFAULT 0.8,
	`source` varchar(100),
	`usageCount` int DEFAULT 0,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expert_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_prompt_evolution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`version` int NOT NULL,
	`promptAdditions` text,
	`communicationStyle` text,
	`strengthAdjustments` json,
	`weaknessAdjustments` json,
	`reason` text,
	`performanceBefore` float,
	`performanceAfter` float,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` varchar(50),
	CONSTRAINT `expert_prompt_evolution_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_research_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`topic` varchar(300) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`scheduledFor` timestamp,
	`completedAt` timestamp,
	`findings` text,
	`sourcesUsed` json,
	`insightsGenerated` json,
	`assignedBy` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_research_tasks_id` PRIMARY KEY(`id`)
);
