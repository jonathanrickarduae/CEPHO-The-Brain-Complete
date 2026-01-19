CREATE TABLE `daily_brief_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`briefDate` timestamp NOT NULL,
	`category` enum('key_insight','meeting','task','intelligence','recommendation') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('pending','got_it','deferred','delegated','digital_twin') NOT NULL DEFAULT 'pending',
	`actionedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_brief_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decision_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`decisionType` varchar(50) NOT NULL,
	`itemType` varchar(50) NOT NULL,
	`itemDescription` text,
	`context` varchar(100),
	`timeOfDay` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `decision_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50) NOT NULL,
	`score` float DEFAULT 80,
	`projectsCompleted` int DEFAULT 0,
	`positiveFeedback` int DEFAULT 0,
	`negativeFeedback` int DEFAULT 0,
	`lastUsed` timestamp,
	`notes` text,
	`status` enum('active','training','fired') NOT NULL DEFAULT 'active',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expert_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`expertId` varchar(50),
	`projectId` varchar(50),
	`rating` int,
	`feedbackType` enum('positive','negative','neutral','correction') NOT NULL,
	`feedbackText` text,
	`originalOutput` text,
	`correctedOutput` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `library_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` varchar(50),
	`folder` varchar(100) NOT NULL,
	`subFolder` varchar(100),
	`name` varchar(300) NOT NULL,
	`type` enum('document','image','chart','presentation','data','other') NOT NULL,
	`status` enum('draft','review','signed_off') NOT NULL DEFAULT 'draft',
	`fileUrl` text,
	`thumbnailUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `library_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`timeOfDay` enum('morning','afternoon','evening') NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`status` enum('not_started','in_progress','blocked','review','complete') NOT NULL DEFAULT 'not_started',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`progress` int DEFAULT 0,
	`dueDate` timestamp,
	`blockerDescription` text,
	`assignedExperts` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','twin') NOT NULL,
	`content` text NOT NULL,
	`contentType` enum('text','voice','action') NOT NULL DEFAULT 'text',
	`context` varchar(100),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `training_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `twin_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'completed',
	`autonomous` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `twin_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferenceKey` varchar(100) NOT NULL,
	`preferenceValue` text NOT NULL,
	`confidence` float DEFAULT 0.5,
	`source` varchar(50),
	`learnedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`theme` enum('light','dark','mix') NOT NULL DEFAULT 'dark',
	`governanceMode` enum('omni','governed') NOT NULL DEFAULT 'governed',
	`dailyBriefTime` varchar(10) DEFAULT '07:00',
	`eveningReviewTime` varchar(10) DEFAULT '18:00',
	`lastMoodCheckMorning` timestamp,
	`lastMoodCheckAfternoon` timestamp,
	`lastMoodCheckEvening` timestamp,
	`twinAutonomyLevel` int DEFAULT 1,
	`notificationsEnabled` boolean DEFAULT true,
	`sidebarCollapsed` boolean DEFAULT false,
	`onboardingComplete` boolean DEFAULT false,
	`metadata` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`term` varchar(200) NOT NULL,
	`meaning` text,
	`context` varchar(100),
	`frequency` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_patterns_id` PRIMARY KEY(`id`)
);
