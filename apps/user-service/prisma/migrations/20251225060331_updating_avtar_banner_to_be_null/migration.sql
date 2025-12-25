-- DropIndex
DROP INDEX "Avatar_fileId_key";

-- DropIndex
DROP INDEX "Banner_fileId_key";

-- AlterTable
ALTER TABLE "Avatar" ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "fileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Banner" ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "fileId" DROP NOT NULL;
