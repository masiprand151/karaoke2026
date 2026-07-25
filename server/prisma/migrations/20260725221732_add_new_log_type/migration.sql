-- AlterTable
ALTER TABLE `sessionlog` MODIFY `type` ENUM('lady', 'fnb', 'room', 'discount', 'action', 'freeMinute', 'payment', 'checkout', 'checkin', 'duration') NOT NULL;
