CREATE TABLE `favorite_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactType` enum('expert','corporate_partner','ai_expert','colleague') NOT NULL,
	`contactId` varchar(100) NOT NULL,
	`contactName` varchar(200) NOT NULL,
	`contactAvatar` varchar(500),
	`order` int DEFAULT 0,
	`isFavorited` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `favorite_contacts_id` PRIMARY KEY(`id`)
);
