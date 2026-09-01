import type { CollectionWithEditors } from "./collections";
import type { AttackModel, Automation, AutomationCollection, Id } from "~/shared";
import type { BestiaryStatus } from "~/shared/src/prisma-types";
import automationTags from "@/staticData/automationTags.json";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkBestiaryLimits, checkImageUrl, limits } from "@/utilities/constants";
import { addAutomationCollectionBookmark, addAutomationCollectionEditor, createAutomationCollection, createAutomations, deleteAutomationCollection, getAutomationCollection, getAutomationCollectionAutomationCount, getAutomationCollectionsByOwner, getAutomationCollectionsByUser, getAutomationIds, getAutomationsByCollection, getOwnedAutomationCollectionIds, getPrismaClient, getPublicAutomationCollectionsByOwner, incrementAutomationCollectionViewCount, isAutomationCollectionBookmarked, removeAutomationCollectionBookmark, removeAutomationCollectionEditor, updateAutomationCollection, updateAutomationIndexes, updateUserAutomationCollectionIndexes } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { prepareAutomationInput } from "../automations/automations";
import { possibleUser, requireUser } from "../main/login";
import { createCollectionService } from "./collections";

export type AutomationCollectionWithEditors = AutomationCollection & CollectionWithEditors & { _count: { bookmarkedBy: number } };
type AutomationCollectionForUser = AutomationCollectionWithEditors & { automations: Automation[]; orderedBy: { index: number }[] };

export const automationCollections = createCollectionService<AutomationCollectionWithEditors, AutomationCollectionForUser>({
	getById: getAutomationCollection,
	getForUser: getAutomationCollectionsByUser,
	getOwnedCollectionIds: getOwnedAutomationCollectionIds,
	updateUserCollectionIndexes: updateUserAutomationCollectionIndexes,
	addEditor: addAutomationCollectionEditor,
	removeEditor: removeAutomationCollectionEditor,
	delete: deleteAutomationCollection,
	incrementViewCount: incrementAutomationCollectionViewCount,
	getItemIds: getAutomationIds,
	updateItemIndexes: updateAutomationIndexes,
	isBookmarked: isAutomationCollectionBookmarked,
	addBookmark: addAutomationCollectionBookmark,
	removeBookmark: removeAutomationCollectionBookmark
});

export async function getOrCreateDefaultAutomationCollection(ownerId: Id) {
	const id = `default-${ownerId}`;
	const existing = await getAutomationCollection(id);
	if (existing)
		return existing;
	const created = await createAutomationCollection({
		id,
		name: "My Automations",
		status: "private",
		description: "",
		image: "",
		tags: [],
		owner: { connect: { id: ownerId } }
	}, ownerId);
	return created ?? await getAutomationCollection(id);
}

interface AutomationCollectionData {
	name: string;
	description: string;
	image: string;
	status: BestiaryStatus;
	tags: string[];
}

function normalizeAutomationCollectionData(input: Partial<AutomationCollection>): AutomationCollectionData {
	return {
		name: "",
		description: "",
		image: "",
		status: "private",
		...input,
		tags: (input.tags ?? []).filter(tag => automationTags.includes(tag))
	};
}

function validateAutomationCollectionData(data: AutomationCollectionData, automationCount: number) {
	const limitError = checkBestiaryLimits(data);
	if (limitError)
		return limitError;
	const imageError = checkImageUrl(data.image);
	if (imageError)
		return imageError;
	if (data.status !== "private") {
		const nameError = checkBadwords(data.name);
		if (nameError)
			return `Automation collection name ${nameError}`;
		const descriptionError = checkBadwords(data.description);
		if (descriptionError)
			return `Automation collection description ${descriptionError}`;
	}
	if (data.status === "public") {
		if (automationCount === 0)
			return "An automation collection must include at least 1 automation to be made public.";
		if (data.name.toLowerCase().includes("new automation collection"))
			return "An automation collection must have a non default name.";
	}
}

// Automation collections
app.post("/api/automation-collection/add", requireUser, async (req, res) => {
	const user = req.user!;
	const input = normalizeAutomationCollectionData(req.body.data as Partial<AutomationCollection>);
	const validationError = validateAutomationCollectionData(input, 0);
	if (validationError)
		return res.status(400).json({ error: validationError });
	const collection = await createAutomationCollection({
		name: input.name,
		description: input.description,
		image: input.image,
		status: input.status,
		tags: input.tags,
		owner: { connect: { id: user.id } }
	}, user.id);
	if (!collection)
		return res.status(500).json({ error: "Failed to create automation collection." });
	return res.status(201).json(collection);
});

app.get("/api/automation-collection/personal", requireUser, async (req, res) => {
	const user = req.user!;
	const collections = await automationCollections.getForUser(user.id);
	return res.json(collections.sort((a, b) => (a.orderedBy[0]?.index ?? collections.length) - (b.orderedBy[0]?.index ?? collections.length)).map((collection) => {
		const result = collection as Omit<typeof collection, "orderedBy"> & { orderedBy?: unknown };
		delete result.orderedBy;
		return result;
	}));
});

