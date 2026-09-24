import type { Statblock } from "./types";

export const editorHintsGlobal = [
	{ name: "charisma", detail: "int", doc: "Charisma score." },
	{ name: "charismaMod", detail: "int", doc: "Charisma modifier." },
	{ name: "charismaSave", detail: "int", doc: "Charisma saving throw modifier." },
	{ name: "constitution", detail: "int", doc: "Constitution score." },
	{ name: "constitutionMod", detail: "int", doc: "Constitution modifier." },
	{ name: "constitutionSave", detail: "int", doc: "Constitution saving throw modifier." },
	{ name: "dexterity", detail: "int", doc: "Dexterity score." },
	{ name: "dexterityMod", detail: "int", doc: "Dexterity modifier." },
	{ name: "dexteritySave", detail: "int", doc: "Dexterity saving throw modifier." },
	{ name: "intelligence", detail: "int", doc: "Intelligence score." },
	{ name: "intelligenceMod", detail: "int", doc: "Intelligence modifier." },
	{ name: "intelligenceSave", detail: "int", doc: "Intelligence saving throw modifier." },
	{ name: "strength", detail: "int", doc: "Strength score." },
	{ name: "strengthMod", detail: "int", doc: "Strength modifier." },
	{ name: "strengthSave", detail: "int", doc: "Strength saving throw modifier." },
	{ name: "wisdom", detail: "int", doc: "Wisdom score." },
	{ name: "wisdomMod", detail: "int", doc: "Wisdom modifier." },
	{ name: "wisdomSave", detail: "int", doc: "Wisdom saving throw modifier." },
	{ name: "proficiencyBonus", detail: "int", doc: "Proficiency bonus." },

];

export const editorHintsCharacter = [
	{ name: "ArtificerLevel", detail: "int", doc: "The character's Artificer Level" },
	{ name: "BardLevel", detail: "int", doc: "The character's Bard Level" },
	{ name: "BarbarianLevel", detail: "int", doc: "The character's BarbarianLevel Level" },
	{ name: "ClericLevel", detail: "int", doc: "The character's Cleric Level" },
	{ name: "DruidLevel", detail: "int", doc: "The character's Druid Level" },
	{ name: "FighterLevel", detail: "int", doc: "The character's Fighter Level" },
	{ name: "MonkLevel", detail: "int", doc: "The character's Monk Level" },
	{ name: "PaladinLevel", detail: "int", doc: "The character's Paladin Level" },
	{ name: "RangerLevel", detail: "int", doc: "The character's Ranger Level" },
	{ name: "RogueLevel", detail: "int", doc: "The character's Rogue Level" },
	{ name: "SorcererLevel", detail: "int", doc: "The character's Sorcerer Level" },
	{ name: "WarlockLevel", detail: "int", doc: "The character's Warlock Level" },
	{ name: "WizardLevel", detail: "int", doc: "The character's Wizard Level" },
	{ name: "color", detail: "str", doc: "The CSettings color for the character." },
	{ name: "description", detail: "str", doc: "Full character description." },
	{ name: "hp", detail: "int", doc: "Maximum hit points." },
	{ name: "image", detail: "str", doc: "Character image URL." },
	{ name: "level", detail: "int", doc: "Character level." },
	{ name: "name", detail: "str", doc: "The character\u2019s name." },
	{ name: "spell", detail: "int", doc: "The character\u2019s spellcasting ability mod." },
	{ name: "armor", detail: "int", doc: "Armor Class." },
];

export const automationGlobalHints = [
	{ name: "caster", detail: "AliasStatBlock", doc: "The character, combatant, or monster who is running the automation" },
	{ name: "targets", detail: "list of AliasStatBlock, str, or None", doc: "A list of combatants targeted by this automation (i.e. the -t argument)" },
	{ name: "spell_attack_bonus", detail: "int or None", doc: "The attack bonus for the spell, or the caster’s default attack bonus." },
	{ name: "spell_dc", detail: "int or None", doc: "The DC for the spell, or the caster’s default DC." },
	{ name: "spell", detail: "int or None", doc: "The casting mod for the spell, or the caster’s default casting mod." },
	{ name: "spell_level", detail: "int or None", doc: "The level used to cast the spell, or None" },
	{ name: "choice", detail: "str", doc: "The input provided by the -choice argument, always lowercase. If the arg was not used, it will be an empty string." },

];

