/*
  Warnings:

  - Added the required column `password` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "password" TEXT NOT NULL;
