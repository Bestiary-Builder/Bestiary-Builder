import { createCheckers } from "ts-interface-checker";
import { possibleUser, requireUser } from "./login";
import { colors, publicLog } from "./discord";
import { app, checkBestiaryLimits, checkCreatureAmountLimit, checkCreatureLimits, limits } from "@/utilities/constants";
import { log } from "@/utilities/logger";
import { addBestiaryEditor, addBookmark, createBestiary, createCreatures, deleteBestiary, getBestiariesByOwner, getBestiariesByUser, getBestiary, getBestiaryCreatureCount, getPublicBestiariesByOwner, getUser, incrementBestiaryViewCount, isBestiaryBookmarked, isBestiaryEditor, removeBestiaryEditor, removeBookmark, updateBestiary } from "@/utilities/database";
import { type Statblock, defaultStatblock } from "~/shared";
import type { Bestiary, Creature, User, BestiaryCreateInput } from "~/shared/src/prisma-types"

import tags from "@/staticData/tags.json";

// Validate inputs
import { typeInterface } from "~/shared";
import { checkBadwords } from "@/utilities/badwords";
import { JsonObject } from "~/shared/prisma/internal/prismaNamespace";

// Permission checks
export async function checkBestiaryPermission(bestiary: Bestiary, user: User | null): Promise<"none" | "view" | "owner" | "editor"> {
	if (user) {
		if (bestiary.ownerId === user.id)
			return "owner";
		else if (await isBestiaryEditor(bestiary.id, user.id))
			return "editor";
	}
	if (bestiary.status !== "private")
		return "view";
	else return "none";
}

