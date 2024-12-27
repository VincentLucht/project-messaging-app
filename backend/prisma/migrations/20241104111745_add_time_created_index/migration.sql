-- CreateIndex
CREATE INDEX "Message_chat_id_time_created_idx" ON "Message"("chat_id", "time_created");

-- CreateIndex
CREATE INDEX "MessageRead_user_id_message_id_idx" ON "MessageRead"("user_id", "message_id");
