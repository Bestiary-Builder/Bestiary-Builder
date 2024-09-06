import { ObjectId as Id } from "bson";
import type { SpellSlotList, Statblock } from "./build-types";

export { ObjectId as Id } from "bson";

// Built types
export * from "./build-types";
// Database types
export class User {
	constructor(
		public username: string,
		public avatar: string,
		public email: string,
		public verified: boolean,
		public banner_color: string,
		public global_name: string,
		public bestiaries: Id[] = [],
		public bookmarks: Id[] = [],
		public supporter: 0 | 1 | 2,
		public joinedAt: number,
		public _id: string,
		public user_settings: {
			newStatblock: boolean;
		},
		public secret?: string,
	) {}
}
export class Bestiary {
	constructor(
		public name: string,
		public owner: string,
		public editors: string[],
		public status: "public" | "private" | "unlisted",
		public description: string,
		public creatures: Id[],
		public tags: string[],
		public viewCount: number,
		public bookmarks: number,
		public lastUpdated: number,
		public _id?: Id,
	) {}
}
export class Creature {
	constructor(public lastUpdated: number, public stats: Statblock, public bestiary: Id, public _id?: Id) {}
}

export class Automation {
	constructor(public name: string, public description: string, public owner: string, public lastUpdated: number, public automation: null, public _id?: Id) {}
}

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

export function stringToId(id: string): Id | null {
	if (!id)
		return null;
	if (id.length !== 24)
		return null;
	return new Id(id);
}

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
			str: { isProficient: false, override: null },
			dex: { isProficient: false, override: null },
			con: { isProficient: false, override: null },
			wis: { isProficient: false, override: null },
			int: { isProficient: false, override: null },
			cha: { isProficient: false, override: null },
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
			legendary: "The creature can take $NUM$ legendary actions, choosing from the options below. Only one legendary action can be used at a time and only at the end of another creature's turn. The creature regains spent legendary actions at the start of its turn.",
			lair: "On initiative count 20 (losing initiative ties), the creature can take one of the following lair actions; it can't take the same lair action two rounds in a row",
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

export function getSpellSlots(sClass: string | null, level: number | null): SpellSlotList | undefined {
	if (!sClass || !level)
		return {};
	if (sClass === "Warlock") {
		return {
			1: { 1: 1 },
			2: { 1: 2 },
			3: { 2: 2 },
			4: { 2: 2 },
			5: { 3: 2 },
			6: { 3: 2 },
			7: { 4: 2 },
			8: { 4: 2 },
			9: { 5: 2 },
			10: { 5: 2 },
			11: { 5: 3 },
			12: { 5: 3 },
			13: { 5: 3 },
			14: { 5: 3 },
			15: { 5: 3 },
			16: { 5: 3 },
			17: { 5: 4 },
			18: { 5: 4 },
			19: { 5: 4 },
			20: { 5: 4 },
		}[level];
	}
	else if (["Ranger", "Paladin", "Artificer"].includes(sClass)) {
		if (level === 1 && sClass === "Artificer")
			return { 1: 2 };
		return {
			1: {},
			2: { 1: 2 },
			3: { 1: 3 },
			4: { 1: 3 },
			5: { 1: 4, 2: 2 },
			6: { 1: 4, 2: 2 },
			7: { 1: 4, 2: 3 },
			8: { 1: 4, 2: 3 },
			9: { 1: 4, 2: 3, 3: 2 },
			10: { 1: 4, 2: 3, 3: 2 },
			11: { 1: 4, 2: 3, 3: 3 },
			12: { 1: 4, 2: 3, 3: 3 },
			13: { 1: 4, 2: 3, 3: 3, 4: 1 },
			14: { 1: 4, 2: 3, 3: 3, 4: 1 },
			15: { 1: 4, 2: 3, 3: 3, 4: 2 },
			16: { 1: 4, 2: 3, 3: 3, 4: 2 },
			17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
			18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
			19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
			20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
		}[level];
	}
	else {
		return {
			1: { 1: 2 },
			2: { 1: 3 },
			3: { 1: 4, 2: 2 },
			4: { 1: 4, 2: 3 },
			5: { 1: 4, 2: 3, 3: 2 },
			6: { 1: 4, 2: 3, 3: 3 },
			7: { 1: 4, 2: 3, 3: 3, 4: 1 },
			8: { 1: 4, 2: 3, 3: 3, 4: 2 },
			9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
			10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
			11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
			12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
			13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
			14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
			15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
			16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
			17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
			18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
			19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 1, 8: 1, 9: 1 },
			20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 2, 7: 2, 8: 1, 9: 1 },
		}[level];
	}
}

