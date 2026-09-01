import type { Automation, AutomationConsumables, Id } from "~/shared";
import type { AutomationCreateInput } from "~/shared/src/prisma-types";
import { checkBadwords } from "@/utilities/badwords";
import { app, checkAutomationLimits } from "@/utilities/constants";
import { createAutomation, deleteAutomation, getAutomation, updateAutomation } from "@/utilities/database";
import { log } from "@/utilities/logger";
import { Prisma } from "~/shared/src/prisma-types";
import { automationCollections, getOrCreateDefaultAutomationCollection } from "../collections/automationCollections";
import { validateAutomationConsumablesInput } from "../external/validation";
import { possibleUser, requireUser } from "../main/login";

async function canEditAutomation(automation: Automation, userId: Id) {
	return (await automationCollections.authorize(automation.collectionId, userId, "edit")).ok;
}

async function getAutomationsForUser(userId: Id) {
	return automationCollections.getItemsForUser(userId, collection => collection.automations);
}

export function prepareAutomationInput(input: Partial<Automation>, defaultName: string) {
	const data = {
		automation: input.automation ?? null,
		name: input.name ?? defaultName,
		description: input.description ?? ""
	};
	const limitError = checkAutomationLimits(data);
	if (limitError)
		return { data, error: limitError };
	const nameError = checkBadwords(data.name);
	if (nameError)
		return { data, error: `Automation name ${nameError}` };
	const descriptionError = checkBadwords(data.description);
	if (descriptionError)
		return { data, error: `Automation description ${descriptionError}` };
	return {
		data,
		automationData: data.automation === null
			? Prisma.DbNull
			: data.automation as unknown as AutomationCreateInput["automation"]
	};
}

// Get info
app.get("/api/automation/:id", possibleUser, async (req, res) => {
	const id = req.params.id;
	if (!id)
		return res.status(400).json({ error: "Automation id not valid." });
	const automation = await getAutomation(id);
	if (!automation)
		return res.status(404).json({ error: "No automation with that id found." });
	const authorization = await automationCollections.authorize(automation.collectionId, req.user?.id ?? null, "view");
	if (!authorization.ok)
		return res.status(401).json({ error: " You don't have access to this automation." });

	log.info(`Retrieved automation with the id ${id}`);
	return res.json({ ...automation, permissionLevel: authorization.permission });
});

app.get("/api/my-automations", requireUser, async (req, res) => {
	const user = req.user!;
	const automations = await getAutomationsForUser(user.id);
	log.info(`Retrieved ${automations.length} automations from the current user with the id ${user.id}`);
	return res.json(automations);
});

app.get("/api/my-automations/list", requireUser, async (req, res) => {
	const user = req.user!;
	const automations = await getAutomationsForUser(user.id);
	log.info(`Retrieved all automations in list form from the current user with the id ${user.id}`);
	return res.json(automations.map(({ id, name }) => ({ id, name })));
});

// Update info
app.post("/api/automation/:id/update", requireUser, async (req, res) => {
	const user = req.user!;
	const id = req.params.id;
	if (!id)
		return res.status(400).json({ error: "Invalid automation id." });
	if (!req.body.data)
		return res.status(400).json({ error: "Automation data not found." });
	const input = req.body.data as Partial<Automation>;
	const hasConsumables = Object.hasOwn(input, "consumables");
	if (hasConsumables && !validateAutomationConsumablesInput(input.consumables || [], res))
		return;
	const consumablesData = hasConsumables
		? { consumables: input.consumables as AutomationConsumables }
		: {};
	const preparedInput = prepareAutomationInput(input, "New automation");
	if ("error" in preparedInput)
		return res.status(400).json({ error: preparedInput.error });
	const data = { id, ...preparedInput.data, ...consumablesData };
	const automation = await getAutomation(id);
	if (!automation)
		return res.status(404).json({ error: "No automation with that id found." });
	if (!await canEditAutomation(automation, user.id))
		return res.status(401).json({ error: "You don't have permission to update this automation." });
	const updatedId = await updateAutomation({
		name: data.name,
		automation: preparedInput.automationData,
		description: data.description,
		...consumablesData
	}, id);
	if (!updatedId)
		return res.status(500).json({ error: "Failed to update automation." });
	log.info(`Updated automation with the id ${data.id}`);
	return res.status(200).json({ ...automation, ...data });
});

app.post("/api/automation/add", requireUser, async (req, res) => {
	const user = req.user!;
	if (!req.body.data)
		return res.status(400).json({ error: "Automation data not found." });
	const input = req.body.data as { automation: Partial<Automation>; collectionId: string };
	const preparedInput = prepareAutomationInput(input.automation, "");
	if ("error" in preparedInput)
		return res.status(400).json({ error: preparedInput.error });
	let collectionId = input.collectionId;
	if (collectionId) {
		const authorization = await automationCollections.authorize(collectionId, user.id, "edit");
		if (!authorization.ok) {
			if (authorization.reason === "collection-not-found")
				return res.status(404).json({ error: "Automation collection not found." });
			return res.status(401).json({ error: "You don't have permission to add an automation to this collection." });
		}
	}
	else {
		const collection = await getOrCreateDefaultAutomationCollection(user.id);
		if (!collection)
			return res.status(500).json({ error: "Failed to create the default automation collection." });
		collectionId = collection.id;
		if (!automationCollections.canPerform("edit", automationCollections.getPermission(collection, user.id)))
			return res.status(401).json({ error: "You don't have permission to add an automation to this collection." });
	}

	const automation = await createAutomation({ ...preparedInput.data, automation: preparedInput.automationData }, collectionId);
	if (!automation)
		return res.status(500).json({ error: "Failed to create automation." });
	log.info(`Created new automation with the id ${automation.id}`);
	return res.status(201).json(automation);
});

app.get("/api/automation/:id/delete", requireUser, async (req, res) => {
	const id = req.params.id;
	if (!id)
		return res.status(400).json({ error: "Automation id not valid." });
	const user = req.user!;
	const automation = await getAutomation(id);
	if (!automation)
		return res.status(404).json({ error: "Couldn't find automation." });
	if (!await canEditAutomation(automation, user.id))
		return res.status(401).json({ error: "You don't have permission to delete this automation." });
	if (!await deleteAutomation(id))
		return res.status(500).json({ error: "Failed to delete automation." });
	log.info(`Deleted automation with the id ${id}`);
	return res.json({});
});
