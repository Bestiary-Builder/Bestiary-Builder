import type { Id, User } from "~/shared";
import { generateUserSecret } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { SupporterStatus } from "~/shared";
import { getPrismaClient } from ".";
import { withDatabaseFallback } from "./operations";

// User cache
let userCache = {} as { [key: string]: User };
export function clearUserCache() {
	userCache = {};
}
const userSecretCache = {} as { [key: string]: User };
const userSecrets = {} as { [key: string]: string };
export function resetUserCache(id: string) {
	delete userCache[id];
	delete userSecretCache[userSecrets[id]];
}
// User functions
export async function getUser(id: string) {
	return await withDatabaseFallback(async () => {
		if (id in userCache)
			return userCache[id];
		const user = await getPrismaClient().user.findUnique({ where: { id }, omit: { secret: true } });
		if (user)
			userCache[user.id] = user;
		log.log("database", `Reading user info for ${id}.`);
		return user;
	}, null);
}
export async function getUserFromSecret(secret: string) {
	return await withDatabaseFallback(async () => {
		if (!secret)
			return null;

		if (secret in userSecretCache)
			return userSecretCache[secret];
		const user = await getPrismaClient().user.findUnique({ where: { secret } });
		if (user) {
			userCache[user.id] = user;
			if (user.secret) {
				userSecretCache[user.secret] = user;
				userSecrets[user.id] = user.secret;
			}
		}
		log.log("database", "Reading user from secret.");
		return user;
	}, null);
}
export async function updateUser(data: { id: string; username: string; avatar: string; email: string; verified: boolean; bannerColor: string; globalName: string }) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Upserting user with id ${data.id}`);
		const user = await getPrismaClient().user.upsert({
			where: { id: data.id },
			update: data,
			create: { ...data, supporter: SupporterStatus.none, secret: generateUserSecret() }
		});
		resetUserCache(data.id);
		return user.secret;
	}, null);
}
export async function addBookmark(userId: string, bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Adding bookmark to user ${userId}.`);
		await getPrismaClient().userBestiaryBookmark.create({ data: { userId, bestiaryId } });
		return true;
	}, false);
}
export async function removeBookmark(userId: string, bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		log.log("database", `Removing bookmark from user ${userId}.`);
		await getPrismaClient().userBestiaryBookmark.delete({ where: { userId_bestiaryId: { userId, bestiaryId } } });
		return true;
	}, false);
}

export async function isBestiaryBookmarked(userId: string, bestiaryId: Id) {
	return await withDatabaseFallback(async () => {
		const bookmark = await getPrismaClient().userBestiaryBookmark.findUnique({
			where: { userId_bestiaryId: { userId, bestiaryId } }
		});
		return Boolean(bookmark);
	}, false);
}
