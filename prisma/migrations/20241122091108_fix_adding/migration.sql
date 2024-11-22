/*
  Warnings:

  - Added the required column `quantity` to the `OrderedProducts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `paymentType` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentMethods" AS ENUM ('CREDIT_CARD', 'UPI', 'NET_BANKING', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "OrderedProducts" ADD COLUMN     "quantity" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "paymentType",
ADD COLUMN     "paymentType" "PaymentMethods" NOT NULL;
