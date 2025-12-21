/*
  Warnings:

  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserBlock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserBlock` table. All the data in the column will be lost.
  - The primary key for the `UserMute` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserMute` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[avatarId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bannerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "banner",
ADD COLUMN     "avatarId" TEXT,
ADD COLUMN     "bannerId" TEXT;

-- AlterTable
ALTER TABLE "UserBlock" DROP CONSTRAINT "UserBlock_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("blockerId", "blockedId");

-- AlterTable
ALTER TABLE "UserMute" DROP CONSTRAINT "UserMute_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "UserMute_pkey" PRIMARY KEY ("muterId", "mutedId");

-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_fileId_key" ON "Avatar"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "Banner_fileId_key" ON "Banner"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "User_avatarId_key" ON "User"("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "User_bannerId_key" ON "User"("bannerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
