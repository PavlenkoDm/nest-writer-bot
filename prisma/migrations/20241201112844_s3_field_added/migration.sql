/*
  Warnings:

  - You are about to drop the column `linkToLoadFile` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "linkToLoadFile",
ADD COLUMN     "s3BucketKey" TEXT NOT NULL DEFAULT '';
