ALTER TABLE `expert_chat_sessions` ADD `expertName` varchar(200);--> statement-breakpoint
ALTER TABLE `expert_chat_sessions` ADD `systemPrompt` text;--> statement-breakpoint
ALTER TABLE `expert_chat_sessions` ADD `projectId` int;--> statement-breakpoint
ALTER TABLE `expert_chat_sessions` ADD `summary` text;