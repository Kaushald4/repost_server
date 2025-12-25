-- CreateEnum
CREATE TYPE "CommunityModeratorStatus" AS ENUM ('INVITED', 'ACTIVE', 'REJECTED', 'REMOVED');

-- AlterTable
ALTER TABLE "CommunityModerator" ADD COLUMN     "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "status" "CommunityModeratorStatus" NOT NULL DEFAULT 'INVITED';
