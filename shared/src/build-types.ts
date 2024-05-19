export interface SearchOptions {
	search: string;
	page: number;
	mode: "popular" | "recent";
	tags: string[];
}

export type Stat = "str" | "dex" | "con" | "int" | "cha" | "wis";

export interface Statblock {
	description: Description;
	core: Core;
	abilities: Abilities;
	defenses: Defenses;
	features: Features;
	spellcasting: SpellCasting;
	misc: Misc;
}

export interface Misc {
	legActionsPerRound: number;
	telepathy: number;
	passivePerceptionOverride: number | null;
	featureHeaderTexts: FeatureHeaderTexts;
}

export interface FeatureHeaderTexts {
	features: string;
	actions: string;
	bonus: string;
	reactions: string;
	legendary: string;
	lair: string;
	mythic: string;
	regional: string;
}
export interface Description {
	name: string;
	isProperNoun: boolean;
	description: string;
	image: string;
	faction: string;
	environment: string;
	alignment: string;
	cr: number;
	xp: number;
}
export interface Core {
	proficiencyBonus: number;
	race: string;
	size: string;
	speed: SpeedEntity[];
	senses: SenseEntity[];
	languages: string[] | null;
}
export interface Speed {
	walk: number;
	fly: number;
	isHover: boolean;
	burrow: number;
	swim: number;
	climb: number;
}

export type Unit = "ft" | "m" | "km" | "mi" | "none";

export interface SpeedEntity {
	name: string;
	value: number;
	unit: Unit;
	comment: string;
}

export interface SenseEntity {
	name: string;
	value: number;
	unit: Unit;
	comment: string;
}

export interface Abilities {
	stats: Stats;
	saves: Saves;
	skills: SkillsEntity[];
}
export interface Stats {
	str: number;
	dex: number;
	con: number;
	int: number;
	cha: number;
	wis: number;
}

export interface Saves {
	str: SaveEntity;
	dex: SaveEntity;
	con: SaveEntity;
	int: SaveEntity;
	cha: SaveEntity;
	wis: SaveEntity;
}
export interface SaveEntity {
	isProficient: boolean;
	override: number | null;
}

export interface SkillsEntity {
	skillName: string;
	isHalfProficient: boolean;
	isProficient: boolean;
	isExpertise: boolean;
	override: number | null;
}
export interface Defenses {
	hp: Hp;
	ac: Ac;
	vulnerabilities: string[];
	resistances: string[];
	immunities: string[];
	conditionImmunities: string[];
}
export interface Hp {
	numOfHitDie: number;
	sizeOfHitDie: number;
	override: number | null;
}
export interface Ac {
	ac: number;
	acSource: string;
}
export interface Features {
	features: FeatureEntity[];
	actions: FeatureEntity[];
	bonus: FeatureEntity[];
	reactions: FeatureEntity[];
	legendary: FeatureEntity[];
	mythic: FeatureEntity[];
	lair: FeatureEntity[];
	regional: FeatureEntity[];
}

export interface FeatureEntity {
	name: string;
	description: string;
	automation: null | { [key: string]: unknown } | { [key: string]: unknown }[];
}

export interface SpellCasting {
	innateSpells: InnateSpells;
	casterSpells: CasterSpells;
}

export interface InnateSpells {
	spellList: InnateSpellsList;
	spellDcOverride: null | number;
	spellBonusOverride: null | number;
	spellCastingAbility: Stat | null;
	noComponentsOfType: string[];
	isPsionics: boolean;
	displayAsAction: boolean;
}

export interface CasterSpells {
	casterLevel: number | null;
	castingClass: "Wizard" | "Druid" | "Cleric" | "Bard" | "Sorcerer" | "Paladin" | "Ranger" | "Artificer" | "Warlock" | null;
	spellList: string[][];
	spellSlotList: SpellSlotEntity | undefined;
	spellDcOverride: null | number;
	spellBonusOverride: null | number;
	spellCastingAbility: Stat | null;
	spellCastingAbilityOverride: Stat | null;
	displayAsAction: boolean;
}

export interface InnateSpellsList {
	[key: number]: InnateSpellsEntity[];
}

export interface InnateSpellsEntity {
	spell: string;
	comment: string;
}

export interface SpellSlotEntity {
	[index: number]: number;
}
