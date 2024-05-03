"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpellSlotEntity = exports.InnateSpellsEntity = exports.InnateSpellsList = exports.CasterSpells = exports.InnateSpells = exports.SpellCasting = exports.FeatureEntity = exports.Features = exports.Ac = exports.Hp = exports.Defenses = exports.SkillsEntity = exports.SaveEntity = exports.Saves = exports.Stats = exports.Abilities = exports.SenseEntity = exports.SpeedEntity = exports.Unit = exports.Speed = exports.Core = exports.Description = exports.FeatureHeaderTexts = exports.Misc = exports.Statblock = exports.Stat = exports.SearchOptions = void 0;
/**
 * This module was automatically generated by `ts-interface-builder`
 */
var t = require("ts-interface-checker");
// tslint:disable:object-literal-key-quotes
exports.SearchOptions = t.iface([], {
    "search": "string",
    "page": "number",
    "mode": t.union(t.lit("popular"), t.lit("recent")),
    "tags": t.array("string"),
});
exports.Stat = t.union(t.lit("str"), t.lit("dex"), t.lit("con"), t.lit("int"), t.lit("cha"), t.lit("wis"));
exports.Statblock = t.iface([], {
    "description": "Description",
    "core": "Core",
    "abilities": "Abilities",
    "defenses": "Defenses",
    "features": "Features",
    "spellcasting": "SpellCasting",
    "misc": "Misc",
});
exports.Misc = t.iface([], {
    "legActionsPerRound": "number",
    "telepathy": "number",
    "passivePerceptionOverride": t.union("number", "null"),
    "featureHeaderTexts": "FeatureHeaderTexts",
});
exports.FeatureHeaderTexts = t.iface([], {
    "features": "string",
    "actions": "string",
    "bonus": "string",
    "reactions": "string",
    "legendary": "string",
    "lair": "string",
    "mythic": "string",
    "regional": "string",
});
exports.Description = t.iface([], {
    "name": "string",
    "isProperNoun": "boolean",
    "description": "string",
    "image": "string",
    "faction": "string",
    "environment": "string",
    "alignment": "string",
    "cr": "number",
    "xp": "number",
});
exports.Core = t.iface([], {
    "proficiencyBonus": "number",
    "race": "string",
    "size": "string",
    "speed": t.array("SpeedEntity"),
    "senses": t.array("SenseEntity"),
    "languages": t.union(t.array("string"), "null"),
});
exports.Speed = t.iface([], {
    "walk": "number",
    "fly": "number",
    "isHover": "boolean",
    "burrow": "number",
    "swim": "number",
    "climb": "number",
});
exports.Unit = t.union(t.lit("ft"), t.lit("m"), t.lit("km"), t.lit("mi"), t.lit("none"));
exports.SpeedEntity = t.iface([], {
    "name": "string",
    "value": "number",
    "unit": "Unit",
    "comment": "string",
});
exports.SenseEntity = t.iface([], {
    "name": "string",
    "value": "number",
    "unit": "Unit",
    "comment": "string",
});
exports.Abilities = t.iface([], {
    "stats": "Stats",
    "saves": "Saves",
    "skills": t.array("SkillsEntity"),
});
exports.Stats = t.iface([], {
    "str": "number",
    "dex": "number",
    "con": "number",
    "int": "number",
    "cha": "number",
    "wis": "number",
});
exports.Saves = t.iface([], {
    "str": "SaveEntity",
    "dex": "SaveEntity",
    "con": "SaveEntity",
    "int": "SaveEntity",
    "cha": "SaveEntity",
    "wis": "SaveEntity",
});
exports.SaveEntity = t.iface([], {
    "isProficient": "boolean",
    "override": t.union("number", "null"),
});
exports.SkillsEntity = t.iface([], {
    "skillName": "string",
    "isHalfProficient": "boolean",
    "isProficient": "boolean",
    "isExpertise": "boolean",
    "override": t.union("number", "null"),
});
exports.Defenses = t.iface([], {
    "hp": "Hp",
    "ac": "Ac",
    "vulnerabilities": t.array("string"),
    "resistances": t.array("string"),
    "immunities": t.array("string"),
    "conditionImmunities": t.array("string"),
});
exports.Hp = t.iface([], {
    "numOfHitDie": "number",
    "sizeOfHitDie": "number",
    "override": t.union("number", "null"),
});
exports.Ac = t.iface([], {
    "ac": "number",
    "acSource": "string",
});
exports.Features = t.iface([], {
    "features": t.array("FeatureEntity"),
    "actions": t.array("FeatureEntity"),
    "bonus": t.array("FeatureEntity"),
    "reactions": t.array("FeatureEntity"),
    "legendary": t.array("FeatureEntity"),
    "mythic": t.array("FeatureEntity"),
    "lair": t.array("FeatureEntity"),
    "regional": t.array("FeatureEntity"),
});
exports.FeatureEntity = t.iface([], {
    "name": "string",
    "description": "string",
    "automation": t.union("null", "object", t.array("object")),
});
exports.SpellCasting = t.iface([], {
    "innateSpells": "InnateSpells",
    "casterSpells": "CasterSpells",
});
exports.InnateSpells = t.iface([], {
    "spellList": "InnateSpellsList",
    "spellDcOverride": t.union("null", "number"),
    "spellBonusOverride": t.union("null", "number"),
    "spellCastingAbility": t.union("Stat", "null"),
    "noComponentsOfType": t.array("string"),
    "isPsionics": "boolean",
    "displayAsAction": "boolean",
});
exports.CasterSpells = t.iface([], {
    "casterLevel": t.union("number", "null"),
    "castingClass": t.union(t.lit("Wizard"), t.lit("Druid"), t.lit("Cleric"), t.lit("Bard"), t.lit("Sorcerer"), t.lit("Paladin"), t.lit("Ranger"), t.lit("Artificer"), t.lit("Warlock"), "null"),
    "spellList": t.array(t.array("string")),
    "spellSlotList": t.union("SpellSlotEntity", "undefined"),
    "spellDcOverride": t.union("null", "number"),
    "spellBonusOverride": t.union("null", "number"),
    "spellCastingAbility": t.union("Stat", "null"),
    "spellCastingAbilityOverride": t.union("Stat", "null"),
    "displayAsAction": "boolean",
});
exports.InnateSpellsList = t.iface([], (_a = {},
    _a[t.indexKey] = t.array("InnateSpellsEntity"),
    _a));
