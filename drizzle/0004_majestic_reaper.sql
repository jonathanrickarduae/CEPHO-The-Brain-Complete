CREATE TABLE `commercialization_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` enum('competitor_analysis','feature_gap','market_research','pricing_review','regulatory_check','strategy_update') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','failed') DEFAULT 'pending',
	`priority` enum('low','medium','high') DEFAULT 'medium',
	`assignedExpert` varchar(100),
	`result` text,
	`scheduledFor` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commercialization_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitive_threats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('threat','opportunity') NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`competitorId` int,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`impact` text,
	`recommendedAction` text,
	`status` enum('new','analyzing','action_required','addressed','monitoring') DEFAULT 'new',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`addressedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitive_threats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`website` varchar(500),
	`description` text,
	`category` varchar(100),
	`pricing` varchar(100),
	`targetMarket` varchar(200),
	`strengths` json,
	`weaknesses` json,
	`threatLevel` enum('low','medium','high','critical') DEFAULT 'medium',
	`lastAnalyzed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competitors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_comparison` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureName` varchar(200) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text,
	`theBrainStatus` enum('not_started','in_progress','launched','superior') DEFAULT 'not_started',
	`theBrainScore` int DEFAULT 0,
	`competitorData` json,
	`importance` enum('low','medium','high','critical') DEFAULT 'medium',
	`notes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_comparison_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_position_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`overallScore` float NOT NULL,
	`featureParityScore` float,
	`uniqueValueScore` float,
	`marketShareEstimate` float,
	`competitorScores` json,
	`factors` json,
	`analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `market_position_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulatory_landscape` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(100) NOT NULL,
	`regulation` varchar(300) NOT NULL,
	`category` varchar(100),
	`status` enum('proposed','enacted','enforced') DEFAULT 'proposed',
	`effectiveDate` timestamp,
	`complianceStatus` enum('not_applicable','non_compliant','partial','compliant') DEFAULT 'not_applicable',
	`moatPotential` enum('none','low','medium','high') DEFAULT 'none',
	`description` text,
	`requirements` json,
	`notes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulatory_landscape_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `strategy_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('product','pricing','marketing','partnership','regulatory','technical') NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`title` varchar(300) NOT NULL,
	`recommendation` text NOT NULL,
	`rationale` text,
	`expectedImpact` text,
	`effort` enum('low','medium','high') DEFAULT 'medium',
	`timeframe` varchar(100),
	`status` enum('proposed','approved','in_progress','completed','rejected') DEFAULT 'proposed',
	`generatedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strategy_recommendations_id` PRIMARY KEY(`id`)
);
