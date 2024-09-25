-- AlterTable
ALTER TABLE `Model` MODIFY `verification_state` ENUM('not_started', 'started', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'not_started';
