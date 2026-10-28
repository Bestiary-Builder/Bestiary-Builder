import type { AutomationConsumables, AutomationModel, Statblock } from "~/shared";
import { describe, expect, it } from "vitest";

import SRDAttacks2014_ from "@/staticData/2014/SRDAttacks2014.json";
import SRDCreatures2014_ from "@/staticData/2014/SRDCreatures2014.json";
import SRDAttacks2024_ from "@/staticData/2024/SRDAttacks2024.json";
import SRDCreatures2024_ from "@/staticData/2024/SRDCreatures2024.json";

import { defaultStatblock, validateAutomationConsumables, validateAutomationModel, validateStatblock } from "~/shared";

const SRDAttacks2014 = SRDAttacks2014_ as Record<string, { automation: unknown }>;
const SRDCreatures2014 = SRDCreatures2014_ as Record<string, unknown>;
const SRDAttacks2024 = SRDAttacks2024_ as Record<string, { automation: unknown }>;
const SRDCreatures2024 = SRDCreatures2024_ as Record<string, unknown>;

// Statblock validation
describe("validate statblocks", () => {
	function expectValidStatblock(statblock: unknown) {
		const result = validateStatblock(statblock);
		const errors = result.success ? "[]" : JSON.stringify(result.errors, null, 2);

		expect(result.success, `Statblock validation failed:\n${errors}`).toBe(true);
	}

	it("default statblock", () => {
		expectValidStatblock(defaultStatblock);
	});

	// SRD Creatures 2014 examples
	for (const name of ["Aarakocra", "Aboleth", "Ankheg", "Goblin", "Wolf"]) {
		it(name.toLowerCase(), () => {
			expectValidStatblock(SRDCreatures2014[name]);
		});
	}

	// SRD Creatures 2024 examples
	for (const name of ["Aboleth", "Ape", "Gargoyle", "Owlbear", "Wolf"]) {
		it(name.toLowerCase(), () => {
			expectValidStatblock(SRDCreatures2024[name]);
		});
	}

	// Some simple invalid examples:
	it("fails on null", () => {
		expect(validateStatblock(null).success).toBe(false);
	});
	it("fails on undefined", () => {
		expect(validateStatblock(undefined).success).toBe(false);
	});
	it("fails on simple empty object", () => {
		const statblock = {} as Statblock;
		expect(validateStatblock(statblock).success).toBe(false);
	});
	it("fails on invalid statblock", () => {
		const statblock = {
			...defaultStatblock,
			description: "not a description object",
		} as unknown as Statblock;
		expect(validateStatblock(statblock).success).toBe(false);
	});

	// Some complex invalid examples:
	it("fails on complex invalid statblock 1", () => {
		const statblock = {
			...defaultStatblock,
			abilities: {
				...defaultStatblock.abilities,
				stats: {
					...defaultStatblock.abilities.stats,
					str: "20",
				},
			},
		} as unknown as Statblock;
		expect(validateStatblock(statblock).success).toBe(false);
	});
	it("fails on complex invalid statblock 2", () => {
		const statblock = {
			...defaultStatblock,
			spellcasting: {
				...defaultStatblock.spellcasting,
				casterSpells: {
					...defaultStatblock.spellcasting.casterSpells,
					castingClass: "Fighter",
				},
			},
		} as unknown as Statblock;
		expect(validateStatblock(statblock).success).toBe(false);
	});
});

