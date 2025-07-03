-- AlterTable
ALTER TABLE "Sala" ADD COLUMN     "color" TEXT,
ADD COLUMN     "esPrivada" BOOLEAN DEFAULT false,
ADD COLUMN     "fechaApertura" TIMESTAMP(3),
ADD COLUMN     "imagenPortada" TEXT,
ADD COLUMN     "maxColaboradores" INTEGER,
ADD COLUMN     "musica" TEXT,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "tema" TEXT,
ADD COLUMN     "texturaPared" TEXT,
ADD COLUMN     "texturaPiso" TEXT;
