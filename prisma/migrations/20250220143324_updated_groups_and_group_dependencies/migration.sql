/*
  Warnings:

  - You are about to drop the column `groupSettingsId` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_id]` on the table `GroupSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Group` DROP FOREIGN KEY `Group_groupSettingsId_fkey`;

-- DropIndex
DROP INDEX `Group_groupSettingsId_fkey` ON `Group`;

-- AlterTable
ALTER TABLE `Group` DROP COLUMN `groupSettingsId`;

-- CreateIndex
CREATE UNIQUE INDEX `GroupSettings_group_id_key` ON `GroupSettings`(`group_id`);

-- AddForeignKey
ALTER TABLE `GroupSettings` ADD CONSTRAINT `GroupSettings_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
