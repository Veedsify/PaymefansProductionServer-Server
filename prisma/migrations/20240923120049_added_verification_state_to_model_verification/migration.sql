-- AlterTable
ALTER TABLE `Model` ADD COLUMN `verification_state` ENUM('not_started', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'not_started';
