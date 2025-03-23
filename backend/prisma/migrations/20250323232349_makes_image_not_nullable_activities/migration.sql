/*
  Warnings:

  - Made the column `image` on table `Activities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Activities" ALTER COLUMN "image" SET NOT NULL;
