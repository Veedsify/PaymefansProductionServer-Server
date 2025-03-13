/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Model` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Model` MODIFY `token` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Model_token_key` ON `Model`(`token`);
