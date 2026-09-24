-- Alter creature statblocks
UPDATE "Creatures" SET stats = jsonb_set(stats, '{description,gear}', '""', true);
