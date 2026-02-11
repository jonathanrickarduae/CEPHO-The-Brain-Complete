CREATE TABLE `activity_feed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`actorType` enum('user','digital_twin','ai_expert','system') NOT NULL,
	`actorId` varchar(100),
	`actorName` varchar(200),
	`action` varchar(100) NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`targetName` varchar(300),
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_feed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_provider_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`apiKey` text,
	`isEnabled` boolean DEFAULT true,
	`priority` int DEFAULT 1,
	`usageLimit` int,
	`currentUsage` int DEFAULT 0,
	`domains` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_provider_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`resource` varchar(100),
	`resourceId` varchar(100),
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`success` boolean DEFAULT true,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brand_kit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(200) NOT NULL,
	`isDefault` boolean DEFAULT false,
	`logoUrl` text,
	`logoLightUrl` text,
	`primaryColor` varchar(20),
	`secondaryColor` varchar(20),
	`accentColor` varchar(20),
	`fontFamily` varchar(100),
	`tagline` varchar(500),
	`description` text,
	`website` varchar(500),
	`socialLinks` json,
	`templates` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_kit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`projectType` varchar(100) NOT NULL,
	`checklistName` varchar(200) NOT NULL,
	`items` json NOT NULL,
	`completedCount` int DEFAULT 0,
	`totalCount` int NOT NULL,
	`status` enum('not_started','in_progress','completed','blocked') DEFAULT 'not_started',
	`dueDate` timestamp,
	`completedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_retention_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataType` varchar(100) NOT NULL,
	`retentionDays` int NOT NULL,
	`autoDelete` boolean DEFAULT false,
	`lastPurgeAt` timestamp,
	`nextPurgeAt` timestamp,
	`itemsDeleted` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_retention_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` varchar(50) NOT NULL,
	`providerAccountId` varchar(200),
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`scopes` json,
	`status` enum('active','expired','revoked','error') NOT NULL DEFAULT 'active',
	`lastSyncAt` timestamp,
	`syncError` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('info','success','warning','error','task_assigned','task_completed','project_update','integration_alert','security_alert','digital_twin','daily_brief','reminder','achievement') NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`actionUrl` varchar(500),
	`actionLabel` varchar(100),
	`read` boolean DEFAULT false,
	`readAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pii_detection_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceType` varchar(50) NOT NULL,
	`sourceId` int NOT NULL,
	`piiType` varchar(50) NOT NULL,
	`detectedText` text,
	`confidence` float,
	`status` enum('detected','reviewed','false_positive','redacted') DEFAULT 'detected',
	`reviewedBy` varchar(100),
	`reviewedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pii_detection_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_genesis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(300) NOT NULL,
	`type` enum('investment','partnership','acquisition','joint_venture','other') NOT NULL,
	`stage` enum('discovery','qualification','due_diligence','negotiation','documentation','closing','post_deal') NOT NULL DEFAULT 'discovery',
	`status` enum('active','on_hold','won','lost','abandoned') NOT NULL DEFAULT 'active',
	`counterparty` varchar(300),
	`dealValue` float,
	`currency` varchar(3) DEFAULT 'USD',
	`probability` int DEFAULT 50,
	`expectedCloseDate` timestamp,
	`description` text,
	`keyContacts` json,
	`documents` json,
	`tasks` json,
	`notes` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_genesis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`dueAt` timestamp NOT NULL,
	`repeatType` enum('none','daily','weekly','monthly','custom') DEFAULT 'none',
	`repeatInterval` int,
	`status` enum('pending','triggered','snoozed','completed','cancelled') DEFAULT 'pending',
	`snoozedUntil` timestamp,
	`relatedType` varchar(50),
	`relatedId` int,
	`notificationSent` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`type` enum('drawn','typed','uploaded') NOT NULL,
	`imageUrl` text NOT NULL,
	`fontFamily` varchar(100),
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`category` varchar(100),
	`cost` float,
	`billingCycle` enum('monthly','annual','one_time') DEFAULT 'monthly',
	`renewalDate` timestamp,
	`status` enum('active','cancelled','paused','trial') DEFAULT 'active',
	`usagePercent` int,
	`notes` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectId` int,
	`parentTaskId` int,
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('not_started','in_progress','blocked','review','completed','cancelled') NOT NULL DEFAULT 'not_started',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`dueDate` timestamp,
	`estimatedHours` float,
	`actualHours` float,
	`assignedTo` varchar(100),
	`dependencies` json,
	`blockerDescription` text,
	`completedAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `universal_inbox` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`source` enum('email','document','voice_note','whatsapp','slack','asana','calendar','manual','webhook') NOT NULL,
	`sourceId` varchar(200),
	`type` enum('email','document','task','meeting','note','attachment','message','reminder','other') NOT NULL,
	`title` varchar(500) NOT NULL,
	`preview` text,
	`content` text,
	`sender` varchar(300),
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`status` enum('unread','read','processing','processed','archived','deleted','action_required') NOT NULL DEFAULT 'unread',
	`processedBy` varchar(100),
	`processedResult` text,
	`attachments` json,
	`metadata` json,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `universal_inbox_id` PRIMARY KEY(`id`)
);
