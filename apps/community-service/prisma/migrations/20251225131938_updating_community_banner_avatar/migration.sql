/*
  Warnings:

  - You are about to drop the column `banner` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Community` table. All the data in the column will be lost.
  - The `role` column on the `CommunityModerator` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `ownerId` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `CommunityRule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'RESTRICTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CommunityStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommunityMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "CommunityModeratorRole" AS ENUM ('OWNER', 'MODERATOR');

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "banner",
DROP COLUMN "icon",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "status" "CommunityStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "CommunityFollow" ADD COLUMN     "unfollowedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CommunityMember" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "status" "CommunityMemberStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "CommunityModerator" DROP COLUMN "role",
ADD COLUMN     "role" "CommunityModeratorRole" NOT NULL DEFAULT 'MODERATOR';

-- AlterTable
ALTER TABLE "CommunityRule" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Icon" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Banner_fileId_key" ON "Banner"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_communityId_key" ON "Banner"("communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Icon_fileId_key" ON "Icon"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Icon_communityId_key" ON "Icon"("communityId");

-- CreateIndex
CREATE INDEX "CommunityFollow_communityId_idx" ON "CommunityFollow"("communityId");

-- CreateIndex
CREATE INDEX "CommunityFollow_userId_idx" ON "CommunityFollow"("userId");

-- CreateIndex
CREATE INDEX "CommunityMember_communityId_idx" ON "CommunityMember"("communityId");

-- CreateIndex
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Icon" ADD CONSTRAINT "Icon_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
