CREATE TABLE `autonomy_levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domain` varchar(100) NOT NULL,
	`currentLevel` int NOT NULL DEFAULT 1,
	`targetLevel` int DEFAULT 3,
	`successfulActions` int DEFAULT 0,
	`correctedActions` int DEFAULT 0,
	`trustScore` int DEFAULT 0,
	`levelHistory` json,
	`lastLevelChange` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autonomy_levels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communication_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferenceType` enum('tone','length','format','timing','channel','frequency') NOT NULL,
	`context` varchar(100),
	`preference` varchar(200) NOT NULL,
	`preferenceDetails` text,
	`examples` json,
	`confidence` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communication_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `digital_twin_profile` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`communicationStyle` enum('direct','diplomatic','analytical','collaborative') DEFAULT 'direct',
	`decisionSpeed` enum('fast','measured','deliberate') DEFAULT 'measured',
	`riskTolerance` enum('conservative','moderate','aggressive') DEFAULT 'moderate',
	`preferredWorkHours` varchar(50),
	`focusAreas` json,
	`delegationStyle` enum('hands-on','trust-verify','full-autonomy') DEFAULT 'trust-verify',
	`personalityTraits` json,
	`coreValues` json,
	`priorities` json,
	`thinkingFrameworks` json,
	`profileCompleteness` int DEFAULT 0,
	`lastProfileUpdate` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digital_twin_profile_id` PRIMARY KEY(`id`),
	CONSTRAINT `digital_twin_profile_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `dt_decision_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('strategic','financial','operational','people','risk','creative','technical') NOT NULL,
	`patternName` varchar(200) NOT NULL,
	`patternDescription` text,
	`triggerConditions` json,
	`typicalResponse` text,
	`confidence` int DEFAULT 50,
	`occurrences` int DEFAULT 1,
	`learnedFrom` json,
	`lastObserved` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dt_decision_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('conversation','decision','feedback','correction','preference','behaviour') NOT NULL,
	`source` varchar(100) NOT NULL,
	`sourceId` varchar(100),
	`learningType` enum('pattern_new','pattern_reinforced','pattern_contradicted','preference_discovered','value_expressed','style_observed') NOT NULL,
	`content` text NOT NULL,
	`extractedInsights` json,
	`impactedPatterns` json,
	`impactedPreferences` json,
	`isProcessed` boolean DEFAULT false,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`answer` text NOT NULL,
	`answerMetadata` json,
	`isProcessed` boolean DEFAULT false,
	`extractedPatterns` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('identity','work_style','communication','decision_making','values','preferences') NOT NULL,
	`question` text NOT NULL,
	`questionType` enum('choice','scale','text','voice') NOT NULL,
	`options` json,
	`profileField` varchar(100),
	`patternCategory` varchar(100),
	`displayOrder` int DEFAULT 0,
	`isRequired` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_questions_id` PRIMARY KEY(`id`)
);