app.post("/api/automation-collection/order", requireUser, async (req, res) => {
	const collectionIds = req.body.data;
	if (!collectionIds || !Array.isArray(collectionIds))
		return res.status(400).json({ error: "Invalid automation collection id array." });
	const result = await automationCollections.reorderForUser(req.user!.id, collectionIds);
	if (result.ok)
		return res.json({});
	if (result.reason === "collections-not-owned")
		return res.status(403).json({ error: "You do not have access to the specified automation collections." });
	if (result.reason === "duplicate-collections")
		return res.status(400).json({ error: "Automation collection ids must be unique." });
	return res.status(500).json({ error: "Failed to update automation collection order." });
});

app.get("/api/automation-collection/user/:userid", possibleUser, async (req, res) => {
	const user = req.user;
	if (user?.id === req.params.userid)
		return res.json((await getAutomationCollectionsByOwner(user.id)));
	return res.json((await getPublicAutomationCollectionsByOwner(req.params.userid)));
});

app.get("/api/automation-collection/:id", possibleUser, async (req, res) => {
	const authorization = await automationCollections.authorize(req.params.id, req.user?.id ?? null, "view");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "Automation collection not found." });
		return res.status(401).json({ error: "You don't have access to this automation collection." });
	}
	if (req.cookies.lastViewedAutomationCollection !== authorization.collection.id) {
		await automationCollections.incrementViewCount(authorization.collection.id);
		res.cookie("lastViewedAutomationCollection", authorization.collection.id, {
			httpOnly: true,
			sameSite: "strict",
			secure: true,
			maxAge: 1000 * 60 * 15
		});
	}
	return res.json({ ...authorization.collection, permissionLevel: authorization.permission });
});

app.post("/api/automation-collection/:id/update", requireUser, async (req, res) => {
	const user = req.user!;
	const authorization = await automationCollections.authorize(req.params.id, user.id, "edit");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "Automation collection not found." });
		return res.status(401).json({ error: "You don't have permission to update this automation collection." });
	}
	const input = normalizeAutomationCollectionData(req.body.data as Partial<AutomationCollection>);
	const automationCount = await getAutomationCollectionAutomationCount(authorization.collection.id);
	const validationError = validateAutomationCollectionData(input, automationCount);
	if (validationError)
		return res.status(400).json({ error: validationError });
	const collection = await updateAutomationCollection({
		name: input.name,
		description: input.description,
		image: input.image,
		tags: input.tags,
		...(authorization.permission === "owner" ? { status: input.status } : {})
	}, authorization.collection.id);
	if (!collection)
		return res.status(500).json({ error: "Failed to update automation collection." });
	return res.json(collection);
});

app.post("/api/automation-collection/:id/delete", requireUser, async (req, res) => {
	const user = req.user!;
	const result = await automationCollections.deleteCollection(req.params.id, user.id);
	if (result.ok)
		return res.json({});
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Automation collection not found." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to delete this automation collection." });
	return res.status(500).json({ error: "Failed to delete automation collection." });
});

app.get("/api/automation-collection/:id/automations", possibleUser, async (req, res) => {
	const authorization = await automationCollections.authorize(req.params.id, req.user?.id ?? null, "view");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "Automation collection not found." });
		return res.status(401).json({ error: "You don't have access to this automation collection." });
	}
	return res.json(await getAutomationsByCollection(authorization.collection.id));
});

app.post("/api/automation-collection/:id/automations/order", requireUser, async (req, res) => {
	const automationIds = req.body.data;
	if (!automationIds || !Array.isArray(automationIds))
		return res.status(400).json({ error: "Invalid automation id array." });
	const result = await automationCollections.reorderItems(req.params.id, req.user!.id, automationIds);
	if (result.ok)
		return res.json({});
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Automation collection not found." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to reorder automations in this collection." });
	if (result.reason === "items-not-in-collection")
		return res.status(403).json({ error: "Specified automations are not part of this collection." });
	if (result.reason === "duplicate-items")
		return res.status(400).json({ error: "Automation ids must be unique." });
	return res.status(500).json({ error: "Failed to update automation order." });
});

