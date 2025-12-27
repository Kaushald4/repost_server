/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,id]` on the table `Community` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Community_createdAt_id_key" ON "Community"("createdAt", "id");