exports.InnateSpellsEntity = t.iface([], {
    "spell": "string",
    "comment": "string",
});
exports.SpellSlotEntity = t.iface([], (_b = {},
    _b[t.indexKey] = "number",
    _b));
var exportedTypeSuite = {
    SearchOptions: exports.SearchOptions,
    Stat: exports.Stat,
    Statblock: exports.Statblock,
    Misc: exports.Misc,
    FeatureHeaderTexts: exports.FeatureHeaderTexts,
    Description: exports.Description,
    Core: exports.Core,
    Speed: exports.Speed,
    Unit: exports.Unit,
    SpeedEntity: exports.SpeedEntity,
    SenseEntity: exports.SenseEntity,
    Abilities: exports.Abilities,
    Stats: exports.Stats,
    Saves: exports.Saves,
    SaveEntity: exports.SaveEntity,
    SkillsEntity: exports.SkillsEntity,
    Defenses: exports.Defenses,
    Hp: exports.Hp,
    Ac: exports.Ac,
    Features: exports.Features,
    FeatureEntity: exports.FeatureEntity,
    SpellCasting: exports.SpellCasting,
    InnateSpells: exports.InnateSpells,
    CasterSpells: exports.CasterSpells,
    InnateSpellsList: exports.InnateSpellsList,
    InnateSpellsEntity: exports.InnateSpellsEntity,
    SpellSlotEntity: exports.SpellSlotEntity,
};
exports.default = exportedTypeSuite;
