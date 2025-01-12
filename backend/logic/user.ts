import { requireUser } from "./login";
import { app } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { collections, getUser, updateUser } from "@/utilities/database";
import type { User } from "~/shared";

app.get("/api/user/bookmarks", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (user) {
			const allBestiaries =
				(await collections.bestiaries
					?.find({
						$and: [
							{ $or: [{ owner: user._id }, { status: { $ne: "private" } }] },
							{
								_id: { $in: user.bookmarks ?? [] },
							},
						],
					})
					.toArray()) ?? [];
			log.info(`Retrieved all bookmarked bestiaries from the user with the id ${user._id}`);
			return res.json(allBestiaries);
		} else {
			return res.status(401).json({ error: "Not logged in." });
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/user", requireUser, async (req, res) => {
	try {
		const userData = req.body.user as User;
		if (userData) {
			delete userData.secret;
			log.info(`Retrieved user with the id ${userData._id}`, userData.emails);
			return res.json(userData);
		} else {
			return res.status(404).json({ error: "User not found." });
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/user/:id", async (req, res) => {
	try {
		const userData = (await getUser(req.params.id)) as User;
		if (userData) {
			const data = {
				_id: userData._id,
				global_name: userData.global_name,
				username: userData.username,
				avatar: userData.avatar,
				banner_color: userData.banner_color,
				supporter: userData.supporter,
			};
			log.info(`Retrieved user with the id ${data._id}`);
			return res.json(data);
		} else {
			return res.status(404).json({ error: "User not found." });
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/unsubscribe", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (user) {
			await updateUser({ _id: user._id, emails: false });
			log.info(`User with the id ${user._id} unsubscribed from emails.`);
			return res.json({});
		} else {
			return res.status(401).json({ error: "Not logged in." });
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/subscribe", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (user) {
			await updateUser({ _id: user._id, emails: true });
			log.info(`User with the id ${user._id} subscribed to emails.`);
			return res.json({});
		} else {
			return res.status(401).json({ error: "Not logged in." });
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
