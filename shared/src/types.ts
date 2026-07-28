import type * as Prisma from "../prisma/internal/prismaNamespace";
import type { Statblock } from "./build-types";

export type Id = string;

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

export type CreatureWithStats = Omit<Creature, "stats"> & { stats: Statblock };
export type BestiaryExtended = Bestiary & { creatures: { id: Id }[]; editors: { userId: Id }[] };
export type BestiaryWithCount = Bestiary & { creatureCount: number };
export type AutomationCollectionExtended = AutomationCollection & { automations: Automation[]; editors: { userId: Id }[] };

export class GlobalStats {
	constructor(public bestiaries: number, public creatures: number, public users: number) {}
}

export interface AutomationDocumentationEntity {
	desc: string;
	url: string;
	variables: { [key: string]: { type: string; desc: string } };
	opt: { [key: string]: string };
	ts: string;
}
export interface AutomationDocumentation { [key: string]: AutomationDocumentationEntity }

export type AutomationWithType = Omit<Automation, "automation"> & { automation: null | Record<string, unknown> };

// Built types
export * from "./build-types";

// Frontend types
export const defaultStatblock: Statblock = {
	description: {
		name: "New Creature",
		isProperNoun: false,
		description: "",
		image: "",
		faction: "",
		environment: "",
		alignment: "Unaligned",
		cr: 0,
		xp: 0,
	},
	core: {
		proficiencyBonus: 2,
		race: "Humanoid",
		size: "Medium",
		speed: [
			{
				name: "Walk",
				value: 30,
				unit: "ft",
				comment: "",
			},
		],
		senses: [],
		languages: [],
	},
	abilities: {
		stats: {
			str: 10,
			dex: 10,
			con: 10,
			wis: 10,
			int: 10,
			cha: 10,
		},
		saves: {
			str: { isProficient: false, override: null, adv: null },
			dex: { isProficient: false, override: null, adv: null },
			con: { isProficient: false, override: null, adv: null },
			wis: { isProficient: false, override: null, adv: null },
			int: { isProficient: false, override: null, adv: null },
			cha: { isProficient: false, override: null, adv: null },
		},
		skills: [],
	},
	defenses: {
		hp: {
			numOfHitDie: 1,
			sizeOfHitDie: 6,
			override: null,
		},
		ac: {
			ac: 10,
			acSource: "natural armor",
		},
		vulnerabilities: [],
		resistances: [],
		immunities: [],
		conditionImmunities: [],
	},
	features: {
		features: [],
		actions: [],
		bonus: [],
		reactions: [],
		legendary: [],
		lair: [],
		mythic: [],
		regional: [],
	},
	spellcasting: {
		innateSpells: {
			spellList: {
				0: [],
				1: [],
				2: [],
				3: [],
			},
			spellDcOverride: null,
			spellBonusOverride: null,
			spellCastingAbility: null,
			noComponentsOfType: ["Material", "Verbal", "Somatic"],
			isPsionics: false,
			displayAsAction: false,
			customDescription: ""
		},
		casterSpells: {
			casterLevel: null,
			castingClass: null,
			spellCastingAbility: null,
			spellCastingAbilityOverride: null,
			spellList: [[], [], [], [], [], [], [], [], [], []],
			spellSlotList: {},
			spellDcOverride: null,
			spellBonusOverride: null,
			displayAsAction: false,
			customDescription: ""
		},
	},
	misc: {
		legActionsPerRound: 3,
		telepathy: 0,
		passivePerceptionOverride: null,
		featureHeaderTexts: {
			features: "",
			actions: "",
			bonus: "",
			reactions: "",
			legendary: "Legendary Action Uses: $NUM$",
			lair: "On initiative count 20, choose one lair action below; it can't take the same lair action two rounds in a row",
			mythic: "If the creatures' Mythic trait is active, it can use the options below as legendary actions.",
			regional: "The region containing the creatures lair can be transformed by its presence, creating one or more of the following effects:",
		},
	},
};
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
	255000,
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

export interface AttackModel {
	_v: 2;
	name: string;
	automation: Effect[];
	verb?: string;
	proper?: boolean;
	criton?: number;
	phrase?: string;
	thumb?: string;
	extra_crit_damage?: string;
	activation_type?: number;
	list_display_override?: string;
}

export type IntExpression = string;
export type AnnotatedString = string;
export type Effect = Target | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell;
export type EffectWithTarget = Target | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell | Check | Attack | Save | Damage | TempHP | IEffect;
export type EffectKey = keyof Target | keyof Attack | keyof Save | keyof Damage | keyof TempHP | keyof IEffect | keyof Remove_IEffect | keyof Roll | keyof Text | keyof Variable | keyof Condition | keyof Counter | keyof Spell | keyof Check;

