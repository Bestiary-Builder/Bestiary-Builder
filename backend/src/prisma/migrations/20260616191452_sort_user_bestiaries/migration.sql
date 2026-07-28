-- AlterTable
ALTER TABLE "Bestiaries" ALTER COLUMN "lastUpdated" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Creatures" ALTER COLUMN "lastUpdated" DROP DEFAULT;

-- CreateTable
CREATE TABLE "UserBestiaryOrders" (
    "userId" TEXT NOT NULL,
    "bestiaryId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "UserBestiaryOrders_pkey" PRIMARY KEY ("userId","bestiaryId")
);

-- CreateIndex
CREATE INDEX "UserBestiaryOrders_userId_idx" ON "UserBestiaryOrders"("userId");

-- CreateIndex
CREATE INDEX "UserBestiaryBookmarks_userId_idx" ON "UserBestiaryBookmarks"("userId");

-- AddForeignKey
ALTER TABLE "UserBestiaryOrders" ADD CONSTRAINT "UserBestiaryOrders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBestiaryOrders" ADD CONSTRAINT "UserBestiaryOrders_bestiaryId_fkey" FOREIGN KEY ("bestiaryId") REFERENCES "Bestiaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
