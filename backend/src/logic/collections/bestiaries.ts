import type { CollectionWithEditors } from "./collections";
import type { Statblock, User } from "~/shared";
import type { Bestiary, BestiaryCreateInput, BestiaryStatus, Creature } from "~/shared/src/prisma-types";
import bestiaryTags from "@/staticData/bestiaryTags.json";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkBestiaryLimits, checkCreatureAmountLimit, checkImageUrl, limits } from "@/utilities/constants";
import { addBestiaryEditor, addBookmark, createBestiary, createCreatures, deleteBestiary, getBestiariesByOwner, getBestiariesByUser, getBestiary, getBestiaryCreatureCount, getBestiaryCreatureIds, getBestiaryFull, getOwnedBestiaryIds, getPrismaClient, getPublicBestiariesByOwner, incrementBestiaryViewCount, isBestiaryBookmarked, removeBestiaryEditor, removeBookmark, updateBestiary, updateBestiaryCreatureIndexes, updateUserBestiaryIndexes } from "@/utilities/database";
import { log } from "@/utilities/logger";

import { prepareCreatureStats } from "../creatures/creaturePreparation";
import { colors, publicLog } from "../external/discord";
import { StatblockChecker } from "../external/validation";
import { possibleUser, requireUser } from "../main/login";
import { createCollectionService } from "./collections";

type BestiaryWithEditors = Bestiary & CollectionWithEditors & { _count: { bookmarkedBy: number } };
type BestiaryForUser = BestiaryWithEditors & { creatureCount: number; orderedBy: { index: number }[] };

export const bestiaryCollections = createCollectionService<BestiaryWithEditors, BestiaryForUser>({
	getById: getBestiary,
	getForUser: getBestiariesByUser,
	getOwnedCollectionIds: getOwnedBestiaryIds,
	updateUserCollectionIndexes: updateUserBestiaryIndexes,
	addEditor: addBestiaryEditor,
	removeEditor: removeBestiaryEditor,
	delete: deleteBestiary,
	incrementViewCount: incrementBestiaryViewCount,
	getItemIds: getBestiaryCreatureIds,
	updateItemIndexes: updateBestiaryCreatureIndexes,
	isBookmarked: isBestiaryBookmarked,
	addBookmark,
	removeBookmark
});

export async function checkBestiaryPermission(bestiary: BestiaryWithEditors, user: User | null) {
	return bestiaryCollections.getPermission(bestiary, user?.id ?? null);
}

export async function canEditBestiary(bestiary: BestiaryWithEditors, user: User | null) {
	return bestiaryCollections.canPerform("edit", await checkBestiaryPermission(bestiary, user));
}