export interface Target {
	type: "target";
	target: "all" | "each" | number | "self" | "parent" | "children";
	effects: EffectWithTarget[];
	sortBy?: "hp_asc" | "hp_desc" | "user_input";
	self_target?: boolean;
}
export interface Attack {
	type: "attack";
	hit: EffectWithTarget[];
	miss: EffectWithTarget[];
	attackBonus?: IntExpression;
	adv?: IntExpression;
}

export interface Save {
	type: "save";
	stat: "str" | "dex" | "con" | "int" | "wis" | "cha";
	fail: EffectWithTarget[];
	success: EffectWithTarget[];
	dc?: IntExpression;
	adv?: -1 | 0 | 1;
}

export interface Damage {
	type: "damage";
	damage: AnnotatedString;
	overheal?: boolean;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
	fixedValue?: boolean;
}

export interface TempHP {
	type: "temphp";
	amount: AnnotatedString;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
}

export interface IEffect {
	type: "ieffect2";
	name: AnnotatedString;
	duration?: number | IntExpression;
	effects?: PassiveEffects;
	attacks?: AttackInteraction[];
	buttons?: ButtonInteraction[];
	end?: boolean;
	conc?: boolean;
	desc?: AnnotatedString;
	stacking?: boolean;
	save_as?: string;
	parent?: string;
	target_self?: boolean;
	tick_on_caster?: boolean;
}

export interface PassiveEffects {
	attack_advantage?: IntExpression;
	to_hit_bonus?: AnnotatedString;
	damage_bonus?: AnnotatedString;
	magical_damage?: IntExpression;
	silvered_damage?: IntExpression;
	resistances?: AnnotatedString[];
	immunities?: AnnotatedString[];
	vulnerabilities?: AnnotatedString[];
	ignored_resistances?: AnnotatedString[];
	ac_value?: IntExpression;
	ac_bonus?: IntExpression;
	max_hp_value?: IntExpression;
	max_hp_bonus?: IntExpression;
	save_bonus?: AnnotatedString;
	save_adv?: AnnotatedString[];
	save_dis?: AnnotatedString[];
	check_bonus?: AnnotatedString;
	check_adv?: AnnotatedString[];
	check_dis?: AnnotatedString[];
	dc_bonus?: IntExpression;
}
export interface AttackInteraction {
	attack: AttackModel;
	defaultDC?: IntExpression;
	defaultAttackBonus?: IntExpression;
	defaultCastingMod?: IntExpression;
}

export interface ButtonInteraction {
	automation: Effect[];
	label: AnnotatedString;
	verb?: AnnotatedString;
	style?: IntExpression;
	defaultDC?: IntExpression;
	defaultAttackBonus?: IntExpression;
	defaultCastingMod?: IntExpression;
}

export interface Remove_IEffect {
	type: "remove_ieffect";
	removeParent?: "always" | "if_no_children";
}

export interface Roll {
	type: "roll";
	dice: AnnotatedString;
	name: string;
	higher?: { [key: number]: string };
	cantripScale?: boolean;
	hidden?: boolean;
	displayName?: string;
	fixedValue?: boolean;
}

export interface Text {
	type: "text";
	text: AnnotatedString | AbilityReference;
	title: string;
}

export interface AbilityReference {
	id: number;
	typeId: number;
}

export interface Variable {
	type: "variable";
	name: string;
	value: IntExpression;
	higher?: { [key: number]: IntExpression };
	onError?: IntExpression;
}

export interface Condition {
	type: "condition";
	condition: IntExpression;
	onTrue: Effect[];
	onFalse: Effect[];
	errorBehaviour?: "true" | "false" | "both" | "neither" | "raise";
}

export interface Counter {
	type: "counter";
	counter: string | SpellSlotReference | AbilityReference;
	amount: IntExpression;
	allowOverflow?: boolean;
	errorBehaviour?: "warn" | "raise" | "ignore";
	fixedValue?: boolean;
}

export interface SpellSlotReference {
	slot: number | IntExpression;
}

export interface Spell {
	type: "spell";
	id: number;
	level?: number;
	dc?: IntExpression;
	attackBonus?: IntExpression;
	castingMod?: IntExpression;
	parent?: string;
}

export interface Check {
	type: "check";
	ability: string[];
	contestAbility?: string | string[];
	dc?: IntExpression;
	success: Effect[];
	fail: Effect[];
	contestTie?: "fail" | "success" | "neither";
	adv?: -1 | 0 | 1;
}

export interface FeatureEntity {
	name: string;
	description: string;
	automation: null | AttackModel | AttackModel[];
}
