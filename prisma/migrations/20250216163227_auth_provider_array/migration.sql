/*
  Warnings:

  - You are about to drop the column `authProvider` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProvider",
ADD COLUMN     "authProviders" "AuthProvider"[] DEFAULT ARRAY['LOCAL']::"AuthProvider"[],
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
