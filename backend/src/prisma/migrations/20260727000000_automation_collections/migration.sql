-- Remove automations whose owners no longer exist before transferring ownership.
DELETE FROM "Automations"
WHERE NOT EXISTS (
    SELECT 1
    FROM "Users"
    WHERE "Users"."id" = "Automations"."owner"
);

-- CreateTable
CREATE TABLE "AutomationCollections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationCollections_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Automations" ADD COLUMN "collectionId" TEXT;

-- Create one default collection for each owner with existing automations.
INSERT INTO "AutomationCollections" ("id", "name", "owner", "lastUpdated")
SELECT 'default-' || "owner", 'My Automations', "owner", CURRENT_TIMESTAMP
FROM "Automations"
GROUP BY "owner";

-- Move each existing automation into its owner's default collection.
UPDATE "Automations"
SET "collectionId" = 'default-' || "owner";

-- AlterTable
ALTER TABLE "Automations" ALTER COLUMN "collectionId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "AutomationCollections_owner_idx" ON "AutomationCollections"("owner");

-- CreateIndex
CREATE INDEX "Automations_collectionId_idx" ON "Automations"("collectionId");

-- AddForeignKey
ALTER TABLE "AutomationCollections" ADD CONSTRAINT "AutomationCollections_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automations" ADD CONSTRAINT "Automations_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "AutomationCollections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX "Automations_owner_idx";

-- AlterTable
ALTER TABLE "Automations" DROP COLUMN "owner";
