/*
  Warnings:

  - You are about to drop the `PersonalCollection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonalCollectionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonalCollection" DROP CONSTRAINT "PersonalCollection_userId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalCollectionItem" DROP CONSTRAINT "PersonalCollectionItem_collectionId_fkey";

-- DropTable
DROP TABLE "PersonalCollection";

-- DropTable
DROP TABLE "PersonalCollectionItem";

-- CreateTable
CREATE TABLE "UserMuralFavorite" (
    "userId" TEXT NOT NULL,
    "muralId" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMuralFavorite_pkey" PRIMARY KEY ("userId","muralId")
);

-- CreateIndex
CREATE INDEX "UserMuralFavorite_userId_idx" ON "UserMuralFavorite"("userId");

-- CreateIndex
CREATE INDEX "UserMuralFavorite_muralId_idx" ON "UserMuralFavorite"("muralId");

-- AddForeignKey
ALTER TABLE "UserMuralFavorite" ADD CONSTRAINT "UserMuralFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMuralFavorite" ADD CONSTRAINT "UserMuralFavorite_muralId_fkey" FOREIGN KEY ("muralId") REFERENCES "Mural"("id") ON DELETE CASCADE ON UPDATE CASCADE;
