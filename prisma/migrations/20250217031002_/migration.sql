/*
  Warnings:

  - The values [GOOLGE] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('GOOGLE', 'FACEBOOK', 'EMAIL');
ALTER TABLE "User" ALTER COLUMN "authProviders" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "authProviders" TYPE "AuthProvider_new"[] USING ("authProviders"::text::"AuthProvider_new"[]);
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "AuthProvider_old";
ALTER TABLE "User" ALTER COLUMN "authProviders" SET DEFAULT ARRAY['EMAIL']::"AuthProvider"[];
COMMIT;
