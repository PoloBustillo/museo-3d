-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'ARTIST', 'CURATOR');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "settings" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Mural" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT,
    "tecnica" TEXT,
    "descripcion" TEXT,
    "anio" INTEGER,
    "url_imagen" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "ubicacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sala" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "creadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaMural" (
    "id" SERIAL NOT NULL,
    "salaId" INTEGER NOT NULL,
    "muralId" INTEGER NOT NULL,

    CONSTRAINT "SalaMural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalCollectionItem" (
    "id" SERIAL NOT NULL,
    "artworkId" TEXT NOT NULL,
    "artworkType" TEXT NOT NULL,
    "artworkData" JSONB NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "PersonalCollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalCollection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SalaColaboradores" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SalaColaboradores_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "SalaMural_salaId_muralId_key" ON "SalaMural"("salaId", "muralId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalCollection_userId_key" ON "PersonalCollection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "_SalaColaboradores_B_index" ON "_SalaColaboradores"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sala" ADD CONSTRAINT "Sala_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaMural" ADD CONSTRAINT "SalaMural_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaMural" ADD CONSTRAINT "SalaMural_muralId_fkey" FOREIGN KEY ("muralId") REFERENCES "Mural"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalCollectionItem" ADD CONSTRAINT "PersonalCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "PersonalCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalCollection" ADD CONSTRAINT "PersonalCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalaColaboradores" ADD CONSTRAINT "_SalaColaboradores_A_fkey" FOREIGN KEY ("A") REFERENCES "Sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SalaColaboradores" ADD CONSTRAINT "_SalaColaboradores_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
