/*
  Warnings:

  - You are about to drop the `PriceDuringOrder` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "OrdersStatus" ADD VALUE 'ORDER_PLACED';

-- DropForeignKey
ALTER TABLE "PriceDuringOrder" DROP CONSTRAINT "PriceDuringOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "PriceDuringOrder" DROP CONSTRAINT "PriceDuringOrder_productId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_ordersId_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "status",
ADD COLUMN     "status" "OrdersStatus" NOT NULL;

-- DropTable
DROP TABLE "PriceDuringOrder";

-- CreateTable
CREATE TABLE "OrderedProducts" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderedProducts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderedProducts" ADD CONSTRAINT "OrderedProducts_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedProducts" ADD CONSTRAINT "OrderedProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
