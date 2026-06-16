import { requireUser } from "./login";
import { app, generateUserSecret } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { getBookmarkedBestiariesForUser, getPrismaClient, getUser, resetUserCache, updateUser } from "@/utilities/database";
import type { User } from "~/shared";

app.get("/api/user/bookmarks", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (user) {
			const allBestiaries = await getBookmarkedBestiariesForUser(user.id);
			log.info(`Retrieved all bookmarked bestiaries from the user with the id ${user.id}`);
			return res.json(allBestiaries);
		}
		else {
			return res.status(401).json({ error: "Not logged in." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/user", requireUser, async (req, res) => {
	try {
		const userData = req.body.user as Omit<User, "secret"> & { secret?: string };
		if (userData) {
			delete userData.secret;
			log.info(`Retrieved user with the id ${userData.id}`);
			return res.json(userData);
		}
		else { return res.status(404).json({ error: "User not found." }); }
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/user/:id", async (req, res) => {
	try {
		const userData = (await getUser(req.params.id)) as User;
		if (userData) {
			const data = {
				id: userData.id,
				globalName: userData.globalName,
				username: userData.username,
				avatar: userData.avatar,
				bannerColor: userData.bannerColor,
				supporter: userData.supporter
			};
			log.info(`Retrieved user with the id ${data.id}`);
			return res.json(data);
		}
		else {
			return res.status(404).json({ error: "User not found." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/user/updatePreferences", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		const newSettings = req.body.data;
		const data = { ...user, ...newSettings };
		if (user) {
			log.info(`Updating user setting for ${user.id}`);

			if (!newSettings)
				return res.status(404);

			const updatedUser = await getPrismaClient().user.upsert({
				where: { id: data.id },
				update: data,
				create: { ...data, secret: generateUserSecret() }
			});
			resetUserCache(updatedUser.id);
			return res.json({ data: updatedUser, success: true, error: null });
		}
		else {
			return res.status(401).json({ error: "Not logged in." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
