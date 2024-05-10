import {app, checkBestiaryLimits, checkCreatureLimits, limits} from "@/utilities/constants";
import {log} from "@/utilities/logger";
import {requireUser, possibleUser} from "./login";
import {publicLog, colors} from "./discord";
import {addBestiaryToUser, getBestiary, getUser, incrementBestiaryViewCount, updateBestiary, deleteBestiary, collections, addBookmark, removeBookmark} from "@/utilities/database";
import {User, Bestiary, Creature, type Statblock, defaultStatblock, Stat, Id, stringToId} from "~/shared";
import tags from "@/staticData/tags.json";

//Permission checks
export function checkBestiaryPermission(bestiary: Bestiary, user: User | null): "none" | "view" | "owner" | "editor" {
	if (user) {
		if (bestiary.owner == user._id) return "owner";
		else if ((bestiary.editors ?? []).includes(user._id)) return "editor";
	}
	if (bestiary.status != "private") return "view";
	else return "none";
}

//Get info
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	try {
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let bestiary = await getBestiary(_id);
		if (!bestiary) {
			return res.status(404).json({error: "No bestiary with that id found."});
		}
		let user = req.body.user;
		let permissionLevel = checkBestiaryPermission(bestiary, user);
		if (permissionLevel != "none") {
			//Increment view count
			if (req.cookies.lastViewed != _id.toString()) {
				incrementBestiaryViewCount(_id);
				res.cookie("lastViewed", _id.toString(), {
					httpOnly: true,
					sameSite: "strict",
					secure: true,
					maxAge: 1000 * 60 * 15
				});
			}
			//Return bestiary
			log.info(`Retrieved bestiary with the id ${_id}`);
			if (!bestiary.tags) bestiary.tags = [];
			return res.json(bestiary);
		} else {
			return res.status(401).json({error: "You don't have access to this bestiary."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/my-bestiaries", requireUser, async (req, res) => {
	try {
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find user"});
		let allBestiaries = (await collections.bestiaries?.find({$or: [{owner: user._id}, {editors: {$elemMatch: {$eq: user._id}}}]}).toArray()) ?? [];
		log.info(`Retrieved all bestiaries from the current user with the id ${user._id}`);
		return res.json(allBestiaries);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	try {
		let allBestiaries = [];
		let user = req.body.user;
		if (user && user._id == req.params.userid) {
			//Own user
			allBestiaries = (await collections.bestiaries?.find({owner: user._id}).toArray()) ?? [];
		} else {
			//Other user
			allBestiaries = (await collections.bestiaries?.find({owner: req.params.userid, status: "public"}).toArray()) ?? [];
		}
		log.info(`Retrieved all bestiaries from the user with the id ${req.params.userid}`);
		return res.json(allBestiaries);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Update info
app.post("/api/bestiary/:id/update", requireUser, async (req, res) => {
	try {
		//Get input
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		if (!req.body.data) return res.status(400).json({error: "Bestiary data not found."});
		let data = {
			...({
				creatures: [],
				tags: [],
				name: "",
				status: "private",
				editors: [],
				owner: user._id,
				description: "",
				viewCount: 0,
				bookmarks: 0,
				lastUpdated: 0
			} as Bestiary),
			...(req.body.data as Partial<Bestiary>)
		} as Bestiary;
		data._id = _id;
		//Check limits
		data.tags = data.tags.filter((t) => tags.includes(t));
		const limitError = checkBestiaryLimits(data);
		if (limitError) return res.status(400).json({error: limitError});
		//Remove bad words
		if (data.status != "private") {
			const nameError = checkBadwords(data.name);
			if (nameError) return res.status(400).json({error: "Bestiary name " + nameError});
			const descError = checkBadwords(data.description);
			if (descError) return res.status(400).json({error: "Bestiary description " + descError});
		}
		//Public?
		if (data.status == "public") {
			if (data.creatures.length == 0) return res.status(400).json({error: "A bestiary must include at least 1 creature to be made public."});
			if (data.name.toLowerCase().includes("new bestiary")) return res.status(400).json({error: "A bestiary must have a non default name."});
		}
		//Update bestiary
		let bestiary = await getBestiary(data._id);
		if (!bestiary) return res.status(404).json({error: "No bestiary with that id found."});
		let permissionLevel = checkBestiaryPermission(bestiary, user);
		if (permissionLevel == "none" || permissionLevel == "view") return res.status(401).json({error: "You don't have permission to update this bestiary."});
		//Limit to properties that are editable:
		let update = {
			name: data.name,
			description: data.description,
			status: data.status,
			tags: data.tags
		} as {
			name: string;
			description: string;
			status?: "public" | "private" | "unlisted";
			tags: string[];
		};
		if (permissionLevel == "editor") delete update.status;
		//Public log
		if (update.status == "public" && bestiary.status != "public") {
			publicLog("New public bestiary", `Bestiary "${data.name}" changed to public by ${user.username}.`, "https://" + req.hostname + "/bestiary-viewer/" + bestiary._id, user, colors.Blurple);
		}
		//Update:
		let updatedId = await updateBestiary(update as Bestiary, data._id);
		if (updatedId) {
			log.info(`Updated bestiary with the id ${data._id}`);
			return res.status(200).json(data);
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.post("/api/bestiary/add", requireUser, async (req, res) => {
	try {
		//Get input
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		if (!req.body.data) return res.status(400).json({error: "Bestiary data not found."});
		let data = {
			...({
				creatures: [],
				tags: [],
				name: "",
				status: "private",
				editors: [],
				owner: user._id,
				description: "",
				viewCount: 0,
				bookmarks: 0,
				lastUpdated: 0
			} as Bestiary),
			...(req.body.data as Partial<Bestiary>)
		} as Bestiary;
		if (typeof data._id == "string") {
			let _id = stringToId(data._id);
			if (!_id) return res.status(400).json({error: "Invalid bestiary id in body."});
			data._id = _id;
		}
		//Check limits
		data.tags = data.tags.filter((t) => tags.includes(t));
		const limitError = checkBestiaryLimits(data);
		if (limitError) return res.status(400).json({error: limitError});
		//Remove bad words
		if (data.status != "private") {
			const nameError = checkBadwords(data.name);
			if (nameError) return res.status(400).json({error: "Bestiary name " + nameError});
			const descError = checkBadwords(data.description);
			if (descError) return res.status(400).json({error: "Bestiary description " + descError});
		}
		//Public?
		if (data.status == "public") {
			if (data.creatures.length == 0) return res.status(400).json({error: "A bestiary must include at least 1 creature to be made public."});
			if (data.name.toLowerCase().includes("new bestiary")) return res.status(400).json({error: "A bestiary must have a non default name."});
		}
		//Create new bestiary
		let _id = await updateBestiary(data);
		if (!_id) return res.status(500).json({error: "Failed to create bestiary."});
		await addBestiaryToUser(_id, user._id!);
		data._id = _id;
		data.owner = user._id!;
		log.info(`Created new bestiary with the id ${_id}`);
		return res.status(201).json(data);
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/delete", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		if (checkBestiaryPermission(bestiary, user) != "owner") return res.status(401).json({error: "You don't have permission to delete this bestiary."});
		//Remove from db
		let status = await deleteBestiary(_id);
		if (status) {
			log.info(`Deleted bestiary with the id ${_id}`);
			res.json({});
		} else {
			res.status(500).json({error: "Failed to delete creature."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Add many creatures
app.post("/api/bestiary/:id/addcreatures", requireUser, async (req, res) => {
	try {
		//Get bestiary
		let id = req.params.id;
		let _id = stringToId(id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary not found"});
		//Check owner
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		let bestiaryPermissionLevel = checkBestiaryPermission(bestiary, user);
		if (["none", "view"].includes(bestiaryPermissionLevel)) return res.status(401).json({error: "You don't have permission to add creatures to this bestiary."});
		//Get creature input
		let data;
		try {
			let inputData = req.body.data as Statblock[];
			if (!validateStatblockInput(inputData)) data = null;
			data = inputData.map((a) => ({stats: a} as Creature));
		} catch {
			data = null;
		}
		if (!data) return res.status(400).json({error: "Failed to parse creature data."});
		let now = Date.now();
		//Make sure all fields are present in all creatures
		let ignoredCreatures = [] as string[];
		let fixedData = [] as Creature[];
		for (let creature of data) {
			if (!creature) continue;
			let oldStats = {...creature.stats};
			creature.stats = {} as Statblock;
			for (let key in defaultStatblock) {
				//@ts-expect-error
				creature.stats[key] = {...defaultStatblock[key], ...oldStats[key]};
			}
			//Set bestiary id
			creature.bestiary = _id;
			//Remove creature id
			delete creature._id;
			//Set last updated
			creature.lastUpdated = now;
			//Check limits
			if (checkCreatureLimits(creature)) {
				ignoredCreatures.push(creature.stats.description.name);
				continue;
			}
			//Check image link
			let image = creature.stats.description.image as string;
			// remove any url parameters from the string
			if (image) {
				try {
					image = new URL(image).origin + new URL(image).pathname;
					creature.stats.description.image = image;
				} catch (err) {
					log.error("Image url not recognized. (" + image + ")");
					ignoredCreatures.push(creature.stats.description.name);
					continue;
				}
			}
			let failedToImportImage = false;
			if (image && image != "") {
				if (!image.startsWith("https")) {
					creature.stats.description.image = "";
					failedToImportImage = true;
				}
				let isApproved = false;
				if (!failedToImportImage)
					for (let format of limits.imageFormats) {
						if (image.endsWith("." + format)) isApproved = true;
					}
				if (!isApproved) {
					creature.stats.description.image = "";
					failedToImportImage = true;
				}
			}
			//Badwords check
			if (bestiary.status != "private") {
				if (checkBadwords(creature.stats.description.name) || checkBadwords(creature.stats.description.description)) {
					ignoredCreatures.push(creature.stats.description.name);
					continue;
				}
			}
			//Push data
			fixedData.push(creature);
		}
		let error = "";
		//Failed creatures:
		if (ignoredCreatures.length > 0) {
			error += `Ignored ${ignoredCreatures.length}, due to invalid data. Import these individually instead: ${ignoredCreatures.join(", ")}\n`;
		}
		//Check amount of creatures:
		if (bestiary.creatures.length + fixedData.length > limits.creatureAmount) {
			fixedData.length = limits.creatureAmount - bestiary.creatures.length;
			error += `Number of creatures exceeds the limit of ${limits.creatureAmount}, only creatures up to this limit was added.\n`;
		}
		//Add all creatures
		if (fixedData.length > 0) {
			let result = ((await collections.creatures?.insertMany(fixedData, {ordered: false})) ?? {}) as {
				acknowledged: boolean;
				insertedIds: {[key: string]: Id};
			};
			let ids = Object.values(result.insertedIds);
			log.log("database", `Created ${ids.length} creatures.`);
			await collections.bestiaries?.updateOne({_id: _id}, {$push: {creatures: {$each: ids}}, $set: {lastUpdated: now}});
			log.log("database", `Updated bestiary ${_id} with ${ids.length} creatures.`);
			log.info(`Added ${ids.length} creatures to bestiary with the id: ${_id}`);
		} else {
			error += "0 valid creatures found.";
		}
		return res.status(201).json({error: error});
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Change editors
app.get("/api/bestiary/:bestiaryid/editors/add/:userid", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.bestiaryid);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let currentUser = req.body.user;
		if (!currentUser) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary with that id not found."});
		let newEditor = await getUser(req.params.userid);
		if (!newEditor) return res.status(404).json({error: "No user with that id found."});
		//Permission check
		if (checkBestiaryPermission(bestiary, currentUser) != "owner") return res.status(401).json({error: "You don't have permission to add editors to this bestiary."});
		//Already an editor?
		let editors = bestiary.editors ?? [];
		if (editors.filter((e) => e == newEditor!._id).length > 0) {
			return res.json({error: "User is already an editor."});
		}
		//Add editor
		await collections.bestiaries?.updateOne({_id: _id}, {$push: {editors: newEditor._id}});
		log.info(`Removed user with the id ${newEditor._id} as editor of bestiary with the id ${bestiary._id}`);
		return res.json({});
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:bestiaryid/editors/remove/:userid", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.bestiaryid);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let currentUser = req.body.user;
		if (!currentUser) {
			return res.status(404).json({error: "Couldn't find current user."});
		}
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Bestiary with that id not found."});
		let newEditor = await getUser(req.params.userid);
		if (!newEditor) return res.status(404).json({error: "No user with that id found."});
		//Permission check
		if (checkBestiaryPermission(bestiary, currentUser) != "owner") return res.status(401).json({error: "You don't have permission to add editors to this bestiary."});
		//Already an editor?
		let editors = bestiary.editors ?? [];
		if (editors.filter((e) => e == newEditor!._id).length == 0) {
			return res.json({error: "User is not an editor."});
		}
		//Remove editor
		await collections.bestiaries?.updateOne({_id: _id}, {$pull: {editors: newEditor._id}});
		log.info(`Removed user with the id ${newEditor._id} as editor of bestiary with the id ${bestiary._id}`);
		return res.json({});
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Bookmarks
app.get("/api/bestiary/:id/bookmark/toggle", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		if (checkBestiaryPermission(bestiary, user) == "none") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked?
		let status;
		let newState;
		let bookmarks = user.bookmarks ?? [];
		if (bookmarks.filter((a) => a.toHexString() == _id?.toHexString()).length > 0) {
			status = await removeBookmark(user._id, _id);
			newState = false;
			log.info(`Removed bestiary with the id ${_id} from the bookmarks of user with the id ${user._id}`);
		} else {
			status = await addBookmark(user._id, _id);
			newState = true;
			log.info(`Added bestiary with the id ${_id} to the bookmarks of user with the id ${user._id}`);
		}
		//Bookmark
		if (status) {
			return res.json({state: newState});
		} else {
			return res.status(500).json({error: "Server failed to toggle bookmark, please try again."});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});
app.get("/api/bestiary/:id/bookmark/get", requireUser, async (req, res) => {
	try {
		//Get input
		let _id = stringToId(req.params.id);
		if (!_id) return res.status(400).json({error: "Bestiary id not valid."});
		let bestiary = await getBestiary(_id);
		if (!bestiary) return res.status(404).json({error: "Couldn't find bestiary."});
		let user = req.body.user;
		if (!user) return res.status(404).json({error: "Couldn't find current user."});
		//Permissions
		if (checkBestiaryPermission(bestiary, user) == "none") {
			return res.status(401).json({error: "You don't have permission to view this bestiary."});
		}
		//Already bookmarked
		let bookmarks = user.bookmarks ?? [];
		if (bookmarks.filter((a) => a.toHexString() == _id?.toHexString()).length > 0) {
			return res.json({state: true});
		} else {
			return res.json({state: false});
		}
	} catch (err) {
		log.log("critical", err);
		return res.status(500).json({error: "Unknown server error occured, please try again."});
	}
});

//Validate inputs
import {createCheckers} from "ts-interface-checker";
import {typeInterface, interfaceValidation} from "~/shared";
import {checkBadwords} from "@/utilities/badwords";
const {Statblock: StatblockChecker} = createCheckers(typeInterface);
function validateStatblockInput(input: Statblock[]) {
	for (let block of input) {
		if (!StatblockChecker.test(block)) return false;
	}
	return true;
}
