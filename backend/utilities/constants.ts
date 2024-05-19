// Express app
import crypto from "node:crypto";
import express from "express";

// Secrets:

// Import badwords
import "./badwords";

// Limits
import l from "@/staticData/limits.json";
import type { Automation, Bestiary, Creature, User } from "~/shared";

export const app = express();

// Is production
export const isProduction = (process.env.NODE_ENV === "production") as boolean;

export function generateUserSecret(): string {
	return crypto.randomBytes(64).toString("hex");
}
export const limits = l;
export function checkCreatureAmountLimit(bestiary: Bestiary) {
	if (bestiary.creatures.length > limits.creatureAmount)
		return `Number of creatures exceeds the limit of ${limits.creatureAmount}.`;
}
export function checkBestiaryLimits(bestiary: Bestiary) {
	if (!["private", "public", "unlisted"].includes(bestiary.status))
		return "Status has an unkown value, must only be 'public', 'unlisted' or 'private'.";
	return checkLimits(bestiary) ?? checkCreatureAmountLimit(bestiary);
}
export function checkCreatureLimits(creature: Creature) {
	return checkLimits(creature.stats.description);
}
export function checkAutomationLimits(automation: Automation) {
	return checkLimits(automation);
}
function checkLimits(data: Bestiary | Automation | Creature["stats"]["description"]) {
	if (data.name.length > limits.nameLength)
		return `Name exceeds the character limit of ${limits.nameLength} characters.`;
	if (data.name.length < limits.nameMin)
		return `Name is less than the minimum character limit of ${limits.nameMin} characters.`;
	if (data.description.length > limits.descriptionLength)
		return `Description exceeds the character limit of ${limits.descriptionLength} characters.`;
}

// Inject additional properties on express.Request
declare module "express" {
	interface Request {
		body: {
			user: User | null;
			data: any;
		};
	}
}
