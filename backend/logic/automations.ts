import type { Automation, AutomationCollection, Id } from "~/shared";
import type { AutomationCreateInput } from "~/shared/src/prisma-types";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkAutomationLimits, limits } from "@/utilities/constants";
import { addAutomationCollectionEditor, createAutomation, createAutomationCollection, deleteAutomation, deleteAutomationCollection, getAutomation, getAutomationCollection, getAutomationCollectionsByUser, getUser, removeAutomationCollectionEditor, updateAutomation, updateAutomationCollection } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { Prisma } from "~/shared/src/prisma-types";
import { requireUser } from "./login";

type AutomationCollectionPermission = "none" | "editor" | "owner";
type AutomationCollectionWithEditors = AutomationCollection & { editors: { userId: Id }[] };

function checkAutomationCollectionPermission(collection: AutomationCollectionWithEditors, userId: Id): AutomationCollectionPermission {
	if (collection.ownerId === userId)
		return "owner";
	if (collection.editors.some(editor => editor.userId === userId))
		return "editor";
	return "none";
}

async function canAccessAutomation(automation: Automation, userId: Id) {
	const collection = await getAutomationCollection(automation.collectionId);
	return collection !== null && checkAutomationCollectionPermission(collection, userId) !== "none";
}

async function getAutomationsForUser(userId: Id) {
	const collections = await getAutomationCollectionsByUser(userId);
	return collections.flatMap(collection => collection.automations);
}

// Automation collections
app.get("/api/my-automation-collections", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		return res.json(await getAutomationCollectionsByUser(user.id));
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

app.get("/api/automation-collection/:id", requireUser, async (req, res) => {
	try {
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const collection = await getAutomationCollection(req.params.id);
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) === "none")
			return res.status(401).json({ error: "You don't have access to this automation collection." });
		return res.json(collection);
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
		const collection = await getAutomationCollection(req.params.id);
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) === "none")
			return res.status(401).json({ error: "You don't have permission to update this automation collection." });

		const name = (req.body.data as Partial<AutomationCollection> | undefined)?.name;
		if (typeof name !== "string")
			return res.status(400).json({ error: "Automation collection name not found." });
		if (name.length < limits.nameMin)
			return res.status(400).json({ error: `Name is less than the minimum character limit of ${limits.nameMin} characters.` });
		if (name.length > limits.nameLength)
			return res.status(400).json({ error: `Name exceeds the character limit of ${limits.nameLength} characters.` });
		const nameError = checkBadwords(name);
		if (nameError)
			return res.status(400).json({ error: `Automation collection name ${nameError}` });

		const updatedCollection = await updateAutomationCollection({ name }, collection.id);
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
		const collection = await getAutomationCollection(req.params.id);
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) !== "owner")
			return res.status(401).json({ error: "You don't have permission to delete this automation collection." });
		if (!await deleteAutomationCollection(collection.id))
			return res.status(500).json({ error: "Failed to delete automation collection." });
		return res.json({});
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
		const collection = await getAutomationCollection(req.params.collectionid);
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) !== "owner")
			return res.status(401).json({ error: "You don't have permission to add editors to this automation collection." });
		const editor = await getUser(req.params.userid);
		if (!editor)
			return res.status(404).json({ error: "No user with that id found." });
		if (editor.id === collection.ownerId)
			return res.status(400).json({ error: "The collection owner cannot be added as an editor." });
		if (collection.editors.some(existingEditor => existingEditor.userId === editor.id))
			return res.status(409).json({ error: "User is already an editor." });
		if (!await addAutomationCollectionEditor(collection.id, editor.id))
			return res.status(500).json({ error: "Failed to add automation collection editor." });
		return res.json({});
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
		const collection = await getAutomationCollection(req.params.collectionid);
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) !== "owner")
			return res.status(401).json({ error: "You don't have permission to remove editors from this automation collection." });
		const editor = await getUser(req.params.userid);
		if (!editor)
			return res.status(404).json({ error: "No user with that id found." });
		if (!collection.editors.some(existingEditor => existingEditor.userId === editor.id))
			return res.status(404).json({ error: "User is not an editor." });
		if (!await removeAutomationCollectionEditor(collection.id, editor.id))
			return res.status(500).json({ error: "Failed to remove automation collection editor." });
		return res.json({});
	}
	catch (err) {
		log.log("critical", err);
		return res.status(500).json({ error: "Unknown server error occured, please try again." });
	}
});

// Get info
app.get("/api/automation/:id", requireUser, async (req, res) => {
	try {
		const _id = req.params.id;
		if (!_id)
			return res.status(400).json({ error: "Automation id not valid." });
		const user = req.body.user;
		if (!user)
			return res.status(404).json({ error: "Couldn't find current user." });
		const automation = await getAutomation(_id);
		if (!automation)
			return res.status(404).json({ error: "No automation with that id found." });
		if (!await canAccessAutomation(automation, user.id))
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
					owner: { connect: { id: user.id } }
				});
			}
			if (!collection)
				return res.status(500).json({ error: "Failed to create the default automation collection." });
		}
		if (!collection)
			return res.status(404).json({ error: "Automation collection not found." });
		if (checkAutomationCollectionPermission(collection, user.id) === "none")
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
