// Mostly from https://github.com/avrae/avrae.io/blob/master/src/app/shared/automation-editor/effect-editor/ieffect-effect/passiveEffects.ts

import type { PassiveEffects } from "~/shared";

type PassiveEffectType = "annotatedstring" | "intexpression";
const AnnotatedString = "annotatedstring";
const IntExpression = "intexpression";

// utility consts
const DAMAGE_TYPES = [
	{ label: "Bludgeoning", value: "bludgeoning" },
	{ label: "Piercing", value: "piercing" },
	{ label: "Slashing", value: "slashing" },
	{ label: "Acid", value: "acid" },
	{ label: "Cold", value: "cold" },
	{ label: "Fire", value: "fire" },
	{ label: "Force", value: "force" },
	{ label: "Lightning", value: "lightning" },
	{ label: "Necrotic", value: "necrotic" },
	{ label: "Poison", value: "poison" },
	{ label: "Psychic", value: "psychic" },
	{ label: "Radiant", value: "radiant" },
	{ label: "Thunder", value: "thunder" },
];

const SAVING_THROWS = [
	{ label: "All", value: "all" },
	{ label: "Strength", value: "str" },
	{ label: "Dexterity", value: "dex" },
	{ label: "Constitution", value: "con" },
	{ label: "Intelligence", value: "int" },
	{ label: "Wisdom", value: "wis" },
	{ label: "Charisma", value: "cha" },
] as const;

const SKILL_NAMES = [
	{ label: "All", value: "all" },
	{ label: "Acrobatics", value: "acrobatics" },
	{ label: "Animal Handling", value: "animalHandling" },
	{ label: "Arcana", value: "arcana" },
	{ label: "Athletics", value: "athletics" },
	{ label: "Deception", value: "deception" },
	{ label: "History", value: "history" },
	{ label: "Initiative", value: "initiative" },
	{ label: "Insight", value: "insight" },
	{ label: "Intimidation", value: "intimidation" },
	{ label: "Investigation", value: "investigation" },
	{ label: "Medicine", value: "medicine" },
	{ label: "Nature", value: "nature" },
	{ label: "Perception", value: "perception" },
	{ label: "Performance", value: "performance" },
	{ label: "Persuasion", value: "persuasion" },
	{ label: "Religion", value: "religion" },
	{ label: "Sleight of Hand", value: "sleightOfHand" },
	{ label: "Stealth", value: "stealth" },
	{ label: "Survival", value: "survival" },
	{ label: "Strength", value: "strength" },
	{ label: "Dexterity", value: "dexterity" },
	{ label: "Constitution", value: "constitution" },
	{ label: "Intelligence", value: "intelligence" },
	{ label: "Wisdom", value: "wisdom" },
	{ label: "Charisma", value: "charisma" },
] as const;

// ==== passive effects ====
export interface PassiveEffectDef {
	label: string;
	value: keyof PassiveEffects;
	// used to render either the intexpression help or annotatedstring help for custom values
	type: PassiveEffectType;
	// allow adding multiple of this passive effect
	isList?: boolean;
	// if set, default to the first default option and allow the user to choose between any of these or an expression
	defaultOptions?: Readonly<{ label: string; value: string }[]>;
}

export const PASSIVE_EFFECTS: PassiveEffectDef[] = [
	 {
		label: "Attack Advantage",
		value: "attack_advantage",
		type: IntExpression,
		defaultOptions: [
			{ label: "Flat", value: "0" },
			{ label: "Advantage", value: "1" },
			{ label: "Disadvantage", value: "-1" },
			{ label: "Elven Accuracy", value: "2" }
		]
	},
	{
		label: "To Hit Bonus",
		value: "to_hit_bonus",
		type: AnnotatedString
	},
	{
		label: "Damage Bonus",
		value: "damage_bonus",
		type: AnnotatedString
	},
	{
		label: "Magical Damage",
		value: "magical_damage",
		type: IntExpression,
		defaultOptions: [{ label: "True", value: "1" }]
	},
	 {
		label: "Silvered Damage",
		value: "silvered_damage",
		type: IntExpression,
		defaultOptions: [{ label: "True", value: "1" }, { label: "False", value: "0" }]
	},
	{
		label: "Resistance",
		value: "resistances",
		type: AnnotatedString,
		isList: true,
		defaultOptions: DAMAGE_TYPES
	},
	{
		label: "Immunity",
		value: "immunities",
		type: AnnotatedString,
		isList: true,
		defaultOptions: DAMAGE_TYPES
	},
	{
		label: "Vulnerability",
		value: "vulnerabilities",
		type: AnnotatedString,
		isList: true,
		defaultOptions: DAMAGE_TYPES
	},
	{
		label: "Ignore Resistance",
		value: "ignored_resistances",
		type: AnnotatedString,
		isList: true,
		defaultOptions: DAMAGE_TYPES
	},
	{
		label: "Set AC",
		value: "ac_value",
		type: IntExpression
	},
	{
		label: "AC Bonus",
		value: "ac_bonus",
		type: IntExpression
	},
	{
		label: "Set Max HP",
		value: "max_hp_value",
		type: IntExpression
	},
	{
		label: "Max HP Bonus",
		value: "max_hp_bonus",
		type: IntExpression
	},
	{
		label: "Saving Throw Bonus",
		value: "save_bonus",
		type: AnnotatedString
	},
	{
		label: "Saving Throw Advantage",
		value: "save_adv",
		type: AnnotatedString,
		isList: true,
		defaultOptions: SAVING_THROWS
	},
	 {
		label: "Saving Throw Disadvantage",
		value: "save_dis",
		type: AnnotatedString,
		isList: true,
		defaultOptions: SAVING_THROWS
	},
	{
		label: "Ability Check Bonus",
		value: "check_bonus",
		type: AnnotatedString
	},
	{
		label: "Ability Check Advantage",
		value: "check_adv",
		type: AnnotatedString,
		isList: true,
		defaultOptions: SKILL_NAMES
	},
	{
		label: "Ability Check Disadvantage",
		value: "check_dis",
		type: AnnotatedString,
		isList: true,
		defaultOptions: SKILL_NAMES
	},
	{
		label: "DC Bonus",
		value: "dc_bonus",
		type: IntExpression
	},
] as const;
