import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import { app } from "@/utilities/constants";
import { clearUserCache, getPrismaClient } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { SupporterStatus } from "~/shared";

const PATREON_API_URL = "https://www.patreon.com/api/oauth2/v2";
const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // Every 6 hours, or on webhooks
const USER_AGENT = "Bestiary Builder - Supporter Sync";

type PatreonResourceType = "campaign" | "member" | "tier" | "user";

interface PatreonRelationshipData {
	id: string;
	type: PatreonResourceType;
}

interface PatreonResource {
	id: string;
	type: PatreonResourceType;
	attributes?: {
		amount_cents?: number;
		patron_status?: string | null;
		published?: boolean;
		social_connections?: {
			discord?: string | {
				id?: string;
				user_id?: string;
			} | null;
		};
	};
	relationships?: {
		currently_entitled_tiers?: { data: PatreonRelationshipData[] };
		tiers?: { data: PatreonRelationshipData[] };
		user?: { data: PatreonRelationshipData | null };
	};
}

interface PatreonResponse {
	data: PatreonResource | PatreonResource[];
	included?: PatreonResource[];
	meta?: {
		pagination?: {
			cursors?: {
				next?: string | null;
			};
		};
	};
}

interface PatreonTokenResponse {
	access_token?: string;
	refresh_token?: string;
}

interface SupporterSyncData {
	memberCount: number;
	activeMemberCount: number;
	missingDiscordCount: number;
	unknownTierCount: number;
	supporters: Map<string, SupporterStatus>;
}

let accessToken = process.env.PATREON_ACCESS_TOKEN;
let refreshToken = process.env.PATREON_REFRESH_TOKEN;
let activeSync: Promise<void> | null = null;

function getDiscordId(user: PatreonResource | undefined): string | null {
	const discord = user?.attributes?.social_connections?.discord;
	if (typeof discord === "string")
		return /^\d+$/.test(discord) ? discord : null;
	if (!discord)
		return null;

	const id = discord.user_id ?? discord.id;
	return id && /^\d+$/.test(id) ? id : null;
}

async function refreshAccessToken(): Promise<void> {
	const clientId = process.env.PATREON_CLIENT_ID;
	const clientSecret = process.env.PATREON_CLIENT_SECRET;
	if (!refreshToken || !clientId || !clientSecret)
		throw new Error("Patreon access token expired and refresh credentials are incomplete.");

	const response = await fetch(PATREON_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"User-Agent": USER_AGENT
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret
		})
	});
	if (!response.ok)
		throw new Error(`Patreon token refresh failed with status ${response.status}.`);

	const tokens = await response.json() as PatreonTokenResponse;
	if (!tokens.access_token)
		throw new Error("Patreon token refresh returned no access token.");

	accessToken = tokens.access_token;
	refreshToken = tokens.refresh_token ?? refreshToken;
}

