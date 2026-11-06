import type * as Prisma from "../prisma/internal/prismaNamespace";
import type { Statblock } from "./statblock";

export type Id = string;
export type CollectionPermission = "none" | "view" | "editor" | "owner";

// Database types
export { BestiaryStatus, SupporterStatus } from "../prisma/enums";
export type User = Omit<Prisma.UserModel, "secret">;
export type Bestiary = Prisma.BestiaryModel;
export type BestiaryEditor = Prisma.BestiaryEditorModel;
export type UserBestiaryBookmark = Prisma.UserBestiaryBookmarkModel;
export type Creature = Prisma.CreatureModel;
export type Automation = Prisma.AutomationModel;
export type AutomationCollection = Prisma.AutomationCollectionModel;
export type AutomationCollectionEditor = Prisma.AutomationCollectionEditorModel;
export type UserAutomationCollectionBookmark = Prisma.UserAutomationCollectionBookmarkModel;

export type CreatureWithStats = Omit<Creature, "stats"> & { stats: Statblock };
export interface CreatureMetaData { id: Id; index: number; name: string; tag: string; race: string; size: string; alignment: string | null; cr: number; environment: string; faction: string };
export type BestiaryExtended = Bestiary & { editors: { userId: Id }[] };
export type BestiaryFull = BestiaryExtended & { creatures: CreatureMetaData[] };
export type BestiaryWithCount = Bestiary & { creatureCount: number };
export type AutomationCollectionExtended = AutomationCollection & { automations: Automation[]; editors: { userId: Id }[] };
export type AutomationCollectionWithCount = AutomationCollection & { automationCount: number };
export type BestiaryResponse = BestiaryFull & { permissionLevel: CollectionPermission };
export type CreatureResponse = CreatureWithStats & { permissionLevel: CollectionPermission };
export type AutomationCollectionResponse = AutomationCollectionExtended & { permissionLevel: CollectionPermission };

export class GlobalStats {
	constructor(public bestiaries: number, public creatures: number, public users: number) { }
}

export interface AutomationDocumentationEntity {
	desc: string;
	url: string;
	variables?: { [key: string]: { type: string; desc: string } };
	opt: { [key: string]: string };
	ts: string;
	class: string;
}
export interface AutomationDocumentation { [key: string]: AutomationDocumentationEntity }

export type AutomationResponse = Automation & { permissionLevel: CollectionPermission };

// Built types
export * from "./attackModel";
export * from "./statblock";

// Frontend types
export const XPbyCR = [
	// skips 1/8 1/4 1/2
	0,
	200,
	450,
	700,
	1100,
	1800,
	2300,
	2900,
	3900,
	5000,
	5900,
	7200,
	8400,
	10000,
	11500,
	13000,
	15000,
	18000,
	20000,
	22000,
	25000,
	33000,
	41000,
	50000,
	62000,
	75000,
	90000,
	105000,
	120000,
	135000,
	155000,
];

export function getXPbyCR(cr: number) {
	if (cr === 0.125)
		return 25;
	else if (cr === 0.25)
		return 50;
	else if (cr === 0.5)
		return 100;
	else return XPbyCR[cr] ?? 0;
}

export interface SearchOptions {
	search: string;
	page: number;
	mode: "popular" | "recent";
	tags: string[];
}

export type AutomationConsumables = AutomationConsumable[];

export interface AutomationConsumable {
	name: string;
	minv: string | null;
	maxv: string | null;
	display_type: "bubble" | "square" | "hex" | "star" | "default" | null;
	reset: "short" | "long" | "none" | null;
	reset_to: string | null;
	reset_by: string | null;
	title: string | null;
	desc: string | null;
	value: number | null;
	ddb_source_feature_id: null;
	ddb_source_feature_type: null;
	live_id: null;
}
