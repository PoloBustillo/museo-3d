-- AlterTable
ALTER TABLE "Mural" ADD COLUMN     "artistId" TEXT;

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "facebook" TEXT,
    "especialidad" TEXT,
    "experiencia" TEXT,
    "formacion" TEXT,
    "premios" TEXT,
    "exposiciones" TEXT,
    "publicaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_userId_key" ON "Artist"("userId");

-- AddForeignKey
ALTER TABLE "Mural" ADD CONSTRAINT "Mural_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
