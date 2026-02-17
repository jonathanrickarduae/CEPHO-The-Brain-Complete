CREATE TABLE `blueprint_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blueprintId` int NOT NULL,
	`version` int NOT NULL,
	`content` json,
	`fileUrl` text,
	`changeDescription` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blueprint_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blueprints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`name` varchar(300) NOT NULL,
	`description` text,
	`blueprintType` enum('opportunity_brief','concept_proposal','business_case','project_charter','gtm_plan','operations_playbook','retention_plan','exit_readiness','process_document','other') NOT NULL,
	`currentPhase` int NOT NULL DEFAULT 1,
	`status` enum('draft','in_review','approved','rejected','archived') NOT NULL DEFAULT 'draft',
	`version` int NOT NULL DEFAULT 1,
	`content` json,
	`fileUrl` text,
	`qualityGateStatus` enum('not_started','level_1_complete','level_2_complete','level_3_complete','level_4_complete') NOT NULL DEFAULT 'not_started',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blueprints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expert_panel_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expertId` varchar(100) NOT NULL,
	`panelTypeCode` enum('blue_team','left_field','red_team') NOT NULL,
	`expertCategory` varchar(100),
	`strengthAreas` json,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expert_panel_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons_learned` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`blueprintId` int,
	`phase` int,
	`category` enum('what_went_well','what_didnt_work','process_improvement','tool_recommendation','expert_insight','risk_mitigation') NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`impact` enum('low','medium','high') DEFAULT 'medium',
	`actionTaken` text,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_learned_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manus_delegation_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`blueprintId` int,
	`projectId` int,
	`phase` int,
	`processNumber` varchar(20),
	`activityName` varchar(200) NOT NULL,
	`delegationType` enum('document_generation','data_analysis','research','scheduling','communication','monitoring','reporting','quality_check') NOT NULL,
	`input` json,
	`output` json,
	`status` enum('pending','in_progress','completed','failed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manus_delegation_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pre_mortem_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`blueprintId` int,
	`projectId` int,
	`sessionType` enum('concept_pre_mortem','business_case_pre_mortem','launch_pre_mortem','churn_pre_mortem','buyer_objection_pre_mortem') NOT NULL,
	`scenario` text,
	`failureReasons` json,
	`criticalAssumptions` json,
	`mitigationStrategies` json,
	`panelId` int,
	`status` enum('scheduled','in_progress','completed') NOT NULL DEFAULT 'scheduled',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pre_mortem_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `process_playbooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phase` int NOT NULL,
	`processNumber` varchar(20) NOT NULL,
	`name` varchar(200) NOT NULL,
	`objective` text,
	`activities` json,
	`manusDelegation` json,
	`tools` json,
	`expertPanels` json,
	`qualityGateCriteria` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `process_playbooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quality_gates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`blueprintId` int NOT NULL,
	`phase` int NOT NULL,
	`gateName` varchar(200) NOT NULL,
	`level1Complete` boolean DEFAULT false,
	`level1CompletedAt` timestamp,
	`level1Notes` text,
	`level2Complete` boolean DEFAULT false,
	`level2CompletedAt` timestamp,
	`level2Notes` text,
	`level3Complete` boolean DEFAULT false,
	`level3CompletedAt` timestamp,
	`level3Notes` text,
	`level4Decision` enum('go','hold','recycle','kill'),
	`level4CompletedAt` timestamp,
	`level4Rationale` text,
	`gatekeeper` varchar(100) DEFAULT 'Chief of Staff',
	`status` enum('not_started','in_progress','passed','failed') NOT NULL DEFAULT 'not_started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quality_gates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sme_panel_consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`panelId` int NOT NULL,
	`blueprintId` int,
	`consultationType` enum('concept_review','pre_mortem','red_team_challenge','validation_review','quality_gate_review','ad_hoc') NOT NULL,
	`question` text,
	`findings` json,
	`recommendations` text,
	`risksIdentified` json,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sme_panel_consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sme_panel_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` enum('blue_team','left_field','red_team') NOT NULL,
	`description` text,
	`role` text,
	`typicalComposition` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sme_panel_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sme_panels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`blueprintId` int,
	`projectId` int,
	`panelTypeCode` enum('blue_team','left_field','red_team') NOT NULL,
	`name` varchar(200) NOT NULL,
	`purpose` text,
	`phase` int,
	`status` enum('assembling','active','completed','disbanded') NOT NULL DEFAULT 'assembling',
	`expertIds` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sme_panels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tool_integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`toolName` varchar(100) NOT NULL,
	`category` enum('project_management','ai_assistant','development','automation','content_creation','communication','business_crm','security','other') NOT NULL,
	`purpose` text,
	`plan` varchar(50),
	`status` enum('active','inactive','pending','error') NOT NULL DEFAULT 'pending',
	`apiKeyConfigured` boolean DEFAULT false,
	`lastSyncAt` timestamp,
	`healthScore` int DEFAULT 100,
	`alertMessage` text,
	`valueChainPhases` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tool_integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `value_chain_phases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phaseNumber` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`primaryFocus` text,
	`keyExpertPanels` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `value_chain_phases_id` PRIMARY KEY(`id`)
);
