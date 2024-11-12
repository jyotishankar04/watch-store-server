/*
  Warnings:

  - A unique constraint covering the columns `[stocksId]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "stocksId" TEXT;

-- CreateTable
CREATE TABLE "Stocks" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Products_stocksId_key" ON "Products"("stocksId");

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_stocksId_fkey" FOREIGN KEY ("stocksId") REFERENCES "Stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
