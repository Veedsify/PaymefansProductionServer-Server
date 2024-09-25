-- AlterTable
ALTER TABLE `Post` ADD COLUMN `repost_id` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `repost_username` VARCHAR(191) NULL DEFAULT '';
