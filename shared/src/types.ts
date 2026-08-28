import type * as Prisma from "../prisma/internal/prismaNamespace";
import type { Statblock } from "./build-types";

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
export interface CreatureMetaData { id: Id; index: number; name: string; race: string; size: string; alignment: string | null; cr: number; environment: string; faction: string };
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
	variables: { [key: string]: { type: string; desc: string } };
	opt: { [key: string]: string };
	ts: string;
}
export interface AutomationDocumentation { [key: string]: AutomationDocumentationEntity }

export type AutomationWithType = Omit<Automation, "automation"> & { automation: null | AttackModel | AttackModel[] };
export type AutomationResponse = AutomationWithType & { permissionLevel: CollectionPermission };

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

export const defaultInterestingStatblock: Statblock = {
	"core": {
		"race": "Dragon (Chromatic)",
		"size": "Huge",
		"speed": [
			{
				"name": "Walk",
				"unit": "ft",
				"value": 40,
				"comment": ""
			},
			{
				"name": "Fly",
				"unit": "ft",
				"value": 80,
				"comment": ""
			},
			{
				"name": "Climb",
				"unit": "ft",
				"value": 40,
				"comment": ""
			}
		],
		"senses": [
			{
				"name": "Blindsight",
				"unit": "ft",
				"value": 60,
				"comment": ""
			},
			{
				"name": "Darkvision",
				"unit": "ft",
				"value": 120,
				"comment": ""
			}
		],
		"languages": [
			"Common",
			"Draconic"
		],
		"proficiencyBonus": 6
	},
	"misc": {
		"telepathy": 0,
		"featureHeaderTexts": {
			"lair": "On initiative count 20, choose one lair action below; it can't take the same lair action two rounds in a row",
			"bonus": "",
			"mythic": "",
			"actions": "",
			"features": "",
			"regional": "The region containing the creatures lair can be transformed by its presence, creating one or more of the following effects:",
			"legendary": "Legendary Action Uses: $NUM$",
			"reactions": ""
		},
		"legActionsPerRound": 3,
		"passivePerceptionOverride": null
	},
	"defenses": {
		"ac": {
			"ac": 19,
			"acSource": ""
		},
		"hp": {
			"override": null,
			"numOfHitDie": 19,
			"sizeOfHitDie": 12
		},
		"immunities": [
			"Fire"
		],
		"resistances": [],
		"vulnerabilities": [],
		"conditionImmunities": []
	},
	"features": {
		"lair": [],
		"bonus": [],
		"mythic": [],
		"actions": [
			{
				"name": "Multiattack",
				"automation": null,
				"description": "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray."
			},
			{
				"name": "Rend",
				"automation": {
					"_v": 2,
					"name": "Rend",
					"automation": [
						{
							"text": "*Melee Attack Roll:* +14, reach 10 ft. *Hit:* 13 (1d10 + 8) Slashing damage plus 5 (2d4) Fire damage.",
							"type": "text",
							"title": "Effect"
						},
						{
							"type": "target",
							"target": "each",
							"effects": [
								{
									"adv": "0",
									"hit": [
										{
											"type": "damage",
											"damage": "(1d10 + 8 [slashing]) + (2d4 [fire])"
										}
									],
									"miss": [],
									"type": "attack",
									"attackBonus": "14"
								}
							]
						}
					],
					"activation_type": 1
				},
				"description": "*Melee Attack Roll:* +14, reach 10 ft. *Hit:* 13 (1d10 + 8) Slashing damage plus 5 (2d4) Fire damage."
			},
			{
				"name": "Fire Breath (Recharge 5-6)",
				"automation": {
					"_v": 2,
					"name": "Fire Breath (Recharge 5-6)",
					"automation": [
						{
							"text": "*Dexterity Saving Throw:* DC 21, each creature in a 60-foot Cone. *Failure:* 59 (17d6) Fire damage. *Success:* Half damage.",
							"type": "text",
							"title": "Effect"
						},
						{
							"type": "target",
							"target": "self",
							"effects": [
								{
									"name": "Fire Breath Used",
									"type": "ieffect2",
									"buttons": [
										{
											"verb": "attempts to recharge their Fire Breath",
											"label": "Recharge Fire Breath",
											"style": "3",
											"automation": [
												{
													"dice": "1d6",
													"name": "recharge",
													"type": "roll",
													"fixedValue": true
												},
												{
													"type": "condition",
													"onTrue": [
														{
															"type": "remove_ieffect"
														},
														{
															"text": "{{caster.name}} recharges their Fire Breath!",
															"type": "text",
															"title": "Effect"
														}
													],
													"onFalse": [
														{
															"text": "{{caster.name}} doesn't recharge their Fire Breath!",
															"type": "text",
															"title": "Effect"
														}
													],
													"condition": "int(recharge) >= 5",
													"errorBehaviour": "false"
												}
											]
										}
									],
									"duration": -1,
									"stacking": true
								}
							]
						},
						{
							"dice": "17d6 [fire]",
							"name": "damage",
							"type": "roll"
						},
						{
							"type": "target",
							"target": "each",
							"effects": [
								{
									"dc": "21",
									"fail": [
										{
											"type": "damage",
											"damage": "{damage}"
										}
									],
									"stat": "dex",
									"type": "save",
									"success": [
										{
											"type": "damage",
											"damage": "{damage}/2"
										}
									]
								}
							]
						}
					],
					"activation_type": 1
				},
				"description": "*Dexterity Saving Throw:* DC 21, each creature in a 60-foot Cone. *Failure:* 59 (17d6) Fire damage. *Success:* Half damage."
			}
		],
		"features": [
			{
				"name": "Legendary Resistance (3/Day, or 4/Day in Lair)",
				"automation": null,
				"description": "If the dragon fails a saving throw, it can choose to succeed instead."
			},
			{
				"name": "Pounce",
				"automation": {
					"_v": 2,
					"name": "Pounce",
					"automation": [
						{
							"text": "The dragon moves up to half its Speed, and it makes one Rend attack.",
							"type": "text",
							"title": "Effect"
						},
						{
							"type": "target",
							"target": "each",
							"effects": [
								{
									"adv": "0",
									"hit": [
										{
											"type": "damage",
											"damage": "(1d10 + 8 [slashing]) + (2d4 [fire])"
										}
									],
									"miss": [],
									"type": "attack",
									"attackBonus": "14"
								}
							]
						}
					],
					"activation_type": 8
				},
				"description": "The dragon moves up to half its Speed, and it makes one Rend attack."
			}
		],
		"regional": [],
		"legendary": [
			{
				"name": "Commanding Presence",
				"automation": null,
				"description": "The dragon uses Spellcasting to cast Command (level 2 version). The dragon can't take this action again until the start of its next turn."
			},
			{
				"name": "Fiery Rays",
				"automation": null,
				"description": "The dragon uses Spellcasting to cast Scorching Ray. The dragon can't take this action again until the start of its next turn."
			},
			{
				"name": "Pounce",
				"automation": null,
				"description": "The dragon moves up to half its Speed, and it makes one Rend attack."
			}
		],
		"reactions": []
	},
	"abilities": {
		"saves": {
			"cha": {
				"adv": null,
				"override": null,
				"isProficient": false
			},
			"con": {
				"adv": null,
				"override": null,
				"isProficient": false
			},
			"dex": {
				"adv": null,
				"override": null,
				"isProficient": true
			},
			"int": {
				"adv": null,
				"override": null,
				"isProficient": false
			},
			"str": {
				"adv": null,
				"override": null,
				"isProficient": false
			},
			"wis": {
				"adv": null,
				"override": null,
				"isProficient": true
			}
		},
		"stats": {
			"cha": 23,
			"con": 25,
			"dex": 10,
			"int": 16,
			"str": 27,
			"wis": 13
		},
		"skills": [
			{
				"adv": null,
				"override": null,
				"skillName": "Perception",
				"isExpertise": true,
				"isProficient": false,
				"isHalfProficient": false
			},
			{
				"adv": null,
				"override": null,
				"skillName": "Stealth",
				"isExpertise": false,
				"isProficient": true,
				"isHalfProficient": false
			}
		]
	},
	"description": {
		"cr": 17,
		"xp": 18000,
		"name": "Adult Red Dragon",
		"image": "",
		"faction": "",
		"alignment": "Chaotic Evil",
		"description": "",
		"environment": "hill, mountain",
		"isProperNoun": false
	},
	"spellcasting": {
		"casterSpells": {
			"spellList": [
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[]
			],
			"casterLevel": null,
			"castingClass": null,
			"spellSlotList": {},
			"displayAsAction": false,
			"spellDcOverride": null,
			"customDescription": "",
			"spellBonusOverride": null,
			"spellCastingAbility": "cha",
			"spellCastingAbilityOverride": null
		},
		"innateSpells": {
			"spellList": {
				"0": [
					{
						"spell": "Command",
						"comment": "level 2 version"
					},
					{
						"spell": "Detect Magic",
						"comment": ""
					},
					{
						"spell": "Scorching Ray",
						"comment": ""
					}
				],
				"1": [
					{
						"spell": "Fireball",
						"comment": ""
					}
				],
				"2": [],
				"3": []
			},
			"isPsionics": false,
			"displayAsAction": true,
			"spellDcOverride": null,
			"customDescription": "",
			"noComponentsOfType": [
				"Material",
				"Somatic",
				"Verbal"
			],
			"spellBonusOverride": null,
			"spellCastingAbility": "cha"
		}
	}
}
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
	hidden?: boolean;
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
	contestAbility?: string[];
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
