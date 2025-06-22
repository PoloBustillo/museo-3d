/*
  Warnings:

  - You are about to drop the `UserMuralFavorite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserMuralFavorite" DROP CONSTRAINT "UserMuralFavorite_muralId_fkey";

-- DropForeignKey
ALTER TABLE "UserMuralFavorite" DROP CONSTRAINT "UserMuralFavorite_userId_fkey";

-- DropTable
DROP TABLE "UserMuralFavorite";

-- CreateTable
CREATE TABLE "user_mural_favorites" (
    "userId" TEXT NOT NULL,
    "muralId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_mural_favorites_pkey" PRIMARY KEY ("userId","muralId")
);

-- AddForeignKey
ALTER TABLE "user_mural_favorites" ADD CONSTRAINT "user_mural_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_mural_favorites" ADD CONSTRAINT "user_mural_favorites_muralId_fkey" FOREIGN KEY ("muralId") REFERENCES "Mural"("id") ON DELETE CASCADE ON UPDATE CASCADE;