// Get info
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	try {
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });

		const user = req.body.user;
		const permissionLevel = await checkBestiaryPermission(bestiary, user);
		if (permissionLevel !== "none") {
			// Increment view count
			if (req.cookies.lastViewed !== _id.toString()) {
				incrementBestiaryViewCount(_id);
				res.cookie("lastViewed", _id.toString(), {
					httpOnly: true,
					sameSite: "strict",
					secure: true,
					maxAge: 1000 * 60 * 15
				});
			}
			// Return bestiary
			log.info(`Retrieved bestiary with the id ${_id}`);
			if (!bestiary.tags)
				bestiary.tags = [];
			return res.json(bestiary);
		}
		else {
			return res.status(401).json({ error: "You don't have access to this bestiary." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/my-bestiaries", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find user" });
		const allBestiaries = await getBestiariesByUser(user.id);
		log.info(`Retrieved all bestiaries from the current user with the id ${user.id}`);
		return res.json(allBestiaries);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	try {
		let allBestiaries = [];
		const user = req.body.user;
		if (user && user.id === req.params.userid) {
			// Own user
			allBestiaries = await getBestiariesByOwner(user.id);
		}
		else {
			// Other user
			allBestiaries = await getPublicBestiariesByOwner(req.params.userid);
		}
		log.info(`Retrieved all bestiaries from the user with the id ${req.params.userid}`);
		return res.json(allBestiaries);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Update info
app.post("/api/bestiary/:id/update", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const id = req.params.id;
		if (!id)
			return res.status(400).json({ error: "BestiaryupdateBestiary id not valid." });
		if (!req.body.data)
            return res.status(400).json({ error: "Bestiary data not found." });

		const data: BestiaryCreateInput = {
			...{
				name: "",
				status: "private",
				description: "",
				viewCount: 0,
				bookmarks: 0
			},
            ...(req.body.data as Partial<Bestiary>),
            tags: req.body.data.tags.filter((t: string) => tags.includes(t)) ?? [],
            owner: { connect: { id: user.id } },
            lastUpdated: new Date(Date.now()),
            id
		};
		data.id = id;
		// Check limits
		const limitError = checkBestiaryLimits(data);
		if (limitError)
            return res.status(400).json({ error: limitError });
        const count = await getBestiaryCreatureCount(data.id);
        const amountError = checkCreatureAmountLimit(count);
        if (amountError)
                  return res.status(400).json({ error: amountError });
		// Remove bad words
		if (data.status !== "private") {
			const nameError = checkBadwords(data.name);
			if (nameError)
				return res.status(400).json({ error: `Bestiary name ${nameError}` });
			const descError = checkBadwords(data.description);
			if (descError)
				return res.status(400).json({ error: `Bestiary description ${descError}` });
		}
		// Public?
		if (data.status === "public") {
			const creatureCount = await getBestiaryCreatureCount(data.id);
			if (creatureCount === 0)
				return res.status(400).json({ error: "A bestiary must include at least 1 creature to be made public." });
			if (data.name.toLowerCase().includes("new bestiary"))
				return res.status(400).json({ error: "A bestiary must have a non default name." });
		}
		// Update bestiary
		const bestiary = await getBestiary(data.id);
		if (!bestiary)
			return res.status(404).json({ error: "No bestiary with that id found." });
		const permissionLevel = await checkBestiaryPermission(bestiary, user);
		if (permissionLevel === "none" || permissionLevel === "view")
			return res.status(401).json({ error: "You don't have permission to update this bestiary." });
		// Limit to properties that are editable:
		const update = {
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
		if (permissionLevel === "editor")
			delete update.status;
		// Public log
		if (update.status === "public" && bestiary.status !== "public")
			publicLog("New public bestiary", `Bestiary "${data.name}" changed to public by ${user.username}.`, `https://${req.hostname}/bestiary-viewer/${bestiary.id}`, user, colors.Blurple);

		// Update:
		const updatedId = await updateBestiary(update, data.id);
		if (updatedId) {
			log.info(`Updated bestiary with the id ${data.id}`);
			return res.status(200).json(data);
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.post("/api/bestiary/add", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		if (!req.body.data)
			return res.status(400).json({ error: "Bestiary data not found." });
		const data: BestiaryCreateInput = {
			...{
				name: "",
				status: "private",
				description: "",
				viewCount: 0,
				bookmarks: 0
			},
            ...(req.body.data as Partial<Bestiary>),
            tags: (req.body.data.tags ?? []).filter((t: string) => tags.includes(t)),
            owner: { connect: { id: user.id } },
            lastUpdated: new Date(Date.now())
		};
		if (typeof data.id == "string") {
			const _id = data.id;
			if (!_id)
				return res.status(400).json({ error: "Invalid bestiary id in body." });
			data.id = _id;
		}
		// Check limits
		const limitError = checkBestiaryLimits(data);
		if (limitError)
            return res.status(400).json({ error: limitError });
		// Remove bad words
		if (data.status !== "private") {
			const nameError = checkBadwords(data.name);
			if (nameError)
				return res.status(400).json({ error: `Bestiary name ${nameError}` });
			const descError = checkBadwords(data.description);
			if (descError)
				return res.status(400).json({ error: `Bestiary description ${descError}` });
		}
		// Public?
		if (data.status === "public") {
			const creatureCount = 0;
			if (creatureCount === 0)
				return res.status(400).json({ error: "A bestiary must include at least 1 creature to be made public." });
			if (data.name.toLowerCase().includes("new bestiary"))
				return res.status(400).json({ error: "A bestiary must have a non default name." });
		}
		// Create new bestiary
		const _id = await createBestiary(data);
		if (!_id)
			return res.status(500).json({ error: "Failed to create bestiary." });
		log.info(`Created new bestiary with the id ${_id}`);
		return res.status(201).json({...data, id: _id, ownerId: user.id});
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/bestiary/:id/delete", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Couldn't find bestiary." });
		if ((await checkBestiaryPermission(bestiary, user)) !== "owner")
			return res.status(401).json({ error: "You don't have permission to delete this bestiary." });
		// Remove from db
		const status = await deleteBestiary(_id);
		if (status) {
			log.info(`Deleted bestiary with the id ${_id}`);
			res.json({});
		}
		else {
			res.status(500).json({ error: "Failed to delete creature." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Add many creatures
app.post("/api/bestiary/:id/addcreatures", requireUser, async (req, res) => {
	try {
		// Get bestiary
		const id = req.params.id;
		const _id = id;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary not found" });
		// Check owner
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const bestiaryPermissionLevel = await checkBestiaryPermission(bestiary, user);
		if (["none", "view"].includes(bestiaryPermissionLevel))
			return res.status(401).json({ error: "You don't have permission to add creatures to this bestiary." });
		// Get creature input
		let data;
		try {
			const inputData = req.body.data as Statblock[];
			if (!validateStatblockInput(inputData))
				data = null;
			data = inputData.map(a => ({ stats: a as unknown as JsonObject } as Omit<Creature, "id">));
		}
		catch {
			data = null;
		}
		if (!data)
			return res.status(400).json({ error: "Failed to parse creature data." });
		const now = new Date(Date.now());
		// Make sure all fields are present in all creatures
		const ignoredCreatures = [] as { creature: string; error: string }[];
		const fixedData = [];
		for (const creature of data) {
			if (!creature)
				continue;
			const oldStats = creature.stats as unknown as Statblock;
			let stats = {} as Statblock;
			for (const key in defaultStatblock) {
				// @ts-expect-error untyped
				stats[key] = { ...defaultStatblock[key], ...oldStats[key] };
			}
			// Set bestiary id
			creature.bestiaryId = _id;
			// Set last updated
			creature.lastUpdated = now;
			// Check limits
			const creatureLimits = checkCreatureLimits(stats);
			if (creatureLimits) {
				ignoredCreatures.push({ creature: stats.description.name, error: creatureLimits });
				continue;
			}
			// Check image link
			let image = stats.description.image as string;
			// remove any url parameters from the string
			if (image) {
				try {
					image = new URL(image).origin + new URL(image).pathname;
					stats.description.image = image;
				}
				catch {
					log.error(`Image url not recognized. (${image})`);
					ignoredCreatures.push({ creature: stats.description.name, error: "Image url not recognized." });
					continue;
				}
			}
			let failedToImportImage = false;
			if (image && image !== "") {
				if (!image.startsWith("https")) {
					stats.description.image = "";
					failedToImportImage = true;
				}
				let isApproved = false;
				if (!failedToImportImage) {
					for (const format of limits.imageFormats) {
						if (image.endsWith(`.${format}`))
							isApproved = true;
					}
				}
				if (!isApproved) {
					stats.description.image = "";
					failedToImportImage = true;
				}
			}
			// Badwords check
			if (bestiary.status !== "private") {
				const badwordsName = checkBadwords(stats.description.name);
				if (badwordsName) {
					ignoredCreatures.push({ creature: stats.description.name, error: badwordsName });
					continue;
				}
				const badwordsDesc = checkBadwords(stats.description.description);
				if (badwordsDesc) {
					ignoredCreatures.push({ creature: stats.description.name, error: badwordsDesc });
					continue;
				}
			}
			// Push data
			fixedData.push({...creature, stats: stats as unknown as JsonObject});
		}
		let error = "";
		// Failed creatures:
		if (ignoredCreatures.length > 0)
			error += `Failed to add ${ignoredCreatures.length} creatures, due to invalid data.`;

		// Check amount of creatures:
		const existingCount = await getBestiaryCreatureCount(_id);
		if (existingCount + fixedData.length > limits.creatureAmount) {
			fixedData.length = limits.creatureAmount - existingCount;
			error += `Number of creatures exceeds the limit of ${limits.creatureAmount}, only creatures up to this limit was added.\n`;
		}
		// Add all creatures
		if (fixedData.length > 0) {
			const result = await createCreatures(fixedData);
			log.info(`Added ${result?.count} creatures to bestiary with the id: ${_id}`);
		}
		else {
			error += "0 valid creatures found.";
		}
		return res.status(201).json({ error, ignoredCreatures });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Change editors
app.get("/api/bestiary/:bestiaryid/editors/add/:userid", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.bestiaryid;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const currentUser = req.body.user;
		if (!currentUser)
			return res.status(404).json({ error: "Couldn't find current user." });

		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary with that id not found." });
		const newEditor = await getUser(req.params.userid);
		if (!newEditor)
			return res.status(404).json({ error: "No user with that id found." });
		// Permission check
		if ((await checkBestiaryPermission(bestiary, currentUser)) !== "owner")
			return res.status(401).json({ error: "You don't have permission to add editors to this bestiary." });
		// Already an editor?
		if (await isBestiaryEditor(bestiary.id, newEditor!.id))
			return res.json({ error: "User is already an editor." });

		// Add editor
		await addBestiaryEditor(_id, newEditor.id);
		log.info(`Added user with the id ${newEditor.id} as editor of bestiary with the id ${bestiary.id}`);
		return res.json({});
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/bestiary/:bestiaryid/editors/remove/:userid", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.bestiaryid;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const currentUser = req.body.user;
		if (!currentUser)
			return res.status(404).json({ error: "Couldn't find current user." });

		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Bestiary with that id not found." });
		const newEditor = await getUser(req.params.userid);
		if (!newEditor)
			return res.status(404).json({ error: "No user with that id found." });
		// Permission check
		if ((await checkBestiaryPermission(bestiary, currentUser)) !== "owner")
			return res.status(401).json({ error: "You don't have permission to add editors to this bestiary." });
		// Already an editor?
		if (!await isBestiaryEditor(bestiary.id, newEditor!.id))
			return res.json({ error: "User is not an editor." });

		// Remove editor
		await removeBestiaryEditor(_id, newEditor.id);
		log.info(`Removed user with the id ${newEditor.id} as editor of bestiary with the id ${bestiary.id}`);
		return res.json({});
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Bookmarks
app.get("/api/bestiary/:id/bookmark/toggle", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Couldn't find bestiary." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		if ((await checkBestiaryPermission(bestiary, user)) === "none")
			return res.status(401).json({ error: "You don't have permission to view this bestiary." });

		// Already bookmarked?
		let status;
		let newState;
		const isBookmarked = await isBestiaryBookmarked(user.id, _id);
		if (isBookmarked) {
			status = await removeBookmark(user.id, _id);
			newState = false;
			log.info(`Removed bestiary with the id ${_id} from the bookmarks of user with the id ${user.id}`);
		}
		else {
			status = await addBookmark(user.id, _id);
			newState = true;
			log.info(`Added bestiary with the id ${_id} to the bookmarks of user with the id ${user.id}`);
		}
		// Bookmark
		if (status)
			return res.json({ state: newState });
		else
			return res.status(500).json({ error: "Server failed to toggle bookmark, please try again." });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/bestiary/:id/bookmark/get", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Bestiary id not valid." });
		const bestiary = await getBestiary(_id);
		if (!bestiary)
			return res.status(404).json({ error: "Couldn't find bestiary." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		if ((await checkBestiaryPermission(bestiary, user)) === "none")
			return res.status(401).json({ error: "You don't have permission to view this bestiary." });

		// Already bookmarked
		const isBookmarked = await isBestiaryBookmarked(user.id, _id);
		if (isBookmarked)
			return res.json({ state: true });
		else
			return res.json({ state: false });
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

const { Statblock: StatblockChecker } = createCheckers(typeInterface);
function validateStatblockInput(input: Statblock[]) {
	for (const block of input) {
		if (!StatblockChecker.test(block))
			return false;
	}

	return true;
}
