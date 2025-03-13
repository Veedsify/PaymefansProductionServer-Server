/*
  Warnings:

  - You are about to alter the column `post_status` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BlockedGroupParticipant` DROP FOREIGN KEY `BlockedGroupParticipant_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `GroupParticipants` DROP FOREIGN KEY `GroupParticipants_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `GroupSettings` DROP FOREIGN KEY `GroupSettings_group_id_fkey`;

-- DropIndex
DROP INDEX `BlockedGroupParticipant_group_id_fkey` ON `BlockedGroupParticipant`;

-- DropIndex
DROP INDEX `GroupParticipants_group_id_fkey` ON `GroupParticipants`;

-- AlterTable
ALTER TABLE `Post` MODIFY `post_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    MODIFY `post_audience` ENUM('public', 'private', 'price', 'followers', 'subscribers') NOT NULL;

-- AlterTable
ALTER TABLE `UserMedia` ADD COLUMN `media_state` ENUM('processing', 'completed') NOT NULL DEFAULT 'processing';

-- DropTable
DROP TABLE `Group`;

-- CreateTable
CREATE TABLE `Groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` CHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GroupParticipants` ADD CONSTRAINT `GroupParticipants_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupSettings` ADD CONSTRAINT `GroupSettings_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedGroupParticipant` ADD CONSTRAINT `BlockedGroupParticipant_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
