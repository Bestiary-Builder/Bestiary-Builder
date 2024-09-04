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
}
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
	alignment: string | null;
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
	automation: null | AttackModel;
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
	customDescription: string;
}

export interface CasterSpells {
	casterLevel: number | null;
	castingClass: "Wizard" | "Druid" | "Cleric" | "Bard" | "Sorcerer" | "Paladin" | "Ranger" | "Artificer" | "Warlock" | null;
	spellList: string[][];
	spellSlotList: SpellSlotList | undefined;
	spellDcOverride: null | number;
	spellBonusOverride: null | number;
	spellCastingAbility: Stat | null;
	spellCastingAbilityOverride: Stat | null;
	displayAsAction: boolean;
	customDescription: string;
}

export interface InnateSpellsList {
	[key: string]: InnateSpellsEntity[];
}

export interface InnateSpellsEntity {
	spell: string;
	comment: string;
}

export interface SpellSlotList {
	[key: string]: number;
}

export type IntExpression = string;
export type AnnotatedString = string;
export type Effect = Target | Attack | Save | Damage | TempHP | IEffect | Remove_IEffect | Roll | Text | Variable | Condition | Counter | Spell | Check;

export interface Target {
	type: "target";
	target: "all" | "each" | number | "self" | "parent" | "children";
	effects: Effect[];
	sortBy?: "hp_asc" | "hp_desc" | "user_input";
	self_target?: boolean;
}

export interface Attack {
	type: "attack";
	hit: Effect[];
	miss: Effect[];
	attackBonus?: IntExpression;
	adv?: IntExpression;
}

export interface Save {
	type: "save";
	stat: "str" | "dex" | "con" | "int" | "wis" | "cha";
	fail: Effect[];
	success: Effect[];
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
	attack_advantage: IntExpression;
	to_hit_bonus: AnnotatedString;
	damage_bonus: AnnotatedString;
	magical_damage: IntExpression;
	silvered_damage: IntExpression;
	resistances: AnnotatedString[];
	immunities: AnnotatedString[];
	vulnerabilities: AnnotatedString[];
	ignored_resistances: AnnotatedString[];
	ac_value: IntExpression;
	ac_bonus: IntExpression;
	max_hp_value: IntExpression;
	max_hp_bonus: IntExpression;
	save_bonus: AnnotatedString;
	save_adv: AnnotatedString[];
	save_dis: AnnotatedString[];
	check_bonus: AnnotatedString;
	check_adv: AnnotatedString[];
	check_dis: AnnotatedString[];
	dc_bonus: IntExpression;
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
	ability: string | string[];
	contestAbility?: string | string[];
	dc?: IntExpression;
	success?: Effect[];
	fail?: Effect[];
	contestTie?: "fail" | "success" | "neither";
	adv?: -1 | 0 | 1;
}
