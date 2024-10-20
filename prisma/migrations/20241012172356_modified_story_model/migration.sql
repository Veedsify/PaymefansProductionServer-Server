/*
  Warnings:

  - You are about to drop the column `expected_end` on the `userstory` table. All the data in the column will be lost.
  - You are about to drop the column `media_type` on the `userstory` table. All the data in the column will be lost.
  - You are about to drop the column `media_url` on the `userstory` table. All the data in the column will be lost.
  - You are about to drop the column `posted_at` on the `userstory` table. All the data in the column will be lost.
  - You are about to drop the column `story_content` on the `userstory` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `StoryMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `storymedia` ADD COLUMN `story_content` LONGTEXT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `userstory` DROP COLUMN `expected_end`,
    DROP COLUMN `media_type`,
    DROP COLUMN `media_url`,
    DROP COLUMN `posted_at`,
    DROP COLUMN `story_content`,
    MODIFY `story_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `StoryMedia` ADD CONSTRAINT `StoryMedia_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `UserStory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
