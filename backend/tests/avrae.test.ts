import { expect, it } from "vitest";
import { getCreatureData } from "@/logic/export/avrae";
import { defaultStatblock } from "~/shared";

it("default statblock to be equal to snapshot", () => {
	const result = getCreatureData(defaultStatblock);
	expect(result).toMatchSnapshot();
});

it("injects spellcasting into copied feature arrays", () => {
	const creature = structuredClone(defaultStatblock);
	const innateSpells = creature.spellcasting.innateSpells;
	innateSpells.spellCastingAbility = "cha";
	innateSpells.spellList[0] = [{ spell: "Invisibility", comment: "" }];
	innateSpells.displayAsAction = true;
	const casterSpells = creature.spellcasting.casterSpells;
	casterSpells.casterLevel = 1;
	casterSpells.castingClass = "Wizard";
	casterSpells.spellCastingAbility = "int";
	casterSpells.spellSlotList = { 1: 2 };
	casterSpells.spellList[0] = ["Zeta", "Alpha"];

	const result = getCreatureData(creature);

	expect(result.traits).not.toBe(creature.features.features);
	expect(result.actions).not.toBe(creature.features.actions);
	expect(result.traits).toEqual([expect.objectContaining({ name: "Spellcasting" })]);
	expect(result.actions).toEqual([expect.objectContaining({ name: "Innate Spellcasting" })]);
	expect(creature.features.features).toEqual([]);
	expect(creature.features.actions).toEqual([]);
	expect(casterSpells.spellList[0]).toEqual(["Zeta", "Alpha"]);
});