export const exposedAutomationVariables = [
	{
		name: "target",
		detail: "AliasStatBlock",
		doc: "The current target"
	},
	{
		name: "targetIteration",
		detail: "int",
		doc: "If running multiple iterations (i.e. `-rr`), the current iteration (1-indexed)."
	},
	{
		name: "targetIndex",
		detail: "int",
		doc: "The index of the target in the list of targets processed by this effect (0-indexed - first target = `0`, second = `1`, etc.). Self targets and nth-targets (`target: \"self\"` and `target: int`) will always be 0."
	},
	{
		name: "targetNumber",
		detail: "int",
		doc: "Same as `targetIndex`, but 1-indexed (equivalent to `targetIndex + 1`)."
	},
	{
		name: "lastAttackDidHit",
		detail: "bool",
		doc: "Whether the attack hit."
	},
	{
		name: "lastAttackDidCrit",
		detail: "bool",
		doc: "If the attack hit, whether it crit."
	},
	{
		name: "lastAttackRollTotal",
		detail: "int",
		doc: "The result of the last to-hit roll (0 if no roll was made)."
	},
	{
		name: "lastAttackNaturalRoll",
		detail: "int",
		doc: "The natural roll of the last to-hit roll (e.g. 10 in 1d20 (10) + 5 = 15; 0 if no roll was made)."
	},
	{
		name: "lastAttackHadAdvantage",
		detail: "int",
		doc: "The advantage type of the last to-hit roll. `0` for flat, `1` for; Advantage, `2` for Elven Accuracy, `-1` for Disadvantage"
	},
	{
		name: "lastSaveDidPass",
		detail: "bool",
		doc: "Whether the target passed the save."
	},
	{
		name: "lastSaveDC",
		detail: "int",
		doc: "The DC of the last save roll."
	},
	{
		name: "lastSaveRollTotal",
		detail: "int",
		doc: "The result of the last save roll (0 if no roll was made)."
	},
	{
		name: "lastSaveNaturalRoll",
		detail: "int",
		doc: "The natural roll of the last save roll (e.g. `10` in `1d20 (10) + 5 = 15`; 0 if no roll was made)."
	},
	{
		name: "lastSaveAbility",
		detail: "str",
		doc: "The title-case full name of the ability the save was made with (e.g. `\"Strength\"`, `\"Wisdom\"`, etc)."
	},
	{
		name: "lastDamage",
		detail: "int",
		doc: "The amount of damage dealt."
	},
	{
		name: "lastTempHp",
		detail: "int",
		doc: "The amount of temp HP granted."
	},
	{
		name: "lastRoll",
		detail: "int",
		doc: "The total of the roll."
	},
	{
		name: "lastCounterName",
		detail: "str",
		doc: "The name of the last used counter. If it was a spell slot, the level of the slot (safe to cast to int, i.e. `int(lastCounterName)`). (`None` on error)."
	},
	{
		name: "lastCounterRemaining",
		detail: "int",
		doc: "The remaining charges of the last used counter (0 on error)."
	},
	{
		name: "lastCounterUsedAmount",
		detail: "int",
		doc: "The amount of the counter successfully used."
	},
	{
		name: "lastCounterRequestedAmount",
		detail: "int",
		doc: "The amount of the counter requested to be used (i.e. the amount specified by automation or requested by `-amt`, regardless of the presence of the `-i` arg)."
	},
	{
		name: "lastCheckRollTotal",
		detail: "int",
		doc: "The result of the last check roll (`0` if no roll was made)."
	},
	{
		name: "lastCheckNaturalRoll",
		detail: "int",
		doc: "The natural roll of the last check roll (e.g. `10` in `1d20 (10) + 5 = 15`; `0` if no roll was made)."
	},
	{
		name: "lastCheckAbility",
		detail: "str",
		doc: "The title-case full name of the rolled skill (e.g. \"Animal Handling\", \"Arcana\")."
	},
	{
		name: "lastCheckDidPass",
		detail: "bool or None",
		doc: "If a DC was given, whether the target succeeded the check. If a contest was specified, whether the target won the contest. `None` if no or contest given."
	},
	{
		name: "lastCheckDC",
		detail: "int or None",
		doc: "If a DC was given, the DC of the last save roll. `None` if no DC given."
	},
	{
		name: "lastContestRollTotal",
		detail: "int or None",
		doc: "The result of the caster's contest roll; `None` if no contest was made."
	},
	{
		name: "lastContestNaturalRoll",
		detail: "int or None",
		doc: "The natural roll of the caster's contest roll (e.g. 10 in 1d20 (10) + 5 = 15; `None` if no contest was made)."
	},
	{
		name: "lastContestAbility",
		detail: "str or None",
		doc: "The title-case full name of the skill the caster rolled (e.g. \"Animal Handling\", \"Arcana\"). `None` if no contest was made."
	},
	{
		name: "lastContestDidTie",
		detail: "bool",
		doc: "Whether a ability contest resulted in a tie."
	}
];

