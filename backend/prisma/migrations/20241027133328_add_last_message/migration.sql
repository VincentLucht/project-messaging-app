/*
  Warnings:

  - A unique constraint covering the columns `[last_message_id]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "last_message_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_last_message_id_key" ON "Chat"("last_message_id");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
