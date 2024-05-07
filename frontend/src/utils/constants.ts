import type {Stat} from "~/shared";

// Generators which are used to create UI programmatically in the StatblockRender

export const stats: Stat[] = ["str", "dex", "con", "int", "wis", "cha"];

export const resistanceGenerator = {
	vulnerabilities: "Vulnerabilities ",
	resistances: "Resistances ",
	immunities: "Immunities ",
	conditionImmunities: "Condition Immunities "
} as const;

// TODO: add actions/features once spellcasting has been fixed (#20)
export const featureGenerator = {
	bonus: "Bonus Actions",
	reactions: "Reactions",
	legendary: "Legendary Actions",
	mythic: "Mythic Actions",
	lair: "Lair Actions",
	regional: "Regional Effects"
} as const;

// constants for StatblockEditor

export const newFeatureGenerator = {
	features: "New Feature",
	actions: "New Action",
	bonus: "New Bonus Action",
	reactions: "New Reaction",
	legendary: "New Legendary Action",
	lair: "New Lair Action",
	mythic: "New Mythic Action",
	regional: "New Regional Effect"
} as const;

export const resistanceList = [
	"Acid",
	"Bludgeoning",
	"Cold",
	"Fire",
	"Force",
	"Lightning",
	"Necrotic",
	"Piercing",
	"Poison",
	"Psychic",
	"Radiant",
	"Slashing",
	"Thunder",
	"Nonmagical Bludgeoning",
	"Nonmagical Piercing",
	"Nonmagical Slashing",
	"Nonmagical Nonsilvered Bludgeoning",
	"Nonmagical Nonsilvered Piercing",
	"Nonmagical Nonsilvered Slashing"
] as const;

export const conditionList = [
    "Blinded", 
    "Charmed", 
    "Deafened", 
    "Disease", 
    "Exhaustion", 
    "Frightened", 
    "Grappled", 
    "Incapacitated", 
    "Invisible", 
    "Paralyzed", 
    "Petrified", 
    "Poisoned", 
    "Prone", 
    "Restrained", 
    "Stunned", 
    "Unconscious"
] as const;

export const languages = [
	"All",
	"All languages it knew in life",
	"Abyssal",
	"Aarakocra",
	"Aquan",
	"Auran",
	"Celestial",
	"Common",
	"Deep Speech",
	"Draconic",
	"Druidic",
	"Dwarvish",
	"Elvish",
	"Giant",
	"Gith",
	"Gnomish",
	"Goblin",
	"Halfling",
	"Ignan",
	"Infernal",
	"Orc",
	"Primordial",
	"Sylvan",
	"Terran",
	"Thieves' Cant",
	"Undercommon",
	"Understands the languages of its creator but can't speak"
] as const;

export const alignments = [
	"Unaligned",
	"Good",
	"Neutral",
	"Evil",
	"Lawful Good",
	"Neutral Good",
	"Chaotic Good",
	"Lawful Neutral",
	"Neutral",
	"Chaotic Neutral",
	"Lawful Evil",
	"Neutral Evil",
	"Chaotic Evil",
	"Any Alignment",
	"Typically Good",
	"Typically Neutral",
	"Typically Evil",
	"Typically Lawful Good",
	"Typically Neutral Good",
	"Typically Chaotic Good",
	"Typically Lawful Neutral",
	"Typically Chaotic Neutral",
	"Typically Lawful Evil",
	"Typically Neutral Evil",
	"Typically Chaotic Evil"
] as const;

export const sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"] as const;

export const creatureTypes = ["Aberration", "Beast", "Celestial", "Construct", "Dragon", "Elemental", "Fey", "Fiend", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead"] as const;

export const classes = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"] as const;

export const classLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20] as const;
