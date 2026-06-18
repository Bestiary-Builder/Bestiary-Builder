import { getPrismaClient } from ".";
import { log } from "@/utilities/logger";
import type { Id, User } from "~/shared";
import { generateUserSecret } from "@/utilities/constants";

// User cache
let userCache = {} as { [key: string]: User };
export function resetUserCache(id: string) {
	delete userCache[id];
}
export function clearUserCache() {
	userCache = {};
}
const userSecretCache = {} as { [key: string]: User };
// User functions
export async function getUser(id: string) {
	try {
		if (id in userCache)
			return userCache[id];
		const user = await getPrismaClient().user.findUnique({ where: { id } });
		if (user) {
			userCache[user.id] = user;
			if (user.secret)
				userSecretCache[user.secret] = user;
		}
		log.log("database", `Reading user info for ${id}.`);
		return user;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function getUserFromSecret(secret: string) {
	try {
		if (!secret)
			return null;

		if (secret in userSecretCache)
			return userSecretCache[secret];
		const user = await getPrismaClient().user.findUnique({ where: { secret } });
		if (user) {
			userCache[user.id] = user;
			if (user.secret)
				userSecretCache[user.secret] = user;
		}
		log.log("database", "Reading user from secret.");
		return user;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateUser(data: { id: string; username: string; avatar: string; email: string; verified: boolean; bannerColor: string; globalName: string }) {
	try {
		log.log("database", `Upserting user with id ${data.id}`);
		const user = await getPrismaClient().user.upsert({
			where: { id: data.id },
			update: data,
			create: { ...data, secret: generateUserSecret() }
		});
		resetUserCache(data.id);
		return user.secret;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function addBookmark(userId: string, bestiaryId: Id) {
	try {
		log.log("database", `Adding bookmark to user ${userId}.`);
		const prisma = getPrismaClient();
		await prisma.$transaction([
			prisma.userBestiaryBookmark.create({ data: { userId, bestiaryId } }),
			prisma.bestiary.update({ where: { id: bestiaryId }, data: { bookmarks: { increment: 1 } } })
		]);
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}
export async function removeBookmark(userId: string, bestiaryId: Id) {
	try {
		log.log("database", `Removing bookmark from user ${userId}.`);
		const prisma = getPrismaClient();
		await prisma.$transaction([
			prisma.userBestiaryBookmark.delete({ where: { userId_bestiaryId: { userId, bestiaryId } } }),
			prisma.bestiary.update({ where: { id: bestiaryId }, data: { bookmarks: { decrement: 1 } } })
		]);
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}

export async function isBestiaryBookmarked(userId: string, bestiaryId: Id) {
	try {
		const bookmark = await getPrismaClient().userBestiaryBookmark.findUnique({
			where: { userId_bestiaryId: { userId, bestiaryId } }
		});
		return Boolean(bookmark);
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}
