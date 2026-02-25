/*
  Warnings:

  - You are about to drop the column `artist` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" ADD COLUMN     "artistId" TEXT;

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "artist",
ADD COLUMN     "artistId" TEXT;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
