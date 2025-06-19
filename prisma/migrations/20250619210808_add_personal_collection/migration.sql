-- CreateTable
CREATE TABLE "PersonalCollection" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalCollection_userId_key" ON "PersonalCollection"("userId");

-- AddForeignKey
ALTER TABLE "PersonalCollection" ADD CONSTRAINT "PersonalCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
