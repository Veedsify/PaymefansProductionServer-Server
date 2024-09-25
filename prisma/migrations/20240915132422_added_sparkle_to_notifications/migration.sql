-- AlterTable
ALTER TABLE `Notifications` MODIFY `action` ENUM('follow', 'like', 'purchase', 'comment', 'repost', 'message', 'live', 'sparkle') NOT NULL;
