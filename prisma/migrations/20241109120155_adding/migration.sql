/*
  Warnings:

  - You are about to drop the column `warenty` on the `TechnicalData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TechnicalData" DROP COLUMN "warenty",
ADD COLUMN     "warranty" TEXT;
