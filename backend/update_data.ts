import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "~/shared/src/prisma-types";
import type { Creature } from "~/shared";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value || !value.trim()) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

async function main() {
	requireEnv("DATABASE_URL");

	// Start time
	const startTime = Date.now();

	await updateSavesData();
	const midTime = Date.now();
	console.log(`Saves time: ${midTime - startTime}ms`);

	await updateSkillsData();
	const endTime = Date.now();
	console.log(`Skills time: ${endTime - midTime}ms`);

	console.log(`Total time: ${endTime - startTime}ms`);
}

async function updateSavesData() {
	const totalCount = await prisma.creature.count({
		where: {
			stats: {
				path: ["abilities", "saves", "str", "adv"],
				equals: Prisma.DbNull
			}
		}
	});
	console.log(`Found ${totalCount} creatures to update saves`);
	for (let i = 0; i < totalCount;) {
		// Add new data to creature statblocks
		const creaturesToUpdate = await prisma.creature.findMany({
			take: 1000,
			where: {
				stats: {
					path: ["abilities", "saves", "str", "adv"],
					equals: Prisma.DbNull
				}
			}
		});
		const result = await prisma.$transaction(creaturesToUpdate.map(creature => createSavesOperation(creature)), {
			timeout: 60000,
			maxWait: 60000
		});
		i += result.length;
		console.log(`Updated ${creaturesToUpdate.length} (${i}) creature statblocks`);
	}
}

async function updateSkillsData() {
	const whereClause = {
		AND: [
			{
				stats: {
					path: ["abilities", "skills", "0"],
					not: Prisma.DbNull
				},
			},
			{
				stats: {
					path: ["abilities", "skills", "0", "adv"],
					equals: Prisma.DbNull
				},
			}
		]
	};

	const totalCount = await prisma.creature.count({
		where: whereClause
	});
	console.log(`Found ${totalCount} creatures to update skills`);
	for (let i = 0; i < totalCount;) {
		// Add new data to creature statblocks
		const creaturesToUpdate = await prisma.creature.findMany({
			take: 1000,
			where: whereClause
		});
		const result = await prisma.$transaction(creaturesToUpdate.map(creature => createSkillsOperation(creature)), {
			timeout: 60000,
			maxWait: 60000
		});
		i += result.length;
		console.log(`Updated ${result.length} (${i}) creature statblocks`);
	}
}

function createSavesOperation(creature: Creature) {
	const stats = creature.stats;
	stats.abilities.saves.str.adv = null;
	stats.abilities.saves.dex.adv = null;
	stats.abilities.saves.con.adv = null;
	stats.abilities.saves.wis.adv = null;
	stats.abilities.saves.int.adv = null;
	stats.abilities.saves.cha.adv = null;
	return prisma!.creature.update({
		where: { id: creature.id },
		data: { stats }
	});
}

function createSkillsOperation(creature: Creature) {
	const stats = creature.stats;
	stats.abilities.skills.forEach((skill) => {
		skill.adv = null;
	});
	return prisma!.creature.update({
		where: { id: creature.id },
		data: { stats }
	});
}

main().catch(async (err) => {
	console.error("Migration failed ❌");
	console.error(err);
	try {
		await prisma.$disconnect();
	}
	catch {}
	process.exit(1);
});