// Add many automations
app.post("/api/automation-collection/:id/addautomations", requireUser, async (req, res) => {
	// Get collection
	const id = req.params.id;
	const _id = id;
	if (!_id)
		return res.status(400).json({ error: "Automation collection id not valid." });
	const collection = await getAutomationCollection(_id);
	if (!collection)
		return res.status(404).json({ error: "Automation collection not found" });
	// Check owner
	const user = req.user!;
	if (!automationCollections.canPerform("edit", automationCollections.getPermission(collection, user.id)))
		return res.status(401).json({ error: "You don't have permission to add automations to this collection." });
	// Get automation input
	const inputData = req.body.data as ((Partial<Automation> & { _v: undefined }) | AttackModel | AttackModel[])[];
	if (!Array.isArray(inputData))
		return res.status(400).json({ error: "Failed to parse automation data." });
	const data: Partial<Automation>[] = inputData.map((a) => {
		if (Array.isArray(a)) { // AttackModel[]
			return {
				name: a[0].name,
				description: getAutomationDescription(a[0]),
				automation: a
			};
		}
		else if (a._v !== undefined) { // AttachModel
			return {
				name: a.name,
				description: getAutomationDescription(a),
				automation: a
			};
		}
		else { // Automation
			return {
				name: a.name,
				description: a.description,
				automation: a.automation
			};
		}

		function getAutomationDescription(automation: AttackModel): string {
			const auto = automation?.automation;
			if (!auto)
				return "";
			for (let i = auto.length - 1; i >= 0; i--) {
				const field = auto[i];
				if (field?.type === "text" && typeof (field.text) === "string") {
					return field.text;
				}
			}
			return "";
		}
	});
	// Make sure all fields are present in all automations
	const ignoredItems = [] as { item: string; error: string }[];
	const fixedData = [];
	const existingCount = await getAutomationCollectionAutomationCount(collection.id);
	let automationIndex = ((await getPrismaClient().automation.findFirst({ where: { collectionId: collection.id }, orderBy: { index: "desc" } }))?.index ?? (existingCount - 1))+ 1;
	for (const automation of data) {
		if (!automation)
			continue;
		const prepared = prepareAutomationInput(automation, "Automation");
		if (prepared.error) {
			ignoredItems.push({ item: prepared.data.name, error: prepared.error });
			continue;
		}
		// Push data
		fixedData.push({
			...prepared.data,
			automation: prepared.automationData,
			collectionId: _id,
			index: automationIndex++
		});
	}
	let error = "";
	// Failed automations:
	if (ignoredItems.length > 0)
		error += `Failed to add ${ignoredItems.length} automations, due to invalid data.`;

	// Check amount of automations:
	if (existingCount + fixedData.length > limits.creatureAmount) {
		fixedData.length = limits.creatureAmount - existingCount;
		error += `Number of automations exceeds the limit of ${limits.creatureAmount}, only automations up to this limit was added.\n`;
	}
	// Add all automations
	if (fixedData.length > 0) {
		const result = await createAutomations(fixedData);
		log.info(`Added ${result?.count} automations to collection with the id: ${_id}`);
	}
	else {
		error += "0 valid automations found.";
	}
	return res.status(201).json({ error, ignoredItems });
});

app.post("/api/automation-collection/:collectionid/editors/add/:userid", requireUser, async (req, res) => {
	const user = req.user!;
	const result = await automationCollections.addEditor(req.params.collectionid, user.id, req.params.userid);
	if (result.ok)
		return res.json({});
	switch (result.reason) {
		case "collection-not-found": return res.status(404).json({ error: "Automation collection not found." });
		case "forbidden": return res.status(401).json({ error: "You don't have permission to add editors to this automation collection." });
		case "user-not-found": return res.status(404).json({ error: "No user with that id found." });
		case "owner-as-editor": return res.status(400).json({ error: "The collection owner cannot be added as an editor." });
		case "already-editor": return res.status(409).json({ error: "User is already an editor." });
		default: return res.status(500).json({ error: "Failed to add automation collection editor." });
	}
});

app.post("/api/automation-collection/:collectionid/editors/remove/:userid", requireUser, async (req, res) => {
	const user = req.user!;
	const result = await automationCollections.removeEditor(req.params.collectionid, user.id, req.params.userid);
	if (result.ok)
		return res.json({});
	switch (result.reason) {
		case "collection-not-found": return res.status(404).json({ error: "Automation collection not found." });
		case "forbidden": return res.status(401).json({ error: "You don't have permission to remove editors from this automation collection." });
		case "user-not-found": return res.status(404).json({ error: "No user with that id found." });
		case "not-editor": return res.status(404).json({ error: "User is not an editor." });
		default: return res.status(500).json({ error: "Failed to remove automation collection editor." });
	}
});

app.get("/api/automation-collection/:id/bookmark/toggle", requireUser, async (req, res) => {
	const result = await automationCollections.toggleBookmark(req.params.id, req.user!.id);
	if (result.ok)
		return res.json({ state: result.state });
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Automation collection not found." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to view this automation collection." });
	return res.status(500).json({ error: "Server failed to toggle bookmark, please try again." });
});

app.get("/api/automation-collection/:id/bookmark/get", requireUser, async (req, res) => {
	const result = await automationCollections.getBookmarkState(req.params.id, req.user!.id);
	if (result.ok)
		return res.json({ state: result.state });
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Automation collection not found." });
	return res.status(401).json({ error: "You don't have permission to view this automation collection." });
});
