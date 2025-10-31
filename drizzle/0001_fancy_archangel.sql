CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectorId` int NOT NULL,
	`siteName` varchar(255) NOT NULL,
	`wasteType` enum('Organic','Inorganic','Mixed') NOT NULL,
	`collectionDate` date NOT NULL,
	`totalVolume` decimal(10,2) NOT NULL,
	`wasteSeparated` boolean NOT NULL DEFAULT false,
	`organicVolume` decimal(10,2),
	`inorganicVolume` decimal(10,2),
	`collectionCount` int NOT NULL DEFAULT 1,
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','collector') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `collections` ADD CONSTRAINT `collections_collectorId_users_id_fk` FOREIGN KEY (`collectorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;