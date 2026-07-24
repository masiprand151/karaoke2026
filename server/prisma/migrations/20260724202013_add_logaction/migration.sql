/*
  Warnings:

  - You are about to alter the column `type` on the `sessionlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(5))`.
  - You are about to alter the column `action` on the `sessionlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(6))`.

*/
-- AlterTable
ALTER TABLE `sessionlog` MODIFY `type` ENUM('lady', 'fnb', 'room', 'discount') NOT NULL,
    MODIFY `action` ENUM('update', 'create', 'delete') NOT NULL;
