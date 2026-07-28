/*
  Warnings:

  - You are about to drop the column `value` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `type` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('SUPPORT', 'OPPOSE', 'SKIP');

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "value",
ADD COLUMN     "type" "VoteType" NOT NULL;

-- CreateIndex
CREATE INDEX "Content_isPublic_createdAt_idx" ON "Content"("isPublic", "createdAt");
