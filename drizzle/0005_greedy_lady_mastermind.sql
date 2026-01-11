CREATE TABLE `trusted_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceToken` varchar(64) NOT NULL,
	`deviceName` varchar(200),
	`userAgent` text,
	`ipAddress` varchar(45),
	`expiresAt` timestamp NOT NULL,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trusted_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `trusted_devices_deviceToken_unique` UNIQUE(`deviceToken`)
);
--> statement-breakpoint
CREATE TABLE `vault_access_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` enum('access_attempt','access_granted','access_denied','code_sent','code_verified','code_failed','session_expired','device_trusted','device_revoked') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`success` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vault_access_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`lastActivity` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vault_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `vault_sessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `vault_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(6) NOT NULL,
	`method` enum('email','sms') NOT NULL DEFAULT 'email',
	`expiresAt` timestamp NOT NULL,
	`used` boolean DEFAULT false,
	`attempts` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vault_verification_codes_id` PRIMARY KEY(`id`)
);
