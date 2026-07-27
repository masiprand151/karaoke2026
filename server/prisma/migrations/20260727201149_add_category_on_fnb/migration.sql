-- AlterTable
ALTER TABLE `fnb` ADD COLUMN `category` ENUM('food', 'drink', 'snack', 'other') NOT NULL DEFAULT 'other';