export const spellList = {
	0: [
		"Acid Splash",
		"Blade Ward",
		"Booming Blade",
		"Chill Touch",
		"Control Flames",
		"Create Bonfire",
		"Dancing Lights",
		"Druidcraft",
		"Eldritch Blast",
		"Encode Thoughts",
		"Fire Bolt",
		"Friends",
		"Frostbite",
		"Green-Flame Blade",
		"Guidance",
		"Gust",
		"Infestation",
		"Light",
		"Lightning Lure",
		"Mage Hand",
		"Magic Stone",
		"Mending",
		"Message",
		"Mind Sliver",
		"Minor Illusion",
		"Mold Earth",
		"Poison Spray",
		"Prestidigitation",
		"Primal Savagery",
		"Produce Flame",
		"Ray of Frost",
		"Resistance",
		"Sacred Flame",
		"Sapping Sting",
		"Shape Water",
		"Shillelagh",
		"Shocking Grasp",
		"Spare the Dying",
		"Sword Burst",
		"Thaumaturgy",
		"Thorn Whip",
		"Thunderclap",
		"Toll the Dead",
		"True Strike",
		"Vicious Mockery",
		"Word of Radiance",
	],
	1: [
		"Absorb Elements",
		"Alarm",
		"Animal Friendship",
		"Armor of Agathys",
		"Arms of Hadar",
		"Bane",
		"Beast Bond",
		"Bless",
		"Burning Hands",
		"Catapult",
		"Cause Fear",
		"Ceremony",
		"Chaos Bolt",
		"Charm Person",
		"Chromatic Orb",
		"Color Spray",
		"Command",
		"Compelled Duel",
		"Comprehend Languages",
		"Create or Destroy Water",
		"Cure Wounds",
		"Detect Evil and Good",
		"Detect Magic",
		"Detect Poison and Disease",
		"Disguise Self",
		"Dissonant Whispers",
		"Distort Value",
		"Divine Favor",
		"Earth Tremor",
		"Ensnaring Strike",
		"Entangle",
		"Expeditious Retreat",
		"Faerie Fire",
		"False Life",
		"Feather Fall",
		"Find Familiar",
		"Floating Disk",
		"Fog Cloud",
		"Frost Fingers",
		"Gift of Alacrity",
		"Goodberry",
		"Grease",
		"Guiding Bolt",
		"Hail of Thorns",
		"Healing Word",
		"Hellish Rebuke",
		"Heroism",
		"Hex",
		"Hideous Laughter",
		"Hunter's Mark",
		"Ice Knife",
		"Identify",
		"Illusory Script",
		"Inflict Wounds",
		"Jim's Magic Missile",
		"Jump",
		"Longstrider",
		"Mage Armor",
		"Magic Missile",
		"Magnify Gravity",
		"Protection from Evil and Good",
		"Purify Food and Drink",
		"Ray of Sickness",
		"Sanctuary",
		"Searing Smite",
		"Shield",
		"Shield of Faith",
		"Silent Image",
		"Silvery Barbs",
		"Sleep",
		"Snare",
		"Speak with Animals",
		"Tasha's Caustic Brew",
		"Tasha's Hideous Laughter",
		"Tenser's Floating Disk",
		"Thunderous Smite",
		"Thunderwave",
		"Unseen Servant",
		"Witch Bolt",
		"Wrathful Smite",
		"Zephyr Strike",
	],
	2: [
		"Acid Arrow",
		"Aganazzar's Scorcher",
		"Aid",
		"Air Bubble",
		"Alter Self",
		"Animal Messenger",
		"Arcane Lock",
		"Arcanist's Magic Aura",
		"Augury",
		"Barkskin",
		"Beast Sense",
		"Blindness/Deafness",
		"Blur",
		"Borrowed Knowledge",
		"Branding Smite",
		"Calm Emotions",
		"Cloud of Daggers",
		"Continual Flame",
		"Cordon of Arrows",
		"Crown of Madness",
		"Darkness",
		"Darkvision",
		"Detect Thoughts",
		"Dragon's Breath",
		"Dust Devil",
		"Earthbind",
		"Enhance Ability",
		"Enlarge/Reduce",
		"Enthrall",
		"Find Steed",
		"Find Traps",
		"Flame Blade",
		"Flaming Sphere",
		"Flock of Familiars",
		"Fortune's Favor",
		"Gentle Repose",
		"Gift of Gab",
		"Gust of Wind",
		"Healing Spirit",
		"Heat Metal",
		"Hold Person",
		"Immovable Object",
		"Invisibility",
		"Jim's Glowing Coin",
		"Kinetic Jaunt",
		"Knock",
		"Lesser Restoration",
		"Levitate",
		"Locate Animals or Plants",
		"Locate Object",
		"Magic Mouth",
		"Magic Weapon",
		"Maximilian's Earthen Grasp",
		"Melf's Acid Arrow",
		"Mind Spike",
		"Mirror Image",
		"Misty Step",
		"Moonbeam",
		"Nathair's Mischief",
		"Nystul's Magic Aura",
		"Pass without Trace",
		"Phantasmal Force",
		"Prayer of Healing",
		"Protection from Poison",
		"Pyrotechnics",
		"Ray of Enfeeblement",
		"Rime's Binding Ice",
		"Rope Trick",
		"Scorching Ray",
		"See Invisibility",
		"Shadow Blade",
		"Shatter",
		"Silence",
		"Skywrite",
		"Snilloc's Snowball Swarm",
		"Spider Climb",
		"Spike Growth",
		"Spiritual Weapon",
		"Spray of Cards",
		"Suggestion",
		"Summon Beast",
		"Tasha's Mind Whip",
		"Vortex Warp",
		"Warding Bond",
		"Warding Wind",
		"Warp Sense",
		"Web",
		"Wither and Bloom",
		"Wristpocket",
		"Zone of Truth",
	],
	3: [
		"Animate Dead",
		"Antagonize",
		"Ashardalon's Stride",
		"Aura of Vitality",
		"Beacon of Hope",
		"Bestow Curse",
		"Blinding Smite",
		"Blink",
		"Call Lightning",
		"Catnap",
		"Clairvoyance",
		"Conjure Animals",
		"Conjure Barrage",
		"Counterspell",
		"Create Food and Water",
		"Crusader's Mantle",
		"Daylight",
		"Dispel Magic",
		"Elemental Weapon",
		"Enemies Abound",
		"Erupting Earth",
		"Fast Friends",
		"Fear",
		"Feign Death",
		"Fireball",
		"Flame Arrows",
		"Fly",
		"Freedom of the Waves",
		"Galder's Tower",
		"Gaseous Form",
		"Glyph of Warding",
		"Haste",
		"Hunger of Hadar",
		"Hypnotic Pattern",
		"Incite Greed",
		"Intellect Fortress",
		"Leomund's Tiny Hut",
		"Life Transference",
		"Lightning Arrow",
		"Lightning Bolt",
		"Magic Circle",
		"Major Image",
		"Mass Healing Word",
		"Meld into Stone",
		"Melf's Minute Meteors",
		"Motivational Speech",
		"Nondetection",
		"Phantom Steed",
		"Plant Growth",
		"Protection from Energy",
		"Pulse Wave",
		"Remove Curse",
		"Revivify",
		"Sending",
		"Sleet Storm",
		"Slow",
		"Speak with Dead",
		"Speak with Plants",
		"Spirit Guardians",
		"Spirit Shroud",
		"Stinking Cloud",
		"Summon Fey",
		"Summon Lesser Demons",
		"Summon Shadowspawn",
		"Summon Undead",
		"Thunder Step",
		"Tidal Wave",
		"Tiny Hut",
		"Tiny Servant",
		"Tongues",
		"Vampiric Touch",
		"Wall of Sand",
		"Wall of Water",
		"Water Breathing",
		"Water Walk",
		"Wind Wall",
	],
	4: [
		"Arcane Eye",
		"Aura of Life",
		"Aura of Purity",
		"Banishment",
		"Black Tentacles",
		"Blight",
		"Charm Monster",
		"Compulsion",
		"Confusion",
		"Conjure Minor Elementals",
		"Conjure Woodland Beings",
		"Control Water",
		"Death Ward",
		"Dimension Door",
		"Divination",
		"Dominate Beast",
		"Elemental Bane",
		"Evard's Black Tentacles",
		"Fabricate",
		"Faithful Hound",
		"Find Greater Steed",
		"Fire Shield",
		"Freedom of Movement",
		"Galder's Speedy Courier",
		"Gate Seal",
		"Giant Insect",
		"Grasping Vine",
		"Gravity Sinkhole",
		"Greater Invisibility",
		"Guardian of Faith",
		"Guardian of Nature",
		"Hallucinatory Terrain",
		"Ice Storm",
		"Leomund's Secret Chest",
		"Locate Creature",
		"Mordenkainen's Faithful Hound",
		"Mordenkainen's Private Sanctum",
		"Otiluke's Resilient Sphere",
		"Phantasmal Killer",
		"Polymorph",
		"Private Sanctum",
		"Raulothim's Psychic Lance",
		"Resilient Sphere",
		"Secret Chest",
		"Shadow of Moil",
		"Sickening Radiance",
		"Spirit of Death",
		"Staggering Smite",
		"Stone Shape",
		"Stoneskin",
		"Storm Sphere",
		"Summon Aberration",
		"Summon Construct",
		"Summon Elemental",
		"Summon Greater Demon",
		"Vitriolic Sphere",
		"Wall of Fire",
		"Watery Sphere",
	],
	5: [
		"Animate Objects",
		"Antilife Shell",
		"Arcane Hand",
		"Awaken",
		"Banishing Smite",
		"Bigby's Hand",
		"Circle of Power",
		"Cloudkill",
		"Commune",
		"Commune with Nature",
		"Cone of Cold",
		"Conjure Elemental",
		"Conjure Volley",
		"Contact Other Plane",
		"Contagion",
		"Control Winds",
		"Create Spelljamming Helm",
		"Creation",
		"Danse Macabre",
		"Dawn",
		"Destructive Wave",
		"Dispel Evil and Good",
		"Dominate Person",
		"Dream",
		"Enervation",
		"Far Step",
		"Flame Strike",
		"Freedom of the Winds",
		"Geas",
		"Greater Restoration",
		"Hallow",
		"Hold Monster",
		"Holy Weapon",
		"Immolation",
		"Infernal Calling",
		"Insect Plague",
		"Legend Lore",
		"Maelstrom",
		"Mass Cure Wounds",
		"Mislead",
		"Modify Memory",
		"Negative Energy Flood",
		"Passwall",
		"Planar Binding",
		"Raise Dead",
		"Rary's Telepathic Bond",
		"Reincarnate",
		"Scrying",
		"Seeming",
		"Skill Empowerment",
		"Steel Wind Strike",
		"Summon Celestial",
		"Summon Draconic Spirit",
		"Swift Quiver",
		"Synaptic Static",
		"Telekinesis",
		"Telepathic Bond",
		"Teleportation Circle",
		"Temporal Shunt",
		"Transmute Rock",
		"Tree Stride",
		"Wall of Force",
		"Wall of Light",
		"Wall of Stone",
		"Wrath of Nature",
	],
	6: [
		"Arcane Gate",
		"Blade Barrier",
		"Bones of the Earth",
		"Chain Lightning",
		"Circle of Death",
		"Conjure Fey",
		"Contingency",
		"Create Homunculus",
		"Create Undead",
		"Disintegrate",
		"Drawmij's Instant Summons",
		"Druid Grove",
		"Eyebite",
		"Find the Path",
		"Fizban's Platinum Shield",
		"Flesh to Stone",
		"Forbiddance",
		"Freezing Sphere",
		"Globe of Invulnerability",
		"Gravity Fissure",
		"Guards and Wards",
		"Harm",
		"Heal",
		"Heroes' Feast",
		"Instant Summons",
		"Investiture of Flame",
		"Investiture of Ice",
		"Investiture of Stone",
		"Investiture of Wind",
		"Magic Jar",
		"Mass Suggestion",
		"Mental Prison",
		"Move Earth",
		"Otiluke's Freezing Sphere",
		"Otto's Irresistible Dance",
		"Planar Ally",
		"Primordial Ward",
		"Programmed Illusion",
		"Scatter",
		"Soul Cage",
		"Summon Fiend",
		"Sunbeam",
		"Tasha's Otherworldly Guise",
		"Tenser's Transformation",
		"Transport via Plants",
		"True Seeing",
		"Wall of Ice",
		"Wall of Thorns",
		"Wind Walk",
		"Word of Recall",
	],
	7: [
		"Conjure Celestial",
		"Create Magen",
		"Crown of Stars",
		"Delayed Blast Fireball",
		"Divine Word",
		"Draconic Transformation",
		"Dream of the Blue Veil",
		"Etherealness",
		"Finger of Death",
		"Fire Storm",
		"Forcecage",
		"Magnificent Mansion",
		"Mirage Arcane",
		"Mordenkainen's Magnificent Mansion",
		"Mordenkainen's Sword",
		"Plane Shift",
		"Power Word Pain",
		"Prismatic Spray",
		"Project Image",
		"Regenerate",
		"Resurrection",
		"Reverse Gravity",
		"Sequester",
		"Simulacrum",
		"Symbol",
		"Teleport",
		"Temple of the Gods",
		"Tether Essence",
		"Whirlwind",
	],
	8: [
		"Abi-Dalzim's Horrid Wilting",
		"Animal Shapes",
		"Antimagic Field",
		"Antipathy/Sympathy",
		"Clone",
		"Control Weather",
		"Dark Star",
		"Demiplane",
		"Dominate Monster",
		"Earthquake",
		"Feeblemind",
		"Glibness",
		"Holy Aura",
		"Illusory Dragon",
		"Incendiary Cloud",
		"Maddening Darkness",
		"Maze",
		"Mighty Fortress",
		"Mind Blank",
		"Power Word Stun",
		"Reality Break",
		"Sunburst",
		"Telepathy",
		"Tsunami",
	],
	9: [
		"Astral Projection",
		"Blade of Disaster",
		"Foresight",
		"Gate",
		"Imprisonment",
		"Invulnerability",
		"Mass Heal",
		"Mass Polymorph",
		"Meteor Swarm",
		"Power Word Heal",
		"Power Word Kill",
		"Prismatic Wall",
		"Psychic Scream",
		"Ravenous Void",
		"Shapechange",
		"Storm of Vengeance",
		"Time Ravage",
		"Time Stop",
		"True Polymorph",
		"True Resurrection",
		"Weird",
		"Wish",
	],
};

let spellListFlattenedTemp: string[] = [];
for (const list of Object.values(spellList))
	spellListFlattenedTemp = spellListFlattenedTemp.concat(list);
spellListFlattenedTemp.sort();
export const spellListFlattened = [...spellListFlattenedTemp];

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
};

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
	ability: string | string[];
	contestAbility?: string | string[];
	dc?: IntExpression;
	success?: Effect[];
	fail?: Effect[];
	contestTie?: "fail" | "success" | "neither";
	adv?: -1 | 0 | 1;
}
