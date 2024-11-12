/*
  Warnings:

  - Made the column `stocksId` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "stocksId" SET NOT NULL;
