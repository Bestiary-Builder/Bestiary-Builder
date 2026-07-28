/*
  Warnings:

  - You are about to drop the column `bookmarks` on the `Bestiaries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AutomationCollections" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Automations" ADD COLUMN     "index" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Bestiaries" DROP COLUMN "bookmarks";

-- Backfill the persisted child order from the existing deterministic fallback order.
WITH indexed_automations AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "collectionId" ORDER BY "lastUpdated", "id") - 1 AS "index"
    FROM "Automations"
)
UPDATE "Automations" AS automation
SET "index" = indexed_automations."index"
FROM indexed_automations
WHERE automation."id" = indexed_automations."id";

-- AlterTable
ALTER TABLE "AutomationCollections" ALTER COLUMN "description" DROP DEFAULT,
ALTER COLUMN "tags" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Automations" ALTER COLUMN "index" DROP DEFAULT;

-- CreateTable
CREATE TABLE "UserAutomationCollectionBookmarks" (
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAutomationCollectionBookmarks_pkey" PRIMARY KEY ("userId","collectionId")
);

-- CreateTable
CREATE TABLE "UserAutomationCollectionOrders" (
    "userId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "UserAutomationCollectionOrders_pkey" PRIMARY KEY ("userId","collectionId")
);

-- Give existing owner collections a stable initial order.
INSERT INTO "UserAutomationCollectionOrders" ("userId", "collectionId", "index")
SELECT "owner", "id", ROW_NUMBER() OVER (PARTITION BY "owner" ORDER BY "lastUpdated", "id") - 1
FROM "AutomationCollections";

-- CreateIndex
CREATE INDEX "UserAutomationCollectionBookmarks_userId_idx" ON "UserAutomationCollectionBookmarks"("userId");

-- CreateIndex
CREATE INDEX "UserAutomationCollectionBookmarks_collectionId_idx" ON "UserAutomationCollectionBookmarks"("collectionId");

-- CreateIndex
CREATE INDEX "UserAutomationCollectionOrders_userId_idx" ON "UserAutomationCollectionOrders"("userId");

-- AddForeignKey
ALTER TABLE "UserAutomationCollectionBookmarks" ADD CONSTRAINT "UserAutomationCollectionBookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAutomationCollectionBookmarks" ADD CONSTRAINT "UserAutomationCollectionBookmarks_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AutomationCollections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAutomationCollectionOrders" ADD CONSTRAINT "UserAutomationCollectionOrders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAutomationCollectionOrders" ADD CONSTRAINT "UserAutomationCollectionOrders_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AutomationCollections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
