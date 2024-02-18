import {app} from "../utilities/constants";
import {log} from "../utilities/logger";
import {requireUser, possibleUser} from "./login";
import {getUser, collections} from "../utilities/database";
import {User, Bestiary, Creature} from "../../shared";

app.get("/api/user/bookmarks", requireUser, async (req, res) => {
	try {
		let user = await getUser(req.body.id);
		if (user) {
			let allBestiaries =
				(await collections.bestiaries
					?.find({
						$and: [
							{$or: [{owner: user._id}, {status: {$ne: "private"}}]},
							{
								_id: {$in: user.bookmarks ?? []}
							}
						]
					})
					.toArray()) ?? [];
			log.info(`Retrieved all bookmarked bestiaries from the user with the id ${user._id}`);
			return res.json(allBestiaries);
		} else {
			return res.status(401).json({error: "Not logged in."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

app.get("/api/user", requireUser, async (req, res) => {
	try {
		let userData = (await getUser(req.body.id)) as User;
		if (userData) {
			delete userData.secret;
			log.info(`Retrieved user with the id ${userData._id}`);
			return res.json(userData);
		} else return res.status(404).json({error: "User not found."});
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/user/:id", async (req, res) => {
	try {
		let userData = (await getUser(req.params.id)) as User;
		if (userData) {
			let data = {
				_id: userData._id,
				global_name: userData.global_name,
				username: userData.username,
				avatar: userData.avatar,
				banner_color: userData.banner_color,
				supporter: userData.supporter
			};
			log.info(`Retrieved user with the id ${data._id}`);
			return res.json(data);
		} else {
			return res.status(404).json({error: "User not found."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
