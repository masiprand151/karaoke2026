/*
  Warnings:

  - You are about to alter the column `oldValue` on the `sessionlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `newValue` on the `sessionlog` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `sessionlog` MODIFY `oldValue` JSON NULL,
    MODIFY `newValue` JSON NULL;
