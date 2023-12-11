import { reactive } from "vue";

export const defaultStatblock = {
    "description": {
        "name": "Bob the Builder" as string,
        "description": "" as string,
        "image": "" as string,
        "faction": "" as string,
        "environment": "" as string,
        "alignment": "Unaligned" as string,
        "cr": 0 as number,
    } as Description,
    "core": {
        "proficiencyBonus": 2 as number,
        "race": "Humanoid" as string,
        "size": "Medium" as "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan",
        "speed": {
            "walk": 30 as number,
            "fly": 0 as number,
            "isHover": false as boolean,
            "burrow": 0 as number,
            "swim": 0 as number
        } as Speed,
        "senses": {
            "passivePerceptionOverride": 0 as number,
            "darkvision": 0 as number,
            "blindsight": 0 as number,
            "isBlind": false as boolean,
            "truesight": 0 as number,
            "tremorsense": 0 as number,
            "telepathy": 0 as number,
        } as Senses,
        "languages": [] as string[]
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
            "str": {isProficient: false as boolean, override: null as number | null},
            "dex": {isProficient: false as boolean, override: null as number | null},
            "con": {isProficient: false as boolean, override: null as number | null},
            "wis": {isProficient: false as boolean, override: null as number | null},
            "int": {isProficient: false as boolean, override: null as number | null},
            "cha": {isProficient: false as boolean, override: null as number | null},
        } as Saves,
        "skills": [] as SkillsEntity[]
    } as Abilities,
    "defenses": {
        "hp": {
            "numOfHitDie": 1 as number,
            "sizeOfHitDie": 6 as number,
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
    proficiencyBonus: number;
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
    tremorsense: number;
    telepathy: number;
  }
  export interface Abilities {
    stats: Stats;
    saves: Saves;
    skills: (SkillsEntity)[] | null;
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
    str: SaveEntity;
    dex: SaveEntity;
    con: SaveEntity;
    wis: SaveEntity;
    int: SaveEntity;
    cha: SaveEntity;
  }
  export interface SaveEntity {
    isProficient: boolean;
    override: number | null
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
    vulnerabilities?: (string)[] | null;
    resistances?: (string)[] | null;
    immunities?: (string)[] | null;
    conditionImmunities?: (string)[] | null;
  }
  export interface Hp {
    numOfHitDie: number;
    sizeOfHitDie: number;
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
    data: defaultStatblock as Statblock,
    get(): Statblock {
        return this.data;
    },
    set(newData: Statblock): void {
        this.data = newData
    },
    clear() {
        this.data = {} as Statblock
    },

    updateName(newName: string) : void {
        this.data.description.name = newName;
    },
    updateDesc(newDesc: string) : void {
        this.data.description.description = newDesc;
    },
    updateImage(newImage: string) : void {
        this.data.description.image = newImage;
    },
    updateEnv(newEnv: string) : void {
        this.data.description.environment = newEnv;
    },
    updateFaction(newFaction: string) : void {
        this.data.description.faction = newFaction;
    },
    updateCr(newCr: number) : void {
        this.data.description.cr = newCr;
    }
})