CREATE TABLE `cos_interaction_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interactionType` enum('question','clarification','correction','approval','rejection','feedback','preference','instruction') NOT NULL,
	`userInput` text NOT NULL,
	`cosResponse` text,
	`context` varchar(200),
	`extractedLearning` text,
	`learningCategory` varchar(100),
	`confidenceScore` float DEFAULT 0.5,
	`processed` boolean DEFAULT false,
	`appliedToModel` boolean DEFAULT false,
	`sessionId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cos_interaction_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cos_learned_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternType` enum('thinking_style','decision_pattern','communication_style','quality_standard','priority_pattern','workflow_pattern','format_preference','terminology','value','pet_peeve') NOT NULL,
	`patternName` varchar(200) NOT NULL,
	`patternDescription` text NOT NULL,
	`examples` json,
	`confidenceScore` float NOT NULL DEFAULT 0.5,
	`validatedByUser` boolean DEFAULT false,
	`occurrenceCount` int DEFAULT 1,
	`active` boolean DEFAULT true,
	`lastApplied` timestamp,
	`applicationCount` int DEFAULT 0,
	`sourceInteractionIds` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cos_learned_patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cos_learning_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricDate` timestamp NOT NULL,
	`periodType` enum('daily','weekly','monthly') NOT NULL,
	`totalInteractions` int DEFAULT 0,
	`correctionsReceived` int DEFAULT 0,
	`approvalsReceived` int DEFAULT 0,
	`newPatternsLearned` int DEFAULT 0,
	`patternsReinforced` int DEFAULT 0,
	`patternsInvalidated` int DEFAULT 0,
	`accuracyScore` float,
	`anticipationScore` float,
	`satisfactionScore` float,
	`previousAccuracyScore` float,
	`accuracyChange` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cos_learning_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cos_training_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`requiredLevel` int NOT NULL DEFAULT 1,
	`duration` varchar(50),
	`content` text,
	`learningObjectives` json,
	`hasAssessment` boolean DEFAULT false,
	`assessmentQuestions` json,
	`passingScore` int DEFAULT 80,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cos_training_modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cos_training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentLevel` int NOT NULL DEFAULT 1,
	`trainingPercentage` float NOT NULL DEFAULT 20,
	`completedModules` json,
	`currentModuleId` int,
	`lastTrainingActivity` timestamp,
	`levelUpAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cos_training_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cos_user_mental_model` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`thinkingStyle` text,
	`communicationStyle` text,
	`decisionMakingStyle` text,
	`topPriorities` json,
	`coreValues` json,
	`qualityStandards` json,
	`formatPreferences` json,
	`workflowPreferences` json,
	`communicationPreferences` json,
	`petPeeves` json,
	`avoidPatterns` json,
	`customTerminology` json,
	`overallConfidence` float DEFAULT 0.2,
	`lastMajorUpdate` timestamp,
	`interactionsProcessed` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cos_user_mental_model_id` PRIMARY KEY(`id`),
	CONSTRAINT `cos_user_mental_model_userId_unique` UNIQUE(`userId`)
);
