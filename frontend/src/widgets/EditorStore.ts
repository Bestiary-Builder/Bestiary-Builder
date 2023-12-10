import { reactive } from "vue";

const format = {
    "description": {
        "name": "" as string,
        "description": "" as string,
        "image": "" as string,
        "faction": "" as string,
        "environment": "" as string,
        "alignment": "" as string,
        "cr": 0 as number,
    } as Description,
    "core": {
        "race": "" as string,
        "size": "Medium" as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
        "speed": {
            "walk": 30 as number,
            "fly": 0 as number,
            "isHover": false as boolean,
            "burrow": 0 as number,
            "swim": 0 as number
        } as Speed,
        "senses": {
            "passivePerceptionOverride": 10 as number,
            "darkvision": 0 as number,
            "blindsight": 0 as number,
            "isBlind": false as boolean,
            "truesight": 0 as number,
        } as Senses,
        "languages": ["Common"] as string[]
    } as Core,
    "abilities": {
        "stats": {
            "str": 10 as number,
            "dex": 10 as number,
            "con": 10 as number,
            "wis": 10 as number,
            "int": 10 as number,
            "cha": 10 as number,
        } as Stats,
        "saves": {
            "str": false as boolean,
            "dex": false as boolean,
            "con": false as boolean,
            "wis": false as boolean,
            "int": false as boolean,
            "cha": false as boolean,
        } as Saves,
        "skills": [
            {
                "skillName": "" as string, 
                "isHalfProficient": false as boolean,
                "isProficient": false as boolean,
                "isExpertise": false as boolean,
                "override": false as boolean | number
            } as SkillsEntity
        ]
    } as Abilities,
    "defenses": {
        "hp": {
            "numOfHitDie": 1 as number,
            "sizeOfHitDie": 6 as number,
            "calculatedTotal": 0 as number, // ((size +1)/2+conMod)*num
            "override": false as boolean | number
        } as Hp,
        "ac": {
            "ac": 10 as number,
            "acSource": "natural armor" as string
        } as Ac,
        "vulnerabilities": [] as string[],
        "resistances": [] as string[],
        "immunities": [] as string[],
        "conditionImmunities": [] as string[]
    } as Defenses,
    // TODO
    "features": {} as Features
} as Statblock

export interface Statblock {
    description: Description;
    core: Core;
    abilities: Abilities;
    defenses: Defenses;
    features: Features;
  }
  export interface Description {
    name: string;
    description: string;
    image: string;
    faction: string;
    environment: string;
    alignment: string;
    cr: number;
  }
  export interface Core {
    race: string;
    size: string;
    speed: Speed;
    senses: Senses;
    languages?: (string)[] | null;
  }
  export interface Speed {
    walk: number;
    fly: number;
    isHover: boolean;
    burrow: number;
    swim: number;
  }
  export interface Senses {
    passivePerceptionOverride: number;
    darkvision: number;
    blindsight: number;
    isBlind: boolean;
    truesight: number;
  }
  export interface Abilities {
    stats: Stats;
    saves: Saves;
    skills?: (SkillsEntity)[] | null;
  }
  export interface Stats {
    str: number;
    dex: number;
    con: number;
    wis: number;
    int: number;
    cha: number;
  }
  export interface Saves {
    str: boolean;
    dex: boolean;
    con: boolean;
    wis: boolean;
    int: boolean;
    cha: boolean;
  }
  export interface SkillsEntity {
    skillName: string;
    isHalfProficient: boolean;
    isProficient: boolean;
    isExpertise: boolean;
    override: boolean;
  }
  export interface Defenses {
    hp: Hp;
    ac: Ac;
    vulnerabilities?: (string)[] | null;
    resistances?: (string)[] | null;
    immunities?: (string)[] | null;
    conditionImmunities?: (string)[] | null;
  }
  export interface Hp {
    numOfHitDie: number;
    sizeOfHitDie: number;
    calculatedTotal: number;
    override: boolean;
  }
  export interface Ac {
    ac: number;
    acSource: string;
  }
  export interface Features {
  }
  
// TODO: add typing
export const StatblockValues = reactive({
    data: {} as Statblock,
    get(): Statblock {
        return this.data;
    },
    set(newData: Statblock): void {
        this.data = newData
    },
    clear() {
        this.data = {} as Statblock
    }
})