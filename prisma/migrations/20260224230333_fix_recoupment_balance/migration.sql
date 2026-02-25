/*
  Warnings:

  - A unique constraint covering the columns `[publisherId]` on the table `RecoupmentBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecoupmentBalance_publisherId_key" ON "RecoupmentBalance"("publisherId");
