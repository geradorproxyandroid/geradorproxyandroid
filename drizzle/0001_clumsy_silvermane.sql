CREATE TABLE `keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyValue` varchar(128) NOT NULL,
	`duration` enum('1','3','7','30') NOT NULL,
	`status` enum('available','used') NOT NULL DEFAULT 'available',
	`usedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `keys_keyValue_unique` UNIQUE(`keyValue`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `fullName` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);