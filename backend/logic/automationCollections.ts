import type { CollectionWithEditors } from "./collections";
import type { Automation, AutomationCollection, Id } from "~/shared";
import type { BestiaryStatus } from "~/shared/src/prisma-types";
import { checkBadwords } from "@/utilities/badwords";
import { app, limits } from "@/utilities/constants";
import { addAutomationCollectionEditor, createAutomationCollection, deleteAutomationCollection, getAutomationCollection, getAutomationCollectionsByOwner, getAutomationCollectionsByUser, getPublicAutomationCollectionsByOwner, removeAutomationCollectionEditor, updateAutomationCollection } from "@/utilities/database";
import { createCollectionService } from "./collections";
import { possibleUser, requireUser } from "./login";

export type AutomationCollectionWithEditors = AutomationCollection & CollectionWithEditors;
type AutomationCollectionForUser = AutomationCollectionWithEditors & { automations: Automation[] };

export const automationCollections = createCollectionService<AutomationCollectionWithEditors, AutomationCollectionForUser>({
	getById: getAutomationCollection,
	getForUser: getAutomationCollectionsByUser,
	addEditor: addAutomationCollectionEditor,
	removeEditor: removeAutomationCollectionEditor,
	delete: deleteAutomationCollection
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
		owner: { connect: { id: ownerId } }
	});
	return created ?? await getAutomationCollection(id);
}

function validateAutomationCollectionInput(input: Partial<AutomationCollection> | undefined, currentStatus: BestiaryStatus = "private") {
	const name = input?.name;
	if (typeof name !== "string")
		return { error: "Automation collection name not found." };
	if (name.length < limits.nameMin)
		return { error: `Name is less than the minimum character limit of ${limits.nameMin} characters.` };
	if (name.length > limits.nameLength)
		return { error: `Name exceeds the character limit of ${limits.nameLength} characters.` };
	const nameError = checkBadwords(name);
	if (nameError)
		return { error: `Automation collection name ${nameError}` };
	const status = input?.status ?? currentStatus;
	if (!(["public", "private", "unlisted"] as BestiaryStatus[]).includes(status))
		return { error: "Automation collection status is invalid." };
	return { name, status };
}

// Automation collections
app.post("/api/automation-collection/add", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	const input = validateAutomationCollectionInput(req.body.data as Partial<AutomationCollection> | undefined);
	if ("error" in input)
		return res.status(400).json(input);
	const collection = await createAutomationCollection({
		name: input.name,
		status: input.status,
		owner: { connect: { id: user.id } }
	});
	if (!collection)
		return res.status(500).json({ error: "Failed to create automation collection." });
	return res.status(201).json(collection);
});

app.get("/api/my-automation-collections", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	return res.json(await automationCollections.getForUser(user.id));
});

app.get("/api/user/:userid/automation-collections", possibleUser, async (req, res) => {
	const user = req.body.user;
	if (user?.id === req.params.userid)
		return res.json(await getAutomationCollectionsByOwner(user.id));
	return res.json(await getPublicAutomationCollectionsByOwner(req.params.userid));
});

app.get("/api/automation-collection/:id", possibleUser, async (req, res) => {
	const authorization = await automationCollections.authorize(req.params.id, req.body.user?.id ?? null, "view");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "Automation collection not found." });
		return res.status(401).json({ error: "You don't have access to this automation collection." });
	}
	return res.json(authorization.collection);
});

app.post("/api/automation-collection/:id/update", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	const authorization = await automationCollections.authorize(req.params.id, user.id, "edit");
	if (!authorization.ok) {
		if (authorization.reason === "collection-not-found")
			return res.status(404).json({ error: "Automation collection not found." });
		return res.status(401).json({ error: "You don't have permission to update this automation collection." });
	}
	const input = validateAutomationCollectionInput(req.body.data as Partial<AutomationCollection> | undefined, authorization.collection.status);
	if ("error" in input)
		return res.status(400).json(input);
	const collection = await updateAutomationCollection({
		name: input.name,
		...(authorization.permission === "owner" ? { status: input.status } : {})
	}, authorization.collection.id);
	if (!collection)
		return res.status(500).json({ error: "Failed to update automation collection." });
	return res.json(collection);
});

app.post("/api/automation-collection/:id/delete", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
	const result = await automationCollections.deleteCollection(req.params.id, user.id);
	if (result.ok)
		return res.json({});
	if (result.reason === "collection-not-found")
		return res.status(404).json({ error: "Automation collection not found." });
	if (result.reason === "forbidden")
		return res.status(401).json({ error: "You don't have permission to delete this automation collection." });
	return res.status(500).json({ error: "Failed to delete automation collection." });
});

app.post("/api/automation-collection/:collectionid/editors/add/:userid", requireUser, async (req, res) => {
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
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
	const user = req.body.user;
	if (!user)
		return res.status(404).json({ error: "Couldn't find current user." });
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
