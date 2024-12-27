/*
  Warnings:

  - Added the required column `owner_id` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ChatAdmin_user_id_chat_id_idx";

-- DropIndex
DROP INDEX "MessageRead_user_id_message_id_idx";

-- DropIndex
DROP INDEX "UserChats_user_id_chat_id_idx";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "owner_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_updated_at_idx" ON "Chat"("updated_at");

-- CreateIndex
CREATE INDEX "Message_chat_id_user_id_idx" ON "Message"("chat_id", "user_id");

-- CreateIndex
CREATE INDEX "MessageRead_user_id_read_at_idx" ON "MessageRead"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
