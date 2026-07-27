-- CreateTable
CREATE TABLE `Purchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fnbId` INTEGER NOT NULL,
    `supplierName` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_fnbId_fkey` FOREIGN KEY (`fnbId`) REFERENCES `Fnb`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
