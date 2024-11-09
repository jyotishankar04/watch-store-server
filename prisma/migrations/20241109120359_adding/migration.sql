/*
  Warnings:

  - You are about to drop the column `movementId` on the `TechnicalData` table. All the data in the column will be lost.
  - You are about to drop the `Movement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TechnicalData" DROP CONSTRAINT "TechnicalData_movementId_fkey";

-- AlterTable
ALTER TABLE "TechnicalData" DROP COLUMN "movementId",
ADD COLUMN     "movement" TEXT;

-- DropTable
DROP TABLE "Movement";
