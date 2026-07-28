-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'CRYPTO');

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "assetId" TEXT;

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "symbol" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_type_providerId_key" ON "Asset"("type", "providerId");

-- CreateIndex
CREATE INDEX "Content_assetId_idx" ON "Content"("assetId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
