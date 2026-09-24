-- AlterTable
ALTER TABLE "AutomationCollections" ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Bestiaries" ADD COLUMN     "image" TEXT NOT NULL DEFAULT '';

-- Preserve the image currently displayed from the first Markdown image in each description.
UPDATE "Bestiaries"
SET "image" = substring("description" FROM '!\[[^]]*\]\(([^)]*)\)')
WHERE "description" ~ '!\[[^]]*\]\(([^)]*)\)';
