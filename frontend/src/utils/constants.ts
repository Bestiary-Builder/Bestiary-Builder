import type { Stat } from "~/shared"

// Generators which are used to create UI programmatically in the StatblockRender

export const stats : Stat[] = [ 'str', 'dex', 'con', 'int', 'wis', 'cha'] 

export const resistanceGenerator = {
    vulnerabilities: "Vulnerabilities ",
    resistances: "Resistances ",
    immunities: "Immunities ",
    conditionImmunities: "Condition Immunities "
} as const

// TODO: add actions/features once spellcasting has been fixed (#20)
export const featureGenerator = {
    bonus: "Bonus Actions",
    reactions: "Reactions",
    legendary: "Legendary Actions",
    mythic: "Mythic Actions",
    lair: "Lair Actions",
    regional: "Regional Effects"
} as const