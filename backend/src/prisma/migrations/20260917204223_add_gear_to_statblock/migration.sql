-- Alter creature statblocks
UPDATE "Creatures" SET stats = jsonb_insert(stats, '{description,gear}', '""', true);
