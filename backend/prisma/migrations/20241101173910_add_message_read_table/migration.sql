-- DropForeignKey
ALTER TABLE "MessageRead" DROP CONSTRAINT "MessageRead_user_id_fkey";

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
