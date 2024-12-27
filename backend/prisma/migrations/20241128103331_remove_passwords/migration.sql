/*
  Warnings:

  - You are about to drop the column `is_password_protected` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "is_password_protected",
DROP COLUMN "password";
