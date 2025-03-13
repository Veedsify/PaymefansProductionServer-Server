-- AlterTable
ALTER TABLE `Post` MODIFY `content` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `PostCommentLikes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `like_id` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `PostCommentLikes_comment_id_fkey`(`comment_id`),
    INDEX `PostCommentLikes_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointConversionRateUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `pointConversionRateId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointConversionRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NULL,
    `points` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupParticipants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Group` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` CHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `groupSettingsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GroupSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `group_icon` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlockedGroupParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `group_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PostCommentLikes` ADD CONSTRAINT `PostCommentLikes_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `PostComment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostCommentLikes` ADD CONSTRAINT `PostCommentLikes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointConversionRateUsers` ADD CONSTRAINT `PointConversionRateUsers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointConversionRateUsers` ADD CONSTRAINT `PointConversionRateUsers_pointConversionRateId_fkey` FOREIGN KEY (`pointConversionRateId`) REFERENCES `PointConversionRate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupParticipants` ADD CONSTRAINT `GroupParticipants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GroupParticipants` ADD CONSTRAINT `GroupParticipants_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_groupSettingsId_fkey` FOREIGN KEY (`groupSettingsId`) REFERENCES `GroupSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedGroupParticipant` ADD CONSTRAINT `BlockedGroupParticipant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedGroupParticipant` ADD CONSTRAINT `BlockedGroupParticipant_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
