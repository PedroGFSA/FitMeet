/*
  Warnings:

  - You are about to drop the column `activityAddressId` on the `Activities` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `Activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activities" DROP CONSTRAINT "Activities_activityAddressId_fkey";

-- AlterTable
ALTER TABLE "Activities" DROP COLUMN "activityAddressId",
ADD COLUMN     "addressId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "ActivityAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
