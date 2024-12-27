/*
  Warnings:

  - The `status` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageStatuses" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "status",
ADD COLUMN     "status" "MessageStatuses" NOT NULL DEFAULT 'sent';
