/*
  Warnings:

  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "githubId",
DROP COLUMN "googleId",
ADD COLUMN     "authProvider" TEXT,
ADD COLUMN     "authProviderId" TEXT;
