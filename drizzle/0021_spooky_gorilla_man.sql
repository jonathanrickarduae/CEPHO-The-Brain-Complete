ALTER TABLE `subscriptions` MODIFY COLUMN `category` enum('ai_ml','productivity','development','marketing','design','communication','storage','analytics','finance','security','other') NOT NULL DEFAULT 'other';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `cost` float NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `billingCycle` enum('monthly','quarterly','annual','one_time','usage_based') NOT NULL DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `status` enum('active','paused','cancelled','trial') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `provider` varchar(200);--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `description` text;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `currency` varchar(10) DEFAULT 'AED' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `startDate` timestamp;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `trialEndDate` timestamp;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `websiteUrl` text;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `logoUrl` text;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `linkedIdeaId` int;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `linkedProjectId` int;