async function patreonRequest(path: string, retryAfterRefresh = true): Promise<PatreonResponse> {
	if (!accessToken)
		throw new Error("Patreon access token is not configured.");

	const response = await fetch(`${PATREON_API_URL}${path}`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`,
			"User-Agent": USER_AGENT
		}
	});

	if (response.status === 401 && retryAfterRefresh) {
		await refreshAccessToken();
		return patreonRequest(path, false);
	}
	if (!response.ok)
		throw new Error(`Patreon API request failed with status ${response.status}.`);

	return await response.json() as PatreonResponse;
}

async function getCampaignAndTiers(): Promise<{ campaignId: string; tierStatuses: Map<string, SupporterStatus> }> {
	const response = await patreonRequest("/campaigns?include=tiers&fields%5Btier%5D=amount_cents,published");
	const campaigns = Array.isArray(response.data) ? response.data : [response.data];
	const configuredCampaignId = process.env.PATREON_CAMPAIGN_ID;
	const campaign = configuredCampaignId
		? campaigns.find(item => item.id === configuredCampaignId)
		: campaigns.length === 1 ? campaigns[0] : undefined;
	if (!campaign) {
		throw new Error(configuredCampaignId
			? "The configured Patreon campaign was not returned by the API."
			: `Expected one Patreon campaign but received ${campaigns.length}; configure PATREON_CAMPAIGN_ID.`);
	}

	const configuredWirmlingTier = process.env.PATREON_WIRMLING_TIER_ID;
	const configuredGreatwyrmTier = process.env.PATREON_GREATWYRM_TIER_ID;
	if (configuredWirmlingTier || configuredGreatwyrmTier) {
		if (!configuredWirmlingTier || !configuredGreatwyrmTier)
			throw new Error("Both Patreon supporter tier IDs must be configured together.");
		return {
			campaignId: campaign.id,
			tierStatuses: new Map([
				[configuredWirmlingTier, SupporterStatus.wirmling],
				[configuredGreatwyrmTier, SupporterStatus.greatwyrm]
			])
		};
	}

	const campaignTierIds = new Set(campaign.relationships?.tiers?.data.map(tier => tier.id) ?? []);
	const paidTiers = (response.included ?? [])
		.filter(resource => resource.type === "tier")
		.filter(resource => campaignTierIds.size === 0 || campaignTierIds.has(resource.id))
		.filter(resource => resource.attributes?.published !== false && (resource.attributes?.amount_cents ?? 0) > 0)
		.sort((a, b) => (a.attributes?.amount_cents ?? 0) - (b.attributes?.amount_cents ?? 0));
	if (paidTiers.length !== 2)
		throw new Error(`Automatic Patreon tier mapping expected 2 published paid tiers but received ${paidTiers.length}.`);

	log.warning("Patreon supporter tier IDs are not configured; mapping the two paid tiers by amount.");
	return {
		campaignId: campaign.id,
		tierStatuses: new Map([
			[paidTiers[0].id, SupporterStatus.wirmling],
			[paidTiers[1].id, SupporterStatus.greatwyrm]
		])
	};
}

async function fetchSupporters(campaignId: string, tierStatuses: Map<string, SupporterStatus>): Promise<SupporterSyncData> {
	const result: SupporterSyncData = {
		memberCount: 0,
		activeMemberCount: 0,
		missingDiscordCount: 0,
		unknownTierCount: 0,
		supporters: new Map()
	};
	let cursor: string | null = null;

	do {
		const params = new URLSearchParams({
			"include": "currently_entitled_tiers,user",
			"fields[member]": "patron_status",
			"fields[user]": "social_connections",
			"page[count]": "1000"
		});
		if (cursor)
			params.set("page[cursor]", cursor);

		const response = await patreonRequest(`/campaigns/${encodeURIComponent(campaignId)}/members?${params.toString()}`);
		const members = Array.isArray(response.data) ? response.data : [response.data];
		const users = new Map(
			(response.included ?? [])
				.filter(resource => resource.type === "user")
				.map(user => [user.id, user])
		);

		result.memberCount += members.length;
		for (const member of members) {
			if (member.attributes?.patron_status !== "active_patron")
				continue;
			result.activeMemberCount++;

			const entitledTierIds = member.relationships?.currently_entitled_tiers?.data.map(tier => tier.id) ?? [];
			const statuses = entitledTierIds
				.map(tierId => tierStatuses.get(tierId))
				.filter(status => status !== undefined);
			if (statuses.length === 0) {
				result.unknownTierCount++;
				continue;
			}

			const userId = member.relationships?.user?.data?.id;
			const discordId = getDiscordId(userId ? users.get(userId) : undefined);
			if (!discordId) {
				result.missingDiscordCount++;
				continue;
			}

			const status = statuses.includes(SupporterStatus.greatwyrm)
				? SupporterStatus.greatwyrm
				: SupporterStatus.wirmling;
			const existingStatus = result.supporters.get(discordId);
			if (existingStatus !== SupporterStatus.greatwyrm)
				result.supporters.set(discordId, status);
		}

		cursor = response.meta?.pagination?.cursors?.next ?? null;
	} while (cursor);

	return result;
}

async function performPatreonSupporterSync(): Promise<void> {
	const { campaignId, tierStatuses } = await getCampaignAndTiers();
	const syncData = await fetchSupporters(campaignId, tierStatuses);
	const wirmlingIds: string[] = [];
	const greatwyrmIds: string[] = [];
	for (const [discordId, status] of syncData.supporters) {
		if (status === SupporterStatus.greatwyrm)
			greatwyrmIds.push(discordId);
		else
			wirmlingIds.push(discordId);
	}

	const prisma = getPrismaClient();
	const [, wirmlingUpdate, greatwyrmUpdate] = await prisma.$transaction([
		prisma.user.updateMany({ data: { supporter: SupporterStatus.none } }),
		prisma.user.updateMany({ where: { id: { in: wirmlingIds } }, data: { supporter: SupporterStatus.wirmling } }),
		prisma.user.updateMany({ where: { id: { in: greatwyrmIds } }, data: { supporter: SupporterStatus.greatwyrm } })
	]);
	clearUserCache();

	log.info(`Patreon supporter sync complete: ${syncData.memberCount} members, ${syncData.activeMemberCount} active, ${syncData.missingDiscordCount} without Discord, ${syncData.unknownTierCount} on unknown tiers, ${wirmlingUpdate.count} wirmlings, ${greatwyrmUpdate.count} greatwyrms.`);
}

export function syncPatreonSupporters(): Promise<void> {
	if (activeSync)
		return activeSync;

	activeSync = performPatreonSupporterSync().finally(() => {
		activeSync = null;
	});
	return activeSync;
}

async function runBackgroundSync(): Promise<void> {
	try {
		await syncPatreonSupporters();
	}
	catch (error) {
		log.error("Patreon supporter sync failed; existing supporter statuses were not changed.", error);
	}
}

function hasValidWebhookSignature(rawBody: Buffer | undefined, signature: string | undefined, secret: string): boolean {
	if (!rawBody || !signature || !/^[a-f\d]{32}$/i.test(signature))
		return false;

	const expectedSignature = Buffer.from(crypto.createHmac("md5", secret).update(rawBody).digest("hex"), "hex");
	const receivedSignature = Buffer.from(signature, "hex");
	return receivedSignature.length === expectedSignature.length
		&& crypto.timingSafeEqual(receivedSignature, expectedSignature);
}

app.post("/api/patreon/webhook", async (req, res) => {
	const webhookSecret = process.env.PATREON_WEBHOOK_SECRET;
	if (!webhookSecret)
		return res.status(503).json({ error: "Patreon webhook secret is not configured." });
	const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
	if (!hasValidWebhookSignature(rawBody, req.get("X-Patreon-Signature"), webhookSecret))
		return res.status(401).json({ error: "Invalid Patreon webhook signature." });

	try {
		await syncPatreonSupporters();
		return res.status(200).json({});
	}
	catch (error) {
		log.error("Patreon webhook supporter sync failed.", error);
		return res.status(500).json({ error: error instanceof Error ? error.message : "Patreon supporter sync failed." });
	}
});

export function startPatreonSync(): void {
	if (!accessToken) {
		log.info("Patreon credentials are not configured; supporter synchronization is disabled.");
		return;
	}

	void runBackgroundSync();
	setInterval(() => void runBackgroundSync(), SYNC_INTERVAL_MS);
}
