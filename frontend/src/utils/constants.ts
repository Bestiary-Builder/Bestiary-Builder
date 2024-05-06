import type { Defenses, Stat } from "~/shared"

export const stats : Stat[] = [ 'str', 'dex', 'con', 'int', 'wis', 'cha'] 

export const resistanceGenerator = {
    vulnerabilities: "Vulnerabilities ",
    resistances: "Resistances ",
    immunities: "Immunities ",
    conditionImmunities: "Condition Immunities "
} as Record<'vulnerabilities' | 'resistances' | 'immunities' | 'conditionImmunities', string>