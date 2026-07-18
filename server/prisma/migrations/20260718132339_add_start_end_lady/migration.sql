/*
  Warnings:

  - Added the required column `end` to the `SessionLady` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `SessionLady` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `sessionlady` ADD COLUMN `end` DATETIME(3) NOT NULL,
    ADD COLUMN `start` DATETIME(3) NOT NULL;
