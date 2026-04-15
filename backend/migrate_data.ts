import "dotenv/config";
import type { ObjectId } from "mongodb";
import { MongoClient } from "mongodb";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateUserSecret } from "./utilities/constants";
import { BestiaryStatus, PrismaClient, SupporterStatus } from "~/shared/src/prisma-types";

/**
 * Standalone migration script:
 * MongoDB -> PostgreSQL (via Prisma)
 *
 * Required env vars:
 * - MongoDB                 (Mongo connection URI)
 * - MongoDB_DBName          (Mongo database name, default: bestiarybuilder)
 * - DATABASE_URL            (PostgreSQL URL used by Prisma)
 *
 * Run:
 *   npx tsx migrate_data.ts
 */

interface MongoUser {
	_id: string;
	username: string;
	avatar: string;
	email: string;
	verified: boolean;
	banner_color: string;
	global_name: string;
	bestiaries?: ObjectId[];
	bookmarks?: ObjectId[];
	supporter?: 0 | 1 | 2 | number;
	joinedAt?: number;
	secret?: string;
}

interface MongoBestiary {
	_id: ObjectId;
	name: string;
	owner: string;
	editors?: string[];
	status: "public" | "private" | "unlisted" | string;
	description: string;
	creatures?: ObjectId[];
	tags?: string[];
	viewCount?: number;
	bookmarks?: number;
	lastUpdated?: number;
}

interface MongoCreature {
	_id: ObjectId;
	lastUpdated?: number;
	stats: unknown;
	bestiary: ObjectId;
}

interface MongoAutomation {
	_id: ObjectId;
	name: string;
	description: string;
	owner: string;
	lastUpdated?: number;
	automation?: unknown;
}

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

function toStatus(status: string): BestiaryStatus {
	switch (status) {
		case "public": return BestiaryStatus.public;
		case "unlisted": return BestiaryStatus.unlisted;
		default: return BestiaryStatus.private;
	}
}

function toSupporterStatus(supporter: number | undefined): SupporterStatus {
	switch (supporter) {
		case 1: return SupporterStatus.wirmling;
		case 2: return SupporterStatus.greatwyrm;
		default: return SupporterStatus.none;
	}
}

async function main() {
	const mongoUri = requireEnv("MongoDB");
	const mongoDbName = process.env.MongoDB_DBName || "bestiarybuilder";
	requireEnv("DATABASE_URL");

	const mongo = new MongoClient(mongoUri);

	console.log("Connecting to MongoDB...");
	await mongo.connect();
	const db = mongo.db(mongoDbName);

	const usersCol = db.collection<MongoUser>("Users");
	const bestiariesCol = db.collection<MongoBestiary>("Bestiaries");
	const creaturesCol = db.collection<MongoCreature>("Creatures");
	const automationsCol = db.collection<MongoAutomation>("Automations");

	console.log("Reading source data from MongoDB...");
	const [users, bestiaries, creatures, automations] = await Promise.all([
		usersCol.find({}).toArray(),
		bestiariesCol.find({}).toArray(),
		creaturesCol.find({}).toArray(),
		automationsCol.find({}).toArray(),
	]);

	console.log(`Users: ${users.length}`);
	console.log(`Bestiaries: ${bestiaries.length}`);
	console.log(`Creatures: ${creatures.length}`);
	console.log(`Automations: ${automations.length}`);

	// Build quick-lookup sets for integrity checks
	const userIds = new Set(users.map(u => String(u._id)));
	const bestiaryIds = new Set(bestiaries.map(b => b._id.toHexString()));

	console.log("Clearing target PostgreSQL tables...");
	await prisma.$transaction([
		prisma.bestiaryEditor.deleteMany(),
		prisma.userBestiaryBookmark.deleteMany(),
		prisma.creature.deleteMany(),
		prisma.automation.deleteMany(),
		prisma.bestiary.deleteMany(),
		prisma.user.deleteMany(),
	]);

	console.log("Migrating users...");
	for (const u of users) {
		await prisma.user.create({
			data: {
				id: String(u._id),
				username: u.username ?? "",
				avatar: u.avatar ?? "",
				email: u.email ?? "",
				verified: Boolean(u.verified),
				globalName: u.global_name ?? "",
				bannerColor: u.banner_color ?? "",
				supporter: toSupporterStatus(u.supporter ?? 0),
				joinedAt: new Date(u.joinedAt ?? Date.now()),
				secret: u.secret ?? generateUserSecret(),
			},
		});
	}

	console.log("Migrating bestiaries...");
	for (const b of bestiaries) {
		const id = b._id.toHexString();
		// Ensure owner exists
		if (!userIds.has(b.owner)) {
			console.warn(`Skipping bestiary ${id} because owner ${b.owner} does not exist`);
			continue;
		}

		await prisma.bestiary.create({
			data: {
				id,
				name: b.name ?? "",
				ownerId: b.owner,
				status: toStatus(b.status),
				description: b.description ?? "",
				tags: Array.isArray(b.tags) ? b.tags : [],
				viewCount: b.viewCount ?? 0,
				bookmarks: b.bookmarks ?? 0,
				lastUpdated: new Date(b.lastUpdated ?? Date.now()),
			},
		});
	}

	console.log("Migrating bestiary editors...");
	for (const b of bestiaries) {
		const bestiaryId = b._id.toHexString();
		if (!bestiaryIds.has(bestiaryId))
			continue;
		if (!Array.isArray(b.editors))
			continue;

		for (const editorId of b.editors) {
			if (!userIds.has(editorId))
				continue;

			await prisma.bestiaryEditor.upsert({
				where: {
					bestiaryId_userId: {
						bestiaryId,
						userId: editorId,
					},
				},
				update: {},
				create: {
					bestiaryId,
					userId: editorId,
				},
			});
		}
	}

	console.log("Migrating creatures...");
	for (const c of creatures) {
		const id = c._id.toHexString();
		const bestiaryId = c.bestiary?.toHexString?.() ?? "";

		if (!bestiaryIds.has(bestiaryId)) {
			console.warn(`Skipping creature ${id} because bestiary ${bestiaryId} does not exist`);
			continue;
		}

		await prisma.creature.create({
			data: {
				id,
				bestiaryId,
				lastUpdated: new Date(c.lastUpdated ?? Date.now()),
				stats: (c.stats ?? {}) as object,
			},
		});
	}

	console.log("Migrating automations...");
	for (const a of automations) {
		const id = a._id.toHexString();

		await prisma.automation.create({
			data: {
				id,
				name: a.name ?? "",
				description: a.description ?? "",
				owner: a.owner ?? "",
				lastUpdated: new Date(a.lastUpdated ?? Date.now()),
				automation: (a.automation ?? undefined) as object | undefined,
			},
		});
	}

	console.log("Migrating bookmarks...");
	// In MongoDB, User.bookmarks stores bestiary ids.
	// We normalize into UserBestiaryBookmark join rows.
	for (const u of users) {
		if (!Array.isArray(u.bookmarks))
			continue;

		for (const bId of u.bookmarks) {
			const bestiaryId = bId?.toHexString?.();
			if (!bestiaryId)
				continue;
			if (!bestiaryIds.has(bestiaryId))
				continue;

			await prisma.userBestiaryBookmark.upsert({
				where: {
					userId_bestiaryId: {
						userId: String(u._id),
						bestiaryId,
					},
				},
				update: {},
				create: {
					userId: String(u._id),
					bestiaryId,
				},
			});
		}
	}

	console.log("Migration complete ✅");

	await prisma.$disconnect();
	await mongo.close();
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
