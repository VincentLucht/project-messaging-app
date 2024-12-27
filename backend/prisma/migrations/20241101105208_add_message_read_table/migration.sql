/*
  Warnings:

  - The values [delivered] on the enum `MessageStatuses` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatuses_new" AS ENUM ('sent', 'read', 'failed');
ALTER TABLE "Message" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Message" ALTER COLUMN "status" TYPE "MessageStatuses_new" USING ("status"::text::"MessageStatuses_new");
ALTER TYPE "MessageStatuses" RENAME TO "MessageStatuses_old";
ALTER TYPE "MessageStatuses_new" RENAME TO "MessageStatuses";
DROP TYPE "MessageStatuses_old";
ALTER TABLE "Message" ALTER COLUMN "status" SET DEFAULT 'sent';
COMMIT;

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_message_id_user_id_key" ON "MessageRead"("message_id", "user_id");

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
