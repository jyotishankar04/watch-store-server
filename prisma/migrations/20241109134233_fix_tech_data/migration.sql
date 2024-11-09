/*
  Warnings:

  - Added the required column `technicalDataId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TechnicalData" DROP CONSTRAINT "TechnicalData_productsId_fkey";

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "technicalDataId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_technicalDataId_fkey" FOREIGN KEY ("technicalDataId") REFERENCES "TechnicalData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
