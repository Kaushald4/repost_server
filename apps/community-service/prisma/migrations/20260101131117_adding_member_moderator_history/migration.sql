/*
  Warnings:

  - Added the required column `updatedAt` to the `CommunityMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommunityMemberHistoryReason" AS ENUM ('JOINED', 'LEFT_VOLUNTARILY', 'REMOVED_BY_MODERATOR', 'BANNED', 'AUTO_EXPIRED');

-- CreateEnum
CREATE TYPE "CommunityModeratorHistoryAction" AS ENUM ('INVITED', 'ACCEPTED', 'REJECTED', 'REMOVED', 'ROLE_CHANGED');

-- AlterTable
ALTER TABLE "CommunityMember" ADD COLUMN     "bannedUntil" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "CommunityMemberHistory" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "leftAt" TIMESTAMP(3),
    "reason" "CommunityMemberHistoryReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMemberHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityModeratorHistory" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityModeratorRole" NOT NULL,
    "action" "CommunityModeratorHistoryAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityModeratorHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityMemberHistory_communityId_userId_idx" ON "CommunityMemberHistory"("communityId", "userId");
