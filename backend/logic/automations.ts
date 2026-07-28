import type { CollectionWithEditors } from "./collections";
import type { Automation, AutomationCollection, Id } from "~/shared";
import type { AutomationCreateInput, BestiaryStatus } from "~/shared/src/prisma-types";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkAutomationLimits, limits } from "@/utilities/constants";
import { addAutomationCollectionEditor, createAutomation, createAutomationCollection, deleteAutomation, deleteAutomationCollection, getAutomation, getAutomationCollection, getAutomationCollectionsByOwner, getAutomationCollectionsByUser, getPublicAutomationCollectionsByOwner, removeAutomationCollectionEditor, updateAutomation, updateAutomationCollection } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { Prisma } from "~/shared/src/prisma-types";
import { createCollectionService } from "./collections";
import { possibleUser, requireUser } from "./login";

type AutomationCollectionWithEditors = AutomationCollection & CollectionWithEditors;
type AutomationCollectionForUser = AutomationCollectionWithEditors & { automations: Automation[] };

const automationCollections = createCollectionService<AutomationCollectionWithEditors, AutomationCollectionForUser>({
	getById: getAutomationCollection,
	getForUser: getAutomationCollectionsByUser,
	addEditor: addAutomationCollectionEditor,
	removeEditor: removeAutomationCollectionEditor,
	delete: deleteAutomationCollection
});

function checkAutomationCollectionPermission(collection: AutomationCollectionWithEditors, userId: Id | null) {
	return automationCollections.getPermission(collection, userId);
}

async function canAccessAutomation(automation: Automation, userId: Id | null) {
	const authorization = await automationCollections.authorize(automation.collectionId, userId, "view");
	return authorization.ok;
}

async function getAutomationsForUser(userId: Id) {
	return automationCollections.getItemsForUser(userId, collection => collection.automations);
}

