/*
  Warnings:

  - The `imagenPortada` column on the `Sala` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "MuralColaborador" DROP CONSTRAINT "MuralColaborador_muralId_fkey";

-- DropForeignKey
ALTER TABLE "SalaMural" DROP CONSTRAINT "SalaMural_muralId_fkey";

-- AlterTable
ALTER TABLE "Mural" ADD COLUMN     "image360Url" TEXT,
ADD COLUMN     "image360Url2" TEXT;

-- AlterTable
ALTER TABLE "Sala" DROP COLUMN "imagenPortada",
ADD COLUMN     "imagenPortada" INTEGER;

-- AddForeignKey
ALTER TABLE "SalaMural" ADD CONSTRAINT "SalaMural_muralId_fkey" FOREIGN KEY ("muralId") REFERENCES "Mural"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuralColaborador" ADD CONSTRAINT "MuralColaborador_muralId_fkey" FOREIGN KEY ("muralId") REFERENCES "Mural"("id") ON DELETE CASCADE ON UPDATE CASCADE;
