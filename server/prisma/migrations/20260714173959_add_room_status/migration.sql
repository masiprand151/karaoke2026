-- AlterTable
ALTER TABLE `room` ADD COLUMN `status` ENUM('used', 'maintenent', 'standby', 'offline') NOT NULL DEFAULT 'standby';