export const automationContextHints = [...editorHintsGlobal, ...automationGlobalHints, ...exposedAutomationVariables, ...editorHintsCharacter];
export const consumableContextHints = [...editorHintsCharacter, ...editorHintsGlobal];

export interface AliasAPIPropertyDef { name: string; type: string; doc: string }
export interface AliasAPIClassDef { properties: AliasAPIPropertyDef[] }

// class name -> its properties (a property's `type` can be a primitive like 'str'/'int',
// or another key in this same `classes` object, in which case it's "walkable")
export const AliasAPIClasses: Record<string, AliasAPIClassDef> = {
	AliasStatBlock: {
		properties: [
			{ name: "ac", type: "int or None", doc: "The armor class of the creature." },
			{ name: "attacks", type: "int or None", doc: "The attacks of the creature creature." },
			{ name: "creature_type", type: "str or None", doc: "The creature type of the creature. Will return None for players or creatures with no creature type." },

			{ name: "hp", type: "int or None", doc: "The current HP of the creature." },
			{ name: "hp_str()", type: "str", doc: "Returns a string describing the creature’s current, max, and temp HP." },

			{ name: "levels", type: "AliasLevels", doc: "The levels of the creature." },
			{ name: "max_hp", type: "int or None", doc: "The maximum HP of the creature." },
			{ name: "name", type: "str", doc: "The name of the creature." },

			{ name: "resistances", type: "AliasResistances", doc: "The resistances, immunities, and vulnerabilities of the creature." },
			{ name: "saves", type: "AliasSaves", doc: "The saves of the creature" },
			{ name: "skills", type: "AliasSkills", doc: "The skills of the creature." },
			{ name: "spellbook", type: "AliasSpellbook", doc: "The creature's spellcasting information." },
			{ name: "stats", type: "AliasBaseStats", doc: "The stats of the creature." },
			{ name: "temp_hp", type: "int", doc: "The current temp HP of the creature." },

		],
	},
	AliasLevels: {
		properties: [
			{ name: "total_level", type: "float or int", doc: "The total level." },
			{ name: "get()", type: "float or int", doc: "Gets the levels in a given class, or default if there are none." },
		],
	},
	AliasSkills: {
		properties: [
			{ name: "acrobatics", type: "AliasSkill", doc: "" },
			{ name: "animalHandling", type: "AliasSkill", doc: "" },
			{ name: "arcana", type: "AliasSkill", doc: "" },
			{ name: "athletics", type: "AliasSkill", doc: "" },
			{ name: "deception", type: "AliasSkill", doc: "" },
			{ name: "history", type: "AliasSkill", doc: "" },
			{ name: "initiative", type: "AliasSkill", doc: "" },
			{ name: "insight", type: "AliasSkill", doc: "" },
			{ name: "intimidation", type: "AliasSkill", doc: "" },
			{ name: "investigation", type: "AliasSkill", doc: "" },
			{ name: "medicine", type: "AliasSkill", doc: "" },
			{ name: "nature", type: "AliasSkill", doc: "" },
			{ name: "perception", type: "AliasSkill", doc: "" },
			{ name: "performance", type: "AliasSkill", doc: "" },
			{ name: "persuasion", type: "AliasSkill", doc: "" },
			{ name: "religion", type: "AliasSkill", doc: "" },
			{ name: "sleightOfHand", type: "AliasSkill", doc: "" },
			{ name: "stealth", type: "AliasSkill", doc: "" },
			{ name: "survival", type: "AliasSkill", doc: "" },
			{ name: "strength", type: "AliasSkill", doc: "" },
			{ name: "dexterity", type: "AliasSkill", doc: "" },
			{ name: "constitution", type: "AliasSkill", doc: "" },
			{ name: "intelligence", type: "AliasSkill", doc: "" },
			{ name: "wisdom", type: "AliasSkill", doc: "" },
			{ name: "charisma", type: "AliasSkill", doc: "" },
		]
	},
	AliasSkill: {
		properties: [
			{ name: "adv", type: "bool or None", doc: "The guaranteed advantage or disadvantage on this skill modifier. True = adv, False = dis, None = normal" },
			{ name: "bonus", type: "int", doc: "The miscellaneous bonus to the skill modifier." },
			{ name: "prof", type: "float or int", doc: "The proficiency multiplier in this skill. 0 = no proficiency, 0.5 = JoAT, 1 = proficiency, 2 = expertise." },
			{ name: "value", type: "int", doc: "The final modifier. Generally, value = (base stat mod) + (profBonus) * prof + bonus." },
			{ name: "d20", type: "function", doc: "Gets a dice string representing the roll for this skill." },
		]
	},
	AliasResistances: {
		properties: [
			{ name: "resist", type: "list[Resistance]", doc: "The resistances of the creature." },
			{ name: "immune", type: "list[Resistance]", doc: "The immunities of the creature." },
			{ name: "vuln", type: "list[Resistance]", doc: "The vulnerabilities of the creature." },
			{ name: "neutral", type: "list[Resistance]", doc: "The neutralities of the creature." },
			{ name: "is_resistant()", type: "bool", doc: "Returns True if the creature is resistant to the given damage type, False otherwise." },
			{ name: "is_immune()", type: "bool", doc: "Returns True if the creature is immune to the given damage type, False otherwise." },
			{ name: "is_vulnerable()", type: "bool", doc: "Returns True if the creature is vulnerable to the given damage type, False otherwise." },
			{ name: "is_neutral()", type: "bool", doc: "Returns True if the creature is neutral to the given damage type, False otherwise." },

		],

	},
	AliasSaves: {
		properties: [
			{ name: "str", type: "AliasSkill", doc: "" },
			{ name: "dex", type: "AliasSkill", doc: "" },
			{ name: "con", type: "AliasSkill", doc: "" },
			{ name: "int", type: "AliasSkill", doc: "" },
			{ name: "wis", type: "AliasSkill", doc: "" },
			{ name: "cha", type: "AliasSkill", doc: "" },
			{ name: "get()", type: "AliasSkill", doc: "Gets the save for a given ability." },
		]
	},
	AliasBaseStats: {
		properties: [
			{ name: "strength", type: "int", doc: "Strength score" },
			{ name: "dexterity", type: "int", doc: "Dexterity score" },
			{ name: "constitution", type: "int", doc: "Constitution score" },
			{ name: "intelligence", type: "int", doc: "Intelligence score" },
			{ name: "wisdom", type: "int", doc: "Wisdom score" },
			{ name: "charisma", type: "int", doc: "Charisma score" },
			{ name: "prof_bonus", type: "int", doc: "The proficiency bonus" },
			{ name: "get()", type: "int", doc: "Gets the integer value of a stat for a given stat." },
			{ name: "get_mod()", type: "int", doc: "Gets the modifier for a base stat stat." },
		]
	},
};

