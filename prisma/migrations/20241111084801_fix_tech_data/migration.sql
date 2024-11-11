/*
  Warnings:

  - You are about to drop the column `technicalDataId` on the `Dimensions` table. All the data in the column will be lost.
  - You are about to drop the column `productsId` on the `TechnicalData` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_technicalDataId_fkey";

-- DropForeignKey
ALTER TABLE "TechnicalData" DROP CONSTRAINT "TechnicalData_dimensionsId_fkey";

-- AlterTable
ALTER TABLE "Dimensions" DROP COLUMN "technicalDataId";

-- AlterTable
ALTER TABLE "TechnicalData" DROP COLUMN "productsId";

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_technicalDataId_fkey" FOREIGN KEY ("technicalDataId") REFERENCES "TechnicalData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalData" ADD CONSTRAINT "TechnicalData_dimensionsId_fkey" FOREIGN KEY ("dimensionsId") REFERENCES "Dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
