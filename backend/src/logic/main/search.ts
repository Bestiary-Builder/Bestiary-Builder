import type { Response } from "express";
import type { AutomationCollectionWithCount, BestiaryWithCount, SearchOptions } from "~/shared";
import { app } from "@/utilities/constants";
import { getGlobalStats, getPrismaClient } from "@/utilities/database";
import { log } from "@/utilities/logger";

import { Prisma } from "~/shared/prisma/client";

import { SearchOptionsChecker, validateInput } from "../external/validation";

const amountPerPage = 12;

function normalizeSearchTerm(term: string | undefined | null): string | null {
	if (!term)
		return null;
	const trimmed = term.trim();
	if (!trimmed || trimmed === ".")
		return null;
	return trimmed;
}

function buildWhereSql(searchTerm: string | null, tags: string[]) {
	const conditions: Prisma.Sql[] = [
		Prisma.sql`"status" = 'public'`
	];

	if (searchTerm) {
		const pattern = `%${searchTerm}%`;
		conditions.push(Prisma.sql`("name" ILIKE ${pattern} OR "description" ILIKE ${pattern})`);
	}

	if (tags.length > 0) {
		conditions.push(Prisma.sql`"tags" && ARRAY[${Prisma.join(tags)}]::text[]`);
	}

	let whereSql = conditions[0];
	for (let i = 1; i < conditions.length; i++) {
		whereSql = Prisma.sql`${whereSql} AND ${conditions[i]}`;
	}
	return whereSql;
}

app.post("/api/search", async (req, res) => {
	// Parse search inputs
	const input = req.body.data as Partial<SearchOptions> | null;
	const searchOptions: SearchOptions = {
		...{
			search: ".",
			page: 0,
			mode: "popular",
			tags: []
		},
		...(input ?? {})
	};

	if (!validateSearchInput(searchOptions, res))
		return;
	if (searchOptions.page < 0)
		return res.status(400).json({ error: "Page out of bounds" });

	const searchTerm = normalizeSearchTerm(searchOptions.search);
	const tags = searchOptions.tags ?? [];
	const whereSql = buildWhereSql(searchTerm, tags);

	const prisma = getPrismaClient();

	const totalCountRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
			SELECT COUNT(*)::int AS count
			FROM "Bestiaries"
			WHERE ${whereSql}
		`);

	const totalCount = totalCountRows[0]?.count ?? 0;
	const pageAmount = Math.max(1, Math.ceil(totalCount / amountPerPage));

	const offset = searchOptions.page * amountPerPage;
	const orderBy = searchOptions.mode === "popular"
		? Prisma.sql`ORDER BY (COALESCE("BookmarkCounts"."count", 0) * 10 + "Bestiaries"."viewCount") DESC, "Bestiaries"."lastUpdated" DESC, "Bestiaries"."name" ASC`
		: Prisma.sql`ORDER BY "lastUpdated" DESC, "name" ASC`;

	const results = await prisma.$queryRaw<BestiaryWithCount[]>(Prisma.sql`
			SELECT
				"id",
				"name",
				"owner" AS "ownerId",
				"status",
				"description",
				"tags",
				"viewCount",
				COALESCE("BookmarkCounts"."count", 0)::int AS "bookmarks",
				"lastUpdated",
				(SELECT COUNT(*)::int FROM "Creatures" WHERE "bestiary" = "Bestiaries"."id") AS "creatureCount"
			FROM "Bestiaries"
			LEFT JOIN (
				SELECT "bestiaryId", COUNT(*)::int AS count
				FROM "UserBestiaryBookmarks"
				GROUP BY "bestiaryId"
			) "BookmarkCounts" ON "BookmarkCounts"."bestiaryId" = "Bestiaries"."id"
			WHERE ${whereSql}
			${orderBy}
			LIMIT ${amountPerPage} OFFSET ${offset}
		`);

	const output = {
		results,
		pageAmount
	};

	log.info(`Search completed with ${output.pageAmount} pages`);
	return res.json(output);
});

app.post("/api/search/automations", async (req, res) => {
	const input = req.body.data as Partial<SearchOptions> | null;
	const searchOptions: SearchOptions = {
		...{
			search: ".",
			page: 0,
			mode: "popular",
			tags: []
		},
		...(input ?? {})
	};

	if (!validateSearchInput(searchOptions, res))
		return;
	if (searchOptions.page < 0)
		return res.status(400).json({ error: "Page out of bounds" });

	const searchTerm = normalizeSearchTerm(searchOptions.search);
	const tags = searchOptions.tags ?? [];
	const whereSql = buildWhereSql(searchTerm, tags);
	const prisma = getPrismaClient();

	const totalCountRows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
			SELECT COUNT(*)::int AS count
			FROM "AutomationCollections"
			WHERE ${whereSql}
		`);
	const totalCount = totalCountRows[0]?.count ?? 0;
	const pageAmount = Math.max(1, Math.ceil(totalCount / amountPerPage));
	const offset = searchOptions.page * amountPerPage;
	const orderBy = searchOptions.mode === "popular"
		? Prisma.sql`ORDER BY (COALESCE("BookmarkCounts"."count", 0) * 10 + "AutomationCollections"."viewCount") DESC, "AutomationCollections"."lastUpdated" DESC, "AutomationCollections"."name" ASC`
		: Prisma.sql`ORDER BY "lastUpdated" DESC, "name" ASC`;

	const results = await prisma.$queryRaw<AutomationCollectionWithCount[]>(Prisma.sql`
			SELECT
				"id",
				"name",
				"owner" AS "ownerId",
				"status",
				"description",
				"tags",
				"viewCount",
				COALESCE("BookmarkCounts"."count", 0)::int AS "bookmarks",
				"lastUpdated",
				(SELECT COUNT(*)::int FROM "Automations" WHERE "collectionId" = "AutomationCollections"."id") AS "automationCount"
			FROM "AutomationCollections"
			LEFT JOIN (
				SELECT "collectionId", COUNT(*)::int AS count
				FROM "UserAutomationCollectionBookmarks"
				GROUP BY "collectionId"
			) "BookmarkCounts" ON "BookmarkCounts"."collectionId" = "AutomationCollections"."id"
			WHERE ${whereSql}
			${orderBy}
			LIMIT ${amountPerPage} OFFSET ${offset}
		`);

	const output = { results, pageAmount };
	log.info(`Automation collection search completed with ${output.pageAmount} pages`);
	return res.json(output);
});

function validateSearchInput(input: SearchOptions, res: Response) {
	return validateInput(input, SearchOptionsChecker, res, "Search");
}

// Global stats
app.get("/api/stats", async (req, res) => {
	const stats = await getGlobalStats();
	if (!stats)
		return res.status(500).json({ error: "Failed to retrieve stats." });
	return res.json(stats);
});
