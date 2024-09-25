/*
  Warnings:

  - Added the required column `username` to the `LiveStream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `LiveStream` ADD COLUMN `username` VARCHAR(191) NOT NULL;
