-- AlterTable
ALTER TABLE "Automations" ADD COLUMN     "tag" TEXT NOT NULL DEFAULT '';

-- Alter creature statblocks
UPDATE "Creatures" SET stats = jsonb_insert(stats, '{description,tag}', '""', true);
