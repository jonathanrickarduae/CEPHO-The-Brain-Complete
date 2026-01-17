CREATE TABLE `idea_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`assessmentType` enum('market_analysis','feasibility','competitive_landscape','financial_viability','resource_requirements','risk_assessment','timing_analysis','strategic_fit','sme_consultation') NOT NULL,
	`stage` int NOT NULL,
	`assessorType` enum('chief_of_staff','sme_expert','framework','user') NOT NULL DEFAULT 'framework',
	`assessorId` varchar(100),
	`questions` json,
	`findings` text,
	`score` float,
	`recommendation` enum('proceed','refine','pivot','reject','needs_more_info') NOT NULL DEFAULT 'needs_more_info',
	`refinementSuggestions` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `idea_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `idea_refinements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`fromStage` int NOT NULL,
	`toStage` int NOT NULL,
	`refinementType` enum('pivot','scope_change','target_market_change','business_model_change','investment_adjustment','feature_addition','feature_removal','timeline_adjustment','risk_mitigation') NOT NULL,
	`previousState` json,
	`changes` json,
	`rationale` text,
	`triggeredBy` enum('assessment','sme_feedback','user_input','chief_of_staff') NOT NULL DEFAULT 'assessment',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `idea_refinements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `innovation_ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`source` enum('manual','article','trend','conversation','chief_of_staff','sme_suggestion') NOT NULL DEFAULT 'manual',
	`sourceUrl` text,
	`sourceMetadata` json,
	`status` enum('captured','assessing','refining','validated','rejected','archived','promoted_to_genesis') NOT NULL DEFAULT 'captured',
	`currentStage` int NOT NULL DEFAULT 1,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`tags` json,
	`estimatedInvestment` json,
	`estimatedReturn` json,
	`confidenceScore` float,
	`briefDocument` text,
	`promotedToProjectId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `innovation_ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investment_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`scenarioName` varchar(100) NOT NULL,
	`investmentAmount` float NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'GBP',
	`breakdown` json,
	`projectedRevenue` json,
	`projectedProfit` json,
	`timeToBreakeven` int,
	`riskLevel` enum('low','medium','high','very_high') NOT NULL DEFAULT 'medium',
	`keyAssumptions` json,
	`recommendations` text,
	`isRecommended` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investment_scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trend_repository` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`category` varchar(100),
	`source` varchar(200),
	`sourceUrl` text,
	`trendStrength` enum('emerging','growing','mainstream','declining') NOT NULL DEFAULT 'emerging',
	`relevanceScore` float,
	`potentialImpact` enum('low','medium','high','transformative') NOT NULL DEFAULT 'medium',
	`timeHorizon` varchar(50),
	`relatedIndustries` json,
	`keyInsights` json,
	`linkedIdeaIds` json,
	`lastAnalyzedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trend_repository_id` PRIMARY KEY(`id`)
);