// Automation validation
describe("validate automations", () => {
	function expectValidAutomation(automation: unknown) {
		const result = validateAutomationModel(automation);
		const errors = result.success ? "[]" : JSON.stringify(result.errors, null, 2);

		expect(result.success, `Automation validation failed:\n${errors}`).toBe(true);
	}

	// SRD Attacks 2014 examples
	for (const name of [
		"Acolyte - Club",
		"Abominable Yeti - Cold Breath",
		"Adult Black Dragon - Bite",
		"Adult Blue Dragon - Lightning Breath",
		"Adult Brass Dragon - Sleep Breath",
	]) {
		it(name.toLowerCase(), () => {
			expectValidAutomation(SRDAttacks2014[name].automation);
		});
	}

	// SRD Attacks 2024 examples
	for (const name of [
		"Air Elemental - Thunderous Slam",
		"Adult Black Dragon - Rend",
		"Adult Blue Dragon - Lightning Breath (Recharge 5-6)",
		"Adult Brass Dragon - Sleep Breath",
		"Adult Gold Dragon - Banish",
	]) {
		it(name.toLowerCase(), () => {
			expectValidAutomation(SRDAttacks2024[name].automation);
		});
	}

	// Some simple valid examples
	it("null is valid", () => {
		expectValidAutomation(null);
	});
	it("empty array is valid", () => {
		expectValidAutomation([]);
	});

	// Some simple invalid examples:
	it("fails on undefined", () => {
		expect(validateAutomationModel(undefined).success).toBe(false);
	});
	it("fails on empty object", () => {
		const automation = {} as AutomationModel;
		expect(validateAutomationModel(automation).success).toBe(false);
	});
	it("fails on simple invalid automation", () => {
		const automation = "not an automation model" as unknown as AutomationModel;
		expect(validateAutomationModel(automation).success).toBe(false);
	});

	// Some complex invalid examples:
	it("fails on complex invalid automation 1", () => {
		const automation = {
			_v: 2,
			name: "Invalid target",
			automation: [
				{
					type: "target",
					target: "nearest",
					effects: [],
				},
			],
		} as unknown as AutomationModel;
		expect(validateAutomationModel(automation).success).toBe(false);
	});
	it("fails on complex invalid automation 2", () => {
		const automation = {
			_v: 2,
			name: "Invalid nested save",
			automation: [
				{
					type: "target",
					target: "each",
					effects: [
						{
							type: "save",
							stat: "dex",
							fail: [],
							success: { type: "text", text: "Saved" },
						},
					],
				},
			],
		} as unknown as AutomationModel;
		expect(validateAutomationModel(automation).success).toBe(false);
	});
});

// Automation consumables validation
describe("validate automation consumables", () => {
	const validConsumable: AutomationConsumables[number] = {
		name: "Breath Weapon",
		minv: "0",
		maxv: "proficiencyBonus",
		display_type: "bubble",
		reset: "long",
		reset_to: "max",
		reset_by: null,
		title: "Breath Weapon Uses",
		desc: "Expended when the breath weapon is used.",
		value: 1,
		ddb_source_feature_id: null,
		ddb_source_feature_type: null,
		live_id: null,
	};

	function expectValidAutomationConsumables(consumables: unknown) {
		const result = validateAutomationConsumables(consumables);
		const errors = result.success ? "[]" : JSON.stringify(result.errors, null, 2);

		expect(result.success, `Automation consumables validation failed:\n${errors}`).toBe(true);
	}

	// Some valid examples
	it("empty array is valid", () => {
		expectValidAutomationConsumables([]);
	});
	it("single consumable is valid", () => {
		expectValidAutomationConsumables([validConsumable]);
	});
	it("multiple consumables are valid", () => {
		const consumables: AutomationConsumables = [
			validConsumable,
			{
				...validConsumable,
				name: "Legendary Resistance",
				maxv: "3",
				display_type: "hex",
				reset: "long",
				value: 3,
			},
		];

		expectValidAutomationConsumables(consumables);
	});

	// Some simple invalid examples
	it("fails on null", () => {
		expect(validateAutomationConsumables(null).success).toBe(false);
	});
	it("fails on undefined", () => {
		expect(validateAutomationConsumables(undefined).success).toBe(false);
	});
	it("fails on empty object", () => {
		const consumables = {} as AutomationConsumables;
		expect(validateAutomationConsumables(consumables).success).toBe(false);
	});

	// Some complex invalid examples
	it("fails on invalid nested display type", () => {
		const consumables = [
			{
				...validConsumable,
				display_type: "circle",
			},
		] as unknown as AutomationConsumables;

		expect(validateAutomationConsumables(consumables).success).toBe(false);
	});
	it("fails on invalid value in second consumable", () => {
		const consumables = [
			validConsumable,
			{
				...validConsumable,
				name: "Legendary Resistance",
				value: "3",
			},
		] as unknown as AutomationConsumables;

		expect(validateAutomationConsumables(consumables).success).toBe(false);
	});
});
