/*
  Warnings:

  - You are about to drop the column `collectionsId` on the `Products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_collectionsId_fkey";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "collectionsId",
ADD COLUMN     "collectionId" TEXT;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
