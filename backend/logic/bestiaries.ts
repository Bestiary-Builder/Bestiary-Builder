import type { CollectionWithEditors } from "./collections";
import type { Id, Statblock, User } from "~/shared";
import type { Bestiary, BestiaryCreateInput, BestiaryStatus, Creature } from "~/shared/src/prisma-types";
import { createCheckers } from "ts-interface-checker";
import tags from "@/staticData/tags.json";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkBestiaryLimits, checkCreatureAmountLimit, limits } from "@/utilities/constants";
import { addBestiaryEditor, addBookmark, createBestiary, createCreatures, deleteBestiary, getBestiariesByOwner, getBestiariesByUser, getBestiary, getBestiaryCreatureCount, getPrismaClient, getPublicBestiariesByOwner, incrementBestiaryViewCount, isBestiaryBookmarked, removeBestiaryEditor, removeBookmark, updateBestiary } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { typeInterface } from "~/shared";

import { createCollectionService } from "./collections";
import { prepareCreatureStats } from "./creaturePreparation";
import { colors, publicLog } from "./discord";
import { possibleUser, requireUser } from "./login";

type BestiaryWithEditors = Bestiary & CollectionWithEditors;
type BestiaryForUser = BestiaryWithEditors & { creatures: { id: Id }[]; orderedBy: { index: number }[] };

const bestiaryCollections = createCollectionService<BestiaryWithEditors, BestiaryForUser>({
	getById: getBestiary,
	getForUser: getBestiariesByUser,
	addEditor: addBestiaryEditor,
	removeEditor: removeBestiaryEditor,
	delete: deleteBestiary
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
});
app.get("/api/my-bestiaries", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find user" });
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
});

// Update info
interface BestiaryData {
	name: string;
	description: string;
	status: BestiaryStatus;
	tags: string[];
}

function normalizeBestiaryData<T extends Partial<Bestiary>>(input: T): T & BestiaryData {
	return {
		name: "",
		status: "private",
		description: "",
		...input,
		tags: (input.tags ?? []).filter(t => tags.includes(t))
	};
}

function validateBestiaryData(data: BestiaryData, creatureCount: number) {
	const limitError = checkBestiaryLimits(data);
	if (limitError)
		return limitError;
	const amountError = checkCreatureAmountLimit(creatureCount);
	if (amountError)
		return amountError;
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	const id = req.params.id;
	if (!id)
		return res.status(400).json({ error: "BestiaryupdateBestiary id not valid." });
	if (!req.body.data)
		return res.status(400).json({ error: "Bestiary data not found." });

	interface UpdateData {
		name: string;
		description: string;
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	if (!req.body.data)
		return res.status(400).json({ error: "Bestiary data not found." });
	const data: Omit<BestiaryCreateInput, "id" | "owner"> & BestiaryData = {
		viewCount: 0,
		bookmarks: 0,
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	const bestiaryIds = req.body.data;
	if (!bestiaryIds || !Array.isArray(bestiaryIds))
		return res.status(400).json({ error: "Invalid bestiary id array." });

	const prisma = getPrismaClient();

	// Get user owned bestiaries
	const userBestiaries = await prisma.bestiary.findMany({ where: { ownerId: user.id } });

	// Check that user owns all bestiarie
	if (bestiaryIds.some(id => !userBestiaries.some(i => i.id === id)))
		return res.status(403).json({ error: "You do not have access to the specified bestiaries." });

	// Set sortedIndex for each bestiary, and any unspecified gets set last
	const result = await prisma.$transaction([...userBestiaries.map((bestiary) => {
		let index = bestiaryIds.indexOf(bestiary.id);
		if (index < 0)
			index = bestiaryIds.length + 1;
		return prisma.userBestiaryOrder.upsert({
			where: { userId_bestiaryId: { userId: user.id, bestiaryId: bestiary.id } },
			update: { index: bestiaryIds.indexOf(bestiary.id) ?? (bestiaryIds.length + 1) },
			create: { index: bestiaryIds.indexOf(bestiary.id) ?? (bestiaryIds.length + 1), user: { connect: { id: user.id } }, bestiary: { connect: { id: bestiary.id } } }
		});
	}), prisma.userBestiaryOrder.deleteMany({ where: { userId: user.id, bestiaryId: { notIn: bestiaryIds } } })]);

	if (result.length - 1 === userBestiaries.length)
		return res.status(200).json({});
	else
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	if (!await canEditBestiary(bestiary, user))
		return res.status(401).json({ error: "You don't have permission to add creatures to this bestiary." });
	// Get creature input
	let data;
	try {
		const inputData = req.body.data as Statblock[];
		if (!validateStatblockInput(inputData))
			data = null;
		data = inputData.map(a => ({ stats: a } as Omit<Creature, "id">));
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
	let creatureIndex = (await getPrismaClient().creature.findFirst({ where: { bestiaryId: bestiary.id }, orderBy: { index: "desc" } }))?.index ?? (await getBestiaryCreatureCount(bestiary.id));
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
			ignoredCreatures.push({ creature: prepared.stats.description.name, error: prepared.error });
			continue;
		}
		// Push data
		fixedData.push({ ...creature, stats: prepared.stats });
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
});

// Change editors
app.get("/api/bestiary/:bestiaryid/editors/add/:userid", requireUser, async (req, res) => {
	// Get input
	const _id = req.params.bestiaryid;
	if (!_id)
		return res.status(400).json({ error: "Bestiary id not valid." });
	const currentUser = req.body.user;
	if (!currentUser)
		return res.status(404).json({ error: "Couldn't find current user." });

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
	const currentUser = req.body.user;
	if (!currentUser)
		return res.status(404).json({ error: "Couldn't find current user." });

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
});
app.get("/api/bestiary/:id/bookmark/get", requireUser, async (req, res) => {
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
});

const { Statblock: StatblockChecker } = createCheckers(typeInterface);
function validateStatblockInput(input: Statblock[]) {
	for (const block of input) {
		if (!StatblockChecker.test(block))
			return false;
	}

	return true;
}
