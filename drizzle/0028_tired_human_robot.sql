CREATE TABLE `compliance_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`framework` enum('soc2','gdpr','hipaa','iso27001','wcag') NOT NULL,
	`category` varchar(100) NOT NULL,
	`requirement` text NOT NULL,
	`status` enum('not_started','in_progress','implemented','verified','na') NOT NULL,
	`evidence` text,
	`owner` varchar(200),
	`due_date` timestamp,
	`completed_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_health` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`health_score` int NOT NULL,
	`engagement_level` enum('low','medium','high','champion') NOT NULL,
	`last_active_date` timestamp,
	`feature_adoption` json,
	`risk_level` enum('low','medium','high','critical') DEFAULT 'low',
	`next_check_in` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_health_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nps_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`score` int NOT NULL,
	`category` enum('detractor','passive','promoter') NOT NULL,
	`feedback` text,
	`touchpoint` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nps_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` enum('technology','distribution','strategic','integration','referral') NOT NULL,
	`status` enum('prospect','contacted','negotiating','active','inactive','churned') NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`contact_name` varchar(200),
	`contact_email` varchar(320),
	`value` varchar(100),
	`notes` text,
	`next_action` text,
	`next_action_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rag_contexts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`context_type` enum('conversation','document','preference','decision','memory') NOT NULL,
	`content` text NOT NULL,
	`embedding` json,
	`metadata` json,
	`relevance_score` float,
	`access_count` int DEFAULT 0,
	`last_accessed` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rag_contexts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_capabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`team_member` varchar(200) NOT NULL,
	`role` varchar(100) NOT NULL,
	`skill_category` varchar(100) NOT NULL,
	`skill_name` varchar(200) NOT NULL,
	`current_level` int NOT NULL,
	`target_level` int,
	`gap` int,
	`development_plan` text,
	`last_assessed` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_capabilities_id` PRIMARY KEY(`id`)
);