// Automation collections
app.get("/api/my-automation-collections", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		return res.json(await automationCollections.getForUser(user.id));
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/user/:userid/automation-collections", possibleUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (user?.id === req.params.userid)
			return res.json(await getAutomationCollectionsByOwner(user.id));
		return res.json(await getPublicAutomationCollectionsByOwner(req.params.userid));
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/automation-collection/:id", possibleUser, async (req, res) => {
	try {
		const user = req.body.user;
		const authorization = await automationCollections.authorize(req.params.id, user?.id ?? null, "view");
		if (!authorization.ok) {
			if (authorization.reason === "collection-not-found")
				return res.status(404).json({ error: "Automation collection not found." });
			return res.status(401).json({ error: "You don't have access to this automation collection." });
		}
		return res.json(authorization.collection);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation-collection/:id/update", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const authorization = await automationCollections.authorize(req.params.id, user.id, "edit");
		if (!authorization.ok) {
			if (authorization.reason === "collection-not-found")
				return res.status(404).json({ error: "Automation collection not found." });
			return res.status(401).json({ error: "You don't have permission to update this automation collection." });
		}
		const collection = authorization.collection;

		const input = req.body.data as Partial<AutomationCollection> | undefined;
		const name = input?.name;
		if (typeof name !== "string")
			return res.status(400).json({ error: "Automation collection name not found." });
		if (name.length < limits.nameMin)
			return res.status(400).json({ error: `Name is less than the minimum character limit of ${limits.nameMin} characters.` });
		if (name.length > limits.nameLength)
			return res.status(400).json({ error: `Name exceeds the character limit of ${limits.nameLength} characters.` });
		const nameError = checkBadwords(name);
		if (nameError)
			return res.status(400).json({ error: `Automation collection name ${nameError}` });
		const status = input?.status ?? collection.status;
		if (!(["public", "private", "unlisted"] as BestiaryStatus[]).includes(status))
			return res.status(400).json({ error: "Automation collection status is invalid." });

		const updatedCollection = await updateAutomationCollection({
			name,
			...(authorization.permission === "owner" ? { status } : {})
		}, collection.id);
		if (!updatedCollection)
			return res.status(500).json({ error: "Failed to update automation collection." });
		return res.json(updatedCollection);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation-collection/:id/delete", requireUser, async (req, res) => {
	try {
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
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation-collection/:collectionid/editors/add/:userid", requireUser, async (req, res) => {
	try {
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
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation-collection/:collectionid/editors/remove/:userid", requireUser, async (req, res) => {
	try {
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
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Get info
app.get("/api/automation/:id", possibleUser, async (req, res) => {
	try {
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Automation id not valid." });
		const user = req.body.user;
		const automation = await getAutomation(_id);
		if (!automation)
			return res.status(404).json({ error: "No automation with that id found." });
		if (!await canAccessAutomation(automation, user?.id ?? null))
			return res.status(401).json({ error: "You don't have access to this automation." });

		log.info(`Retrieved automation with the id ${_id}`);
		return res.json(automation);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});
app.get("/api/my-automations", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find user" });
		const allAutomations = await getAutomationsForUser(user.id);
		log.info(`Retrieved ${allAutomations.length} automations from the current user with the id ${user.id}`);
		return res.json(allAutomations);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/my-automations/list", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find user" });
		const allAutomations = await getAutomationsForUser(user.id);
		log.info(`Retrieved all automations in list form from the current user with the id ${user.id}`);
		return res.json(allAutomations.map(({ id, name }) => ({ id, name })));
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Update info
app.post("/api/automation/:id/update", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Invalid automation id." });
		if (!req.body.data)
			return res.status(400).json({ error: "Automation data not found." });
		const input = req.body.data as Partial<Automation>;
		const data = {
			id: _id,
			automation: input.automation ?? null,
			name: input.name ?? "New automation",
			description: input.description ?? ""
		};

		// Check limits
		const limitError = checkAutomationLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Remove bad words
		const nameError = checkBadwords(data.name);
		if (nameError)
			return res.status(400).json({ error: `Automation name ${nameError}` });
		const descError = checkBadwords(data.description);
		if (descError)
			return res.status(400).json({ error: `Automation description ${descError}` });
		const automationData = data.automation === null
			? Prisma.DbNull
			: data.automation as unknown as AutomationCreateInput["automation"];
		// Update existing automation
		const automation = await getAutomation(data.id);
		if (automation) {
			if (!await canAccessAutomation(automation, user.id))
				return res.status(401).json({ error: "You don't have permission to update this automation." });
			// Limit properties that are editable:
			const update = {
				name: data.name,
				automation: automationData,
				description: data.description
			};

			// Update:
			const updatedId = await updateAutomation(update, data.id);
			if (updatedId) {
				log.info(`Updated automation with the id ${data.id}`);
				return res.status(200).json({ ...automation, ...data });
			}
		}
		else {
			return res.status(404).json({ error: "No automation with that id found." });
		}
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.post("/api/automation/add", requireUser, async (req, res) => {
	try {
		// Get input
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		if (!req.body.data)
			return res.status(400).json({ error: "Automation data not found." });
		const input = req.body.data as Partial<Automation>;
		const data = {
			automation: input.automation ?? null,
			name: input.name ?? "",
			description: input.description ?? ""
		};
		// Check limits
		const limitError = checkAutomationLimits(data);
		if (limitError)
			return res.status(400).json({ error: limitError });
		// Remove bad words
		const nameError = checkBadwords(data.name);
		if (nameError)
			return res.status(400).json({ error: `Automation name ${nameError}` });
		const descError = checkBadwords(data.description);
		if (descError)
			return res.status(400).json({ error: `Automation description ${descError}` });
		const automationData = data.automation === null
			? Prisma.DbNull
			: data.automation as unknown as AutomationCreateInput["automation"];
		let collectionId = input.collectionId;
		let collection: AutomationCollectionWithEditors | null = null;
		if (collectionId) {
			collection = await getAutomationCollection(collectionId);
		}
		else {
			collectionId = `default-${user.id}`;
			collection = await getAutomationCollection(collectionId);
			if (!collection) {
				collection = await createAutomationCollection({
					id: collectionId,
					name: "My Automations",
					status: "private",
					owner: { connect: { id: user.id } }
				});
			}
			if (!collection)
				return res.status(500).json({ error: "Failed to create the default automation collection." });
		}
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (!automationCollections.canPerform("edit", checkAutomationCollectionPermission(collection, user.id)))
			return res.status(401).json({ error: "You don't have permission to add an automation to this collection." });
		// Create new automation
		const automation = await createAutomation(
			{ ...data, automation: automationData },
			collectionId
		);
		if (!automation)
			return res.status(500).json({ error: "Failed to create automation." });
		log.info(`Created new automation with the id ${automation.id}`);
		return res.status(201).json(automation);
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/automation/:id/delete", requireUser, async (req, res) => {
	try {
		// Get input
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Automation id not valid." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		// Permissions
		const automation = await getAutomation(_id);
		if (!automation)
			return res.status(404).json({ error: "Couldn't find automation." });
		if (!await canAccessAutomation(automation, user.id))
			return res.status(401).json({ error: "You don't have permission to delete this automation." });
		// Remove from db
		const status = await deleteAutomation(_id);
		if (status) {
			log.info(`Deleted automation with the id ${_id}`);
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