// Get info
app.get("/api/bestiary/:id", possibleUser, async (req, res) => {
	const _id = req.params.id;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const bestiary = await getBestiaryFull(_id);
	if (!bestiary)
		return res.status(404).json({ error: "No bestiary with that id found." });

	const user = req.user;
	const permissionLevel = await checkBestiaryPermission(bestiary, user);
	if (permissionLevel !== "none") {
		// Increment view count
		if (req.cookies.lastViewed !== _id.toString()) {
			await bestiaryCollections.incrementViewCount(_id);
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
		return res.json({ ...bestiary, permissionLevel });
	}
	else {
		return res.status(401).json({ error: "You don't have access to this bestiary." });
	}
});
app.get("/api/my-bestiaries", requireUser, async (req, res) => {
	const user = req.user!;
	const allBestiaries = await bestiaryCollections.getForUser(user.id);
	log.info(`Retrieved all bestiaries from the current user with the id ${user.id}`);
	return res.json(allBestiaries.sort((a, b) => (a.orderedBy[0]?.index ?? allBestiaries.length) - (b.orderedBy[0]?.index ?? allBestiaries.length)).map((bestiary) => {
		const b = bestiary as Omit<typeof bestiary, "orderedBy"> & { orderedBy?: unknown };
		delete b.orderedBy;
		return b;
	}));
});
app.get("/api/user/:userid/bestiaries", possibleUser, async (req, res) => {
	let allBestiaries = [];
	const user = req.user;
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
});

// Update info
interface BestiaryData {
	name: string;
	description: string;
	image: string;
	status: BestiaryStatus;
	tags: string[];
}

function normalizeBestiaryData<T extends Partial<Bestiary>>(input: T): T & BestiaryData {
	return {
		name: "",
		status: "private",
		description: "",
		image: "",
		...input,
		tags: (input.tags ?? []).filter(t => bestiaryTags.includes(t))
	};
}

function validateBestiaryData(data: BestiaryData, creatureCount: number) {
	const limitError = checkBestiaryLimits(data);
	if (limitError)
		return limitError;
	const amountError = checkCreatureAmountLimit(creatureCount);
	if (amountError)
		return amountError;
	const imageError = checkImageUrl(data.image);
	if (imageError)
		return imageError;
	if (data.status !== "private") {
		const nameError = checkBadwords(data.name);
		if (nameError)
			return `Bestiary name ${nameError}`;
		const descError = checkBadwords(data.description);
		if (descError)
			return `Bestiary description ${descError}`;
	}
	if (data.status === "public") {
		if (creatureCount === 0)
			return "A bestiary must include at least 1 creature to be made public.";
		if (data.name.toLowerCase().includes("new bestiary"))
			return "A bestiary must have a non default name.";
	}
}

app.post("/api/bestiary/:id/update", requireUser, async (req, res) => {
	// Get input
	const user = req.user!;
	const id = req.params.id;
	if (!id)
		return res.status(400).json({ error: "BestiaryupdateBestiary id not valid." });
	if (!req.body.data)
		return res.status(400).json({ error: "Bestiary data not found." });

	interface UpdateData {
		name: string;
		description: string;
		image: string;
		status: "public" | "private" | "unlisted";
		tags: string[];
	};

	const data: UpdateData & { id: Bestiary["id"] } = {
		...normalizeBestiaryData(req.body.data as Partial<Bestiary>),
		id
	};
	const count = await getBestiaryCreatureCount(data.id);
	const validationError = validateBestiaryData(data, count);
	if (validationError)
		return res.status(400).json({ error: validationError });
	const authorization = await bestiaryCollections.authorize(id, user.id, "edit");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "No bestiary with that id found." });
		return res.status(401).json({ error: "You don't have permission to update this bestiary." });
	}
	const bestiary = authorization.collection;
	const permissionLevel = authorization.permission;
	// Limit to properties that are editable:
	const update: Omit<UpdateData, "status"> & { status?: BestiaryStatus } = {
		name: data.name,
		description: data.description,
		image: data.image,
		status: data.status,
		tags: data.tags
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
});
app.post("/api/bestiary/add", requireUser, async (req, res) => {
	const user = req.user!;
	if (!req.body.data)
		return res.status(400).json({ error: "Bestiary data not found." });
	const data: Omit<BestiaryCreateInput, "id" | "owner"> & BestiaryData = {
		viewCount: 0,
		...normalizeBestiaryData(req.body.data as Partial<Bestiary>)
	};
	const validationError = validateBestiaryData(data, 0);
	if (validationError)
		return res.status(400).json({ error: validationError });
	const _id = await createBestiary({ ...data }, user);
	if (!_id)
		return res.status(500).json({ error: "Failed to create bestiary." });
	log.info(`Created new bestiary with the id ${_id}`);
	return res.status(201).json({ ...data, id: _id, ownerId: user.id });
});
app.get("/api/bestiary/:id/delete", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.id;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const user = req.user!;
	// Permissions
	const result = await bestiaryCollections.deleteCollection(_id, user.id);
	if (result.ok) {
		log.info(`Deleted bestiary with the id ${_id}`);
		return res.json({});
	}
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Couldn't find bestiary." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to delete this bestiary." });
	return res.status(500).json({ error: "Failed to delete bestiary." });
});

// Change bestiary order
app.post("/api/my-bestiaries/order", requireUser, async (req, res) => {
	const user = req.user!;
	const bestiaryIds = req.body.data;
	if (!bestiaryIds || !Array.isArray(bestiaryIds))
		return res.status(400).json({ error: "Invalid bestiary id array." });

	const result = await bestiaryCollections.reorderForUser(user.id, bestiaryIds);
	if (result.ok)
		return res.status(200).json({});
	if (result.reason === "collections-not-owned")
		return res.status(403).json({ error: "You do not have access to the specified bestiaries." });
	if (result.reason === "duplicate-collections")
		return res.status(400).json({ error: "Bestiary ids must be unique." });
	return res.status(500).json({ error: "Failed to update bestiary order." });
});

