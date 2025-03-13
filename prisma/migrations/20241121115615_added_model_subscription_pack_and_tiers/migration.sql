-- CreateTable
CREATE TABLE `ModelSubscriptionPack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subscription_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `ModelSubscriptionPack_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelSubscriptionTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subscription_id` INTEGER NOT NULL,
    `tier_name` VARCHAR(191) NOT NULL,
    `tier_price` DOUBLE NOT NULL,
    `tier_description` VARCHAR(191) NOT NULL,
    `tier_duration` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ModelSubscriptionPack` ADD CONSTRAINT `ModelSubscriptionPack_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelSubscriptionTier` ADD CONSTRAINT `ModelSubscriptionTier_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `ModelSubscriptionPack`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