// top-level instance name -> the class it is
export const AliasAPIInstances: Record<string, string> = {
	target: "AliasStatBlock",
	caster: "AliasStatBlock",

};

export const globalLimits = {
	nameMin: 3,
	nameLength: 50,
	descriptionLength: 10000,
	creatureAmount: 1000,
	imageFormats: ["png", "jpg", "jpeg", "webp", "gif", "apng"]
};

export const bestiaryTags = [
	"Aberrations",
	"Beasts",
	"Celestials",
	"Constructs",
	"Dragons",
	"Elementals",
	"Fey",
	"Fiends",
	"Giants",
	"Humanoids",
	"Monstrosities",
	"Oozes",
	"Plants",
	"Undead",
	"Mythic",
	"Legendary"
];

export const automationCollectionTags = [
	"Item",
	"Monster",
	"5e2014",
	"5e2024",
	"Subclass",
	"Class",
	"Race",
	"Spell",
	"Feat",
	"Utility",
	"Initiative"
];

export const defaultStatblock: Statblock = {
	description: {
		name: "New Creature",
		isProperNoun: false,
		description: "",
		image: "",
		faction: "",
		environment: "",
		tag: "",
		alignment: "Unaligned",
		gear: "",
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
			sizeOfHitDie: 8,
			override: null,
		},
		ac: {
			ac: 10,
			acSource: "",
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
	core: {
		race: "Dragon (Chromatic)",
		size: "Huge",
		speed: [
			{
				name: "Walk",
				unit: "ft",
				value: 40,
				comment: ""
			},
			{
				name: "Fly",
				unit: "ft",
				value: 80,
				comment: ""
			},
			{
				name: "Climb",
				unit: "ft",
				value: 40,
				comment: ""
			}
		],
		senses: [
			{
				name: "Blindsight",
				unit: "ft",
				value: 60,
				comment: ""
			},
			{
				name: "Darkvision",
				unit: "ft",
				value: 120,
				comment: ""
			}
		],
		languages: [
			"Common",
			"Draconic"
		],
		proficiencyBonus: 6
	},
	misc: {
		telepathy: 0,
		featureHeaderTexts: {
			lair: "On initiative count 20, choose one lair action below; it can't take the same lair action two rounds in a row",
			bonus: "",
			mythic: "",
			actions: "",
			features: "",
			regional: "The region containing the creatures lair can be transformed by its presence, creating one or more of the following effects:",
			legendary: "Legendary Action Uses: $NUM$",
			reactions: ""
		},
		legActionsPerRound: 3,
		passivePerceptionOverride: null
	},
	defenses: {
		ac: {
			ac: 19,
			acSource: ""
		},
		hp: {
			override: null,
			numOfHitDie: 19,
			sizeOfHitDie: 12
		},
		immunities: [
			"Fire"
		],
		resistances: [],
		vulnerabilities: [],
		conditionImmunities: []
	},
	features: {
		lair: [],
		bonus: [],
		mythic: [],
		actions: [
			{
				name: "Multiattack",
				automation: null,
				description: "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast Scorching Ray."
			},
			{
				name: "Rend",
				automation: {
					_v: 2,
					name: "Rend",
					automation: [
						{
							text: "*Melee Attack Roll:* +14, reach 10 ft. *Hit:* 13 (1d10 + 8) Slashing damage plus 5 (2d4) Fire damage.",
							type: "text",
							title: "Effect"
						},
						{
							type: "target",
							target: "each",
							effects: [
								{
									adv: "0",
									hit: [
										{
											type: "damage",
											damage: "(1d10 + 8 [slashing]) + (2d4 [fire])"
										}
									],
									miss: [],
									type: "attack",
									attackBonus: "14"
								}
							]
						}
					],
					activation_type: 1
				},
				description: "*Melee Attack Roll:* +14, reach 10 ft. *Hit:* 13 (1d10 + 8) Slashing damage plus 5 (2d4) Fire damage."
			},
			{
				name: "Fire Breath (Recharge 5-6)",
				automation: {
					_v: 2,
					name: "Fire Breath (Recharge 5-6)",
					automation: [
						{
							text: "*Dexterity Saving Throw:* DC 21, each creature in a 60-foot Cone. *Failure:* 59 (17d6) Fire damage. *Success:* Half damage.",
							type: "text",
							title: "Effect"
						},
						{
							type: "target",
							target: "self",
							effects: [
								{
									name: "Fire Breath Used",
									type: "ieffect2",
									buttons: [
										{
											verb: "attempts to recharge their Fire Breath",
											label: "Recharge Fire Breath",
											style: "3",
											automation: [
												{
													dice: "1d6",
													name: "recharge",
													type: "roll",
													fixedValue: true
												},
												{
													type: "condition",
													onTrue: [
														{
															type: "remove_ieffect"
														},
														{
															text: "{{caster.name}} recharges their Fire Breath!",
															type: "text",
															title: "Effect"
														}
													],
													onFalse: [
														{
															text: "{{caster.name}} doesn't recharge their Fire Breath!",
															type: "text",
															title: "Effect"
														}
													],
													condition: "int(recharge) >= 5",
													errorBehaviour: "false"
												}
											]
										}
									],
									duration: -1,
									stacking: true
								}
							]
						},
						{
							dice: "17d6 [fire]",
							name: "damage",
							type: "roll"
						},
						{
							type: "target",
							target: "each",
							effects: [
								{
									dc: "21",
									fail: [
										{
											type: "damage",
											damage: "{damage}"
										}
									],
									stat: "dex",
									type: "save",
									success: [
										{
											type: "damage",
											damage: "{damage}/2"
										}
									]
								}
							]
						}
					],
					activation_type: 1
				},
				description: "*Dexterity Saving Throw:* DC 21, each creature in a 60-foot Cone. *Failure:* 59 (17d6) Fire damage. *Success:* Half damage."
			}
		],
		features: [
			{
				name: "Legendary Resistance (3/Day, or 4/Day in Lair)",
				automation: null,
				description: "If the dragon fails a saving throw, it can choose to succeed instead."
			},
			{
				name: "Pounce",
				automation: {
					_v: 2,
					name: "Pounce",
					automation: [
						{
							text: "The dragon moves up to half its Speed, and it makes one Rend attack.",
							type: "text",
							title: "Effect"
						},
						{
							type: "target",
							target: "each",
							effects: [
								{
									adv: "0",
									hit: [
										{
											type: "damage",
											damage: "(1d10 + 8 [slashing]) + (2d4 [fire])"
										}
									],
									miss: [],
									type: "attack",
									attackBonus: "14"
								}
							]
						}
					],
					activation_type: 8
				},
				description: "The dragon moves up to half its Speed, and it makes one Rend attack."
			}
		],
		regional: [],
		legendary: [
			{
				name: "Commanding Presence",
				automation: null,
				description: "The dragon uses Spellcasting to cast Command (level 2 version). The dragon can't take this action again until the start of its next turn."
			},
			{
				name: "Fiery Rays",
				automation: null,
				description: "The dragon uses Spellcasting to cast Scorching Ray. The dragon can't take this action again until the start of its next turn."
			},
			{
				name: "Pounce",
				automation: null,
				description: "The dragon moves up to half its Speed, and it makes one Rend attack."
			}
		],
		reactions: []
	},
	abilities: {
		saves: {
			cha: {
				adv: null,
				override: null,
				isProficient: false
			},
			con: {
				adv: null,
				override: null,
				isProficient: false
			},
			dex: {
				adv: null,
				override: null,
				isProficient: true
			},
			int: {
				adv: null,
				override: null,
				isProficient: false
			},
			str: {
				adv: null,
				override: null,
				isProficient: false
			},
			wis: {
				adv: null,
				override: null,
				isProficient: true
			}
		},
		stats: {
			cha: 23,
			con: 25,
			dex: 10,
			int: 16,
			str: 27,
			wis: 13
		},
		skills: [
			{
				adv: null,
				override: null,
				skillName: "Perception",
				isExpertise: true,
				isProficient: false,
				isHalfProficient: false
			},
			{
				adv: null,
				override: null,
				skillName: "Stealth",
				isExpertise: false,
				isProficient: true,
				isHalfProficient: false
			}
		]
	},
	description: {
		cr: 17,
		xp: 18000,
		name: "Adult Red Dragon",
		tag: "",
		image: "",
		faction: "",
		alignment: "Chaotic Evil",
		description: "",
		environment: "hill, mountain",
		gear: "",
		isProperNoun: false
	},
	spellcasting: {
		casterSpells: {
			spellList: [
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
			casterLevel: null,
			castingClass: null,
			spellSlotList: {},
			displayAsAction: false,
			spellDcOverride: null,
			customDescription: "",
			spellBonusOverride: null,
			spellCastingAbility: "cha",
			spellCastingAbilityOverride: null
		},
		innateSpells: {
			spellList: {
				0: [
					{
						spell: "Command",
						comment: "level 2 version"
					},
					{
						spell: "Detect Magic",
						comment: ""
					},
					{
						spell: "Scorching Ray",
						comment: ""
					}
				],
				1: [
					{
						spell: "Fireball",
						comment: ""
					}
				],
				2: [],
				3: []
			},
			isPsionics: false,
			displayAsAction: true,
			spellDcOverride: null,
			customDescription: "",
			noComponentsOfType: [
				"Material",
				"Somatic",
				"Verbal"
			],
			spellBonusOverride: null,
			spellCastingAbility: "cha"
		}
	}
};