// Add many creatures
app.post("/api/bestiary/:id/addcreatures", requireUser, async (req, res) => {
	// Get bestiary
	const id = req.params.id;
	const _id = id;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const bestiary = await getBestiary(_id);
	if (!bestiary)
		return res.status(404).json({ error: "Bestiary not found" });
	// Check owner
	const user = req.user!;
	if (!await canEditBestiary(bestiary, user))
		return res.status(401).json({ error: "You don't have permission to add creatures to this bestiary." });
	// Get creature input
	const inputData = req.body.data as Statblock[];
	if (!Array.isArray(inputData) || !validateStatblockInput(inputData))
		return res.status(400).json({ error: "Failed to parse creature data." });
	const data = inputData.map(a => ({ stats: a } as Omit<Creature, "id">));
	const now = new Date(Date.now());
	// Make sure all fields are present in all creatures
	const ignoredItems = [] as { item: string; error: string }[];
	const fixedData = [];
	let creatureIndex = ((await getPrismaClient().creature.findFirst({ where: { bestiaryId: bestiary.id }, orderBy: { index: "desc" } }))?.index ?? (await getBestiaryCreatureCount(bestiary.id) - 1)) + 1;
	for (const creature of data) {
		if (!creature)
			continue;
		// Set bestiary id
		creature.bestiaryId = _id;
		// Set last updated
		creature.lastUpdated = now;
		// Set index
		creature.index = creatureIndex++;
		const prepared = prepareCreatureStats(creature.stats, bestiary.status);
		if (prepared.error) {
			ignoredItems.push({ item: prepared.stats.description.name, error: prepared.error });
			continue;
		}
		// Push data
		fixedData.push({ ...creature, stats: prepared.stats });
	}
	let error = "";
	// Failed creatures:
	if (ignoredItems.length > 0)
		error += `Failed to add ${ignoredItems.length} creatures, due to invalid data.`;

	// Check amount of creatures:
	const existingCount = await getBestiaryCreatureCount(_id);
	if (existingCount + fixedData.length > limits.creatureAmount) {
		fixedData.length = limits.creatureAmount - existingCount;
		error += `Number of creatures exceeds the limit of ${limits.creatureAmount}, only creatures up to this limit was added.\n`;
	}
	// Add all creatures
	if (fixedData.length > 0) {
		const result = await createCreatures(fixedData);
		if (!result)
			return res.status(500).json({ error: "Unexpected server error occured." });
		log.info(`Added ${result.count} creatures to bestiary with the id: ${_id}`);
	}
	else {
		error += "0 valid creatures found.";
	}
	return res.status(201).json({ error, ignoredItems });
});

// Change editors
app.get("/api/bestiary/:bestiaryid/editors/add/:userid", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.bestiaryid;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const currentUser = req.user!;

	const result = await bestiaryCollections.addEditor(_id, currentUser.id, req.params.userid);
	if (result.ok) {
		log.info(`Added user with the id ${req.params.userid} as editor of bestiary with the id ${_id}`);
		return res.json({});
	}
	switch (result.reason) {
		case "collection-not-found": return res.status(404).json({ error: "Bestiary with that id not found." });
		case "forbidden": return res.status(401).json({ error: "You don't have permission to add editors to this bestiary." });
		case "user-not-found": return res.status(404).json({ error: "No user with that id found." });
		case "owner-as-editor": return res.status(400).json({ error: "The bestiary owner cannot be added as an editor." });
		case "already-editor": return res.status(409).json({ error: "User is already an editor." });
		default: return res.status(500).json({ error: "Failed to add bestiary editor." });
	}
});
app.get("/api/bestiary/:bestiaryid/editors/remove/:userid", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.bestiaryid;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const currentUser = req.user!;

	const result = await bestiaryCollections.removeEditor(_id, currentUser.id, req.params.userid);
	if (result.ok) {
		log.info(`Removed user with the id ${req.params.userid} as editor of bestiary with the id ${_id}`);
		return res.json({});
	}
	switch (result.reason) {
		case "collection-not-found": return res.status(404).json({ error: "Bestiary with that id not found." });
		case "forbidden": return res.status(401).json({ error: "You don't have permission to remove editors from this bestiary." });
		case "user-not-found": return res.status(404).json({ error: "No user with that id found." });
		case "not-editor": return res.status(404).json({ error: "User is not an editor." });
		default: return res.status(500).json({ error: "Failed to remove bestiary editor." });
	}
});

// Bookmarks
app.get("/api/bestiary/:id/bookmark/toggle", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.id;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const user = req.user!;
	const result = await bestiaryCollections.toggleBookmark(_id, user.id);
	if (result.ok)
		return res.json({ state: result.state });
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Couldn't find bestiary." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to view this bestiary." });
	return res.status(500).json({ error: "Server failed to toggle bookmark, please try again." });
});
app.get("/api/bestiary/:id/bookmark/get", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.id;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const user = req.user!;
	const result = await bestiaryCollections.getBookmarkState(_id, user.id);
	if (result.ok)
		return res.json({ state: result.state });
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Couldn't find bestiary." });
	return res.status(401).json({ error: "You don't have permission to view this bestiary." });
});

function validateStatblockInput(input: Statblock[]) {
	for (const block of input) {
		if (!StatblockChecker.test(block))
			return false;
	}

	return true;
}
