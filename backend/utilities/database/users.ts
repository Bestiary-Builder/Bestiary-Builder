import { collections } from ".";
import { log } from "@/utilities/logger";
import type { Id, User } from "~/shared";
import { generateUserSecret } from "@/utilities/constants";

// User cache
const userCache = {} as { [key: string]: User };
function resetUserCache(id: string) {
	delete userCache[id];
}
const userSecretCache = {} as { [key: string]: User };
// User functions
export async function getUser(id: string) {
	try {
		let user = userCache[id] as User | null;
		if (!user) {
			user = (await collections.users?.findOne({ _id: id })) as User | null;
			if (user)
				userCache[user._id] = user;
			log.log("database", `Reading user info for ${id}.`);
		}
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
		let user = userSecretCache[secret] as User | null;
		if (!user) {
			user = (await collections.users?.findOne({ secret })) ?? null;
			if (user)
				userSecretCache[secret] = user;
			log.log("database", "Reading user from secret.");
		}
		return user;
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function updateUser(data: { _id: string; username: string; avatar: string; email: string; verified: boolean; banner_color: string; global_name: string }) {
	try {
		if (await getUser(data._id)) {
			log.log("database", `Updating user with id ${data._id}`);
			await collections.users?.updateOne({ _id: data._id }, { $set: data });
			resetUserCache(data._id);
			return (await getUser(data._id))?.secret ?? null;
		}
		else {
			log.log("database", `Adding new user to collection with id ${data._id}`);
			const userData = { ...(data as User), joinedAt: Date.now(), secret: generateUserSecret(), bestiaries: [], bookmarks: [], supporter: 0 } as User;
			await collections.users?.insertOne(userData);
			return userData.secret;
		}
	}
	catch (err) {
		log.log("critical", err);
		return null;
	}
}
export async function addBookmark(userId: string, bestiaryId: Id) {
	try {
		log.log("database", `Adding bookmark to user ${userId}.`);
		await collections.users?.updateOne({ _id: userId }, { $push: { bookmarks: bestiaryId } });
		await collections.bestiaries?.updateOne({ _id: bestiaryId }, { $inc: { bookmarks: 1 } });
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
		await collections.users?.updateOne({ _id: userId }, { $pull: { bookmarks: bestiaryId } });
		await collections.bestiaries?.updateOne({ _id: bestiaryId }, { $inc: { bookmarks: -1 } });
		return true;
	}
	catch (err) {
		log.log("critical", err);
		return false;
	}
}
