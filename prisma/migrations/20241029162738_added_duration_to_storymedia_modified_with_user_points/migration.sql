/*
  Warnings:

  - You are about to drop the column `duratuin` on the `StoryMedia` table. All the data in the column will be lost.
  - You are about to alter the column `points` on the `UserPoints` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `StoryMedia` DROP COLUMN `duratuin`,
    ADD COLUMN `duration` INTEGER NULL;

-- AlterTable
ALTER TABLE `UserPoints` MODIFY `points` INTEGER NOT NULL;
