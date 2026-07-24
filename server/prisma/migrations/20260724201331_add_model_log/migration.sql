-- CreateTable
CREATE TABLE `SessionLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `transactionId` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `targetId` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `oldValue` VARCHAR(191) NULL,
    `newValue` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SessionLog` ADD CONSTRAINT `SessionLog_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `Session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
