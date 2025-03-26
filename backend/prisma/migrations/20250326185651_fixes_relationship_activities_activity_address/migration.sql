/*
  Warnings:

  - You are about to drop the column `addressId` on the `Activities` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Activities` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `Activities` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activities" DROP CONSTRAINT "Activities_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Activities" DROP CONSTRAINT "Activities_type_fkey";

-- AlterTable
ALTER TABLE "Activities" DROP COLUMN "addressId",
DROP COLUMN "type",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Activities" ADD CONSTRAINT "Activities_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActivityTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAddress" ADD CONSTRAINT "ActivityAddress_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
