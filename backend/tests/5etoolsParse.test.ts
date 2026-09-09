import { expect, it } from "vitest";

import { parseFrom5eTools } from "../src/logic/import/5eTools";
import { StatblockChecker } from "../src/logic/external/validation";

export const data = {
    "name": "Ancient Green Dragon",
    "group": [
        "Chromatic Dragons"
    ],
    "source": "XMM",
    "page": 154,
    "srd52": true,
    "basicRules2024": true,
    "size": [
        "G"
    ],
    "type": {
        "type": "dragon",
        "tags": [
            "chromatic"
        ]
    },
    "alignment": [
        "L",
        "E"
    ],
    "ac": [
        21
    ],
    "hp": {
        "average": 402,
        "formula": "23d20 + 161"
    },
    "speed": {
        "walk": 40,
        "fly": 80,
        "swim": 40
    },
    "initiative": {
        "proficiency": 2
    },
    "str": 27,
    "dex": 12,
    "con": 25,
    "int": 20,
    "wis": 17,
    "cha": 22,
    "save": {
        "dex": "+8",
        "wis": "+10"
    },
    "skill": {
        "deception": "+13",
        "perception": "+17",
        "persuasion": "+13",
        "stealth": "+8"
    },
    "senses": [
        "Blindsight 60 ft.",
        "Darkvision 120 ft."
    ],
    "passive": 27,
    "immune": [
        "poison"
    ],
    "conditionImmune": [
        "poisoned"
    ],
    "languages": [
        "Common",
        "Draconic"
    ],
    "cr": {
        "cr": "22",
        "xpLair": 50000
    },
    "spellcasting": [
        {
            "name": "Spellcasting",
            "type": "spellcasting",
            "headerEntries": [
                "The dragon casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save {@dc 21}):"
            ],
            "will": [
                "{@spell Detect Magic|XPHB}",
                "{@spell Mind Spike|XPHB} (level 5 version)"
            ],
            "daily": {
                "1e": [
                    "{@spell Geas|XPHB}",
                    "{@spell Modify Memory|XPHB}"
                ]
            },
            "ability": "cha",
            "displayAs": "action"
        }
    ],
    "trait": [
        {
            "name": "Amphibious",
            "entries": [
                "The dragon can breathe air and water."
            ]
        },
        {
            "name": "Legendary Resistance (4/Day, or 5/Day in Lair)",
            "entries": [
                "If the dragon fails a saving throw, it can choose to succeed instead."
            ]
        }
    ],
    "action": [
        {
            "name": "Multiattack",
            "entries": [
                "The dragon makes three Rend attacks. It can replace one attack with a use of Spellcasting to cast {@spell Mind Spike|XPHB} (level 5 version)."
            ]
        },
        {
            "name": "Rend",
            "entries": [
                "{@atkr m} {@hit 15}, reach 15 ft. {@h}17 ({@damage 2d8 + 8}) Slashing damage plus 10 ({@damage 3d6}) Poison damage."
            ]
        },
        {
            "name": "Poison Breath {@recharge 5}",
            "entries": [
                "{@actSave con} {@dc 22}, each creature in a 90-foot {@variantrule Cone [Area of Effect]|XPHB|Cone}. {@actSaveFail} 77 ({@damage 22d6}) Poison damage. {@actSaveSuccess} Half damage."
            ]
        }
    ],
    "legendaryActionsLair": 4,
    "legendary": [
        {
            "name": "Mind Invasion",
            "entries": [
                "The dragon uses Spellcasting to cast {@spell Mind Spike|XPHB} (level 5 version)."
            ]
        },
        {
            "name": "Noxious Miasma",
            "entries": [
                "{@actSave con} {@dc 21}, each creature in a 30-foot-radius {@variantrule Sphere [Area of Effect]|XPHB|Sphere} centered on a point the dragon can see within 90 feet. {@actSaveFail} 17 ({@damage 5d6}) Poison damage, and the target takes a -2 penalty to AC until the end of its next turn. {@actSaveSuccessOrFail} The dragon can't take this action again until the start of its next turn."
            ]
        },
        {
            "name": "Pounce",
            "entries": [
                "The dragon moves up to half its {@variantrule Speed|XPHB}, and it makes one Rend attack."
            ]
        }
    ],
    "legendaryGroup": {
        "name": "Green Dragon",
        "source": "XMM"
    },
    "environment": [
        "forest"
    ],
    "treasure": [
        "arcana"
    ],
    "dragonAge": "ancient",
    "soundClip": {
        "type": "internal",
        "path": "bestiary/green-dragon.opus"
    },
    "traitTags": [
        "Amphibious",
        "Legendary Resistances"
    ],
    "senseTags": [
        "B",
        "SD"
    ],
    "actionTags": [
        "Breath Weapon",
        "Multiattack"
    ],
    "languageTags": [
        "C",
        "DR"
    ],
    "damageTags": [
        "I",
        "S"
    ],
    "damageTagsSpell": [
        "Y"
    ],
    "spellcastingTags": [
        "O"
    ],
    "miscTags": [
        "AOE",
        "MA",
        "RCH"
    ],
    "conditionInflictSpell": [
        "charmed",
        "incapacitated"
    ],
    "savingThrowForced": [
        "constitution"
    ],
    "savingThrowForcedLegendary": [
        "constitution"
    ],
    "savingThrowForcedSpell": [
        "wisdom"
    ],
    "hasToken": true,
    "hasFluff": true,
    "hasFluffImages": true
} as const;

it("5eTools parse output matches the Statblock schema", () => {
    const [parsed] = parseFrom5eTools(data);

    expect(StatblockChecker.test(parsed)).toBe(true);
});