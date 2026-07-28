-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "interestTags" TEXT[] DEFAULT ARRAY[]::TEXT[];
