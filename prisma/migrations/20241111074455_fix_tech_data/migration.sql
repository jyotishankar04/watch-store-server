/*
  Warnings:

  - A unique constraint covering the columns `[technicalDataId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TechnicalData" ADD COLUMN     "productsId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Products_technicalDataId_key" ON "Products"("technicalDataId");
