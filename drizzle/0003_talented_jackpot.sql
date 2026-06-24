CREATE TABLE `ipBlocks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ip` varchar(45) NOT NULL,
	`userId` int,
	`reason` text,
	`blockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ipBlocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `ipBlocks_ip_unique` UNIQUE(`ip`)
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`keyValue` varchar(128) NOT NULL,
	`duration` varchar(10) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'available',
	`usedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `keys_keyValue_unique` UNIQUE(`keyValue`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`openId` varchar(64),
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(255),
	`fullName` varchar(255) NOT NULL DEFAULT '',
	`credits` int NOT NULL DEFAULT 0,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`registeredIp` varchar(45),
	`isIpBlocked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
