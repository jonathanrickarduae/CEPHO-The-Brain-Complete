CREATE TABLE `output_quality_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`outputType` enum('report','document','analysis','presentation','email_draft','summary','recommendation','visualization','other') NOT NULL,
	`outputId` varchar(100),
	`outputTitle` varchar(300),
	`score` int NOT NULL,
	`issueCategory` enum('template_issue','formatting_problem','design_flaw','content_inaccuracy','missing_information','wrong_tone','too_long','too_short','unclear','other'),
	`issueDescription` text,
	`responsibleArea` enum('ai_generation','template_design','data_quality','user_input','system_bug','unknown'),
	`requiresAction` boolean DEFAULT false,
	`actionTaken` text,
	`actionTakenAt` timestamp,
	`scoredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `output_quality_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proactive_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`recommendationType` enum('workflow_improvement','feature_suggestion','integration_recommendation','automation_opportunity','efficiency_tip','learning_resource') NOT NULL,
	`triggeredBy` enum('usage_pattern','time_analysis','error_detection','underutilization','manual_observation') NOT NULL,
	`relatedPatternId` int,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`estimatedTimeSaved` int,
	`actionUrl` varchar(500),
	`actionSteps` json,
	`status` enum('pending','viewed','accepted','rejected','implemented') NOT NULL DEFAULT 'pending',
	`userResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`viewedAt` timestamp,
	`respondedAt` timestamp,
	CONSTRAINT `proactive_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_improvement_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`category` enum('template_fix','formatting_update','design_improvement','content_accuracy','feature_enhancement','bug_fix') NOT NULL,
	`relatedScoreIds` json,
	`occurrenceCount` int DEFAULT 1,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`impactScore` float,
	`assignedTo` varchar(200),
	`status` enum('open','in_progress','resolved','wont_fix') NOT NULL DEFAULT 'open',
	`resolution` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `quality_improvement_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_metrics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`snapshotDate` timestamp NOT NULL,
	`periodType` enum('daily','weekly','monthly') NOT NULL,
	`totalOutputs` int DEFAULT 0,
	`scoredOutputs` int DEFAULT 0,
	`averageScore` float,
	`scoreDistribution` json,
	`scoresByOutputType` json,
	`scoresByIssueCategory` json,
	`previousAverageScore` float,
	`scoreChange` float,
	`openTickets` int DEFAULT 0,
	`resolvedTickets` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quality_metrics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_activity_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('page_view','feature_use','button_click','form_submit','search','report_generate','conversation','file_access','integration_use') NOT NULL,
	`pagePath` varchar(500),
	`featureName` varchar(200),
	`componentId` varchar(200),
	`sessionId` varchar(100),
	`previousPage` varchar(500),
	`duration` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_activity_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflow_patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternName` varchar(200) NOT NULL,
	`patternType` enum('repetitive_task','inefficient_flow','feature_discovery','time_sink','successful_workflow') NOT NULL,
	`actionSequence` json NOT NULL,
	`frequency` int DEFAULT 1,
	`averageDuration` int,
	`efficiencyScore` float,
	`improvementPotential` float,
	`isAddressed` boolean DEFAULT false,
	`firstDetectedAt` timestamp NOT NULL DEFAULT (now()),
	`lastOccurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workflow_patterns_id` PRIMARY KEY(`id`)
);
