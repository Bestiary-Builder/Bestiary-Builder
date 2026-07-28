import type { User } from "~/shared";
import { app } from "@/src/utilities/constants";
import { getBookmarkedBestiariesForUser, getPrismaClient, getUser, resetUserCache } from "@/src/utilities/database";
import { log } from "@/src/utilities/logger";
import { requireUser } from "./login";

app.get("/api/user/bookmarks", requireUser, async (req, res) => {
	const user = req.user!;
	const allBestiaries = await getBookmarkedBestiariesForUser(user.id);
	log.info(`Retrieved all bookmarked bestiaries from the user with the id ${user.id}`);
	return res.json(allBestiaries);
});

app.get("/api/user", requireUser, async (req, res) => {
	const user = req.user!;
	log.info(`Retrieved user with the id ${user.id}`);
	return res.json(user);
});
app.get("/api/user/:id", async (req, res) => {
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
});

app.post("/api/user/updatePreferences", requireUser, async (req, res) => {
	const user = req.user!;
	const newSettings = req.body.data;
	const data = { ...user, ...newSettings };
	log.info(`Updating user setting for ${user.id}`);

	if (!newSettings)
		return res.status(404);

	const updatedUser = await getPrismaClient().user.update({
		where: { id: data.id },
		data: newSettings,
		omit: { secret: true }
	});
	resetUserCache(updatedUser.id);
	return res.json({ data: updatedUser, success: true, error: null });
});
