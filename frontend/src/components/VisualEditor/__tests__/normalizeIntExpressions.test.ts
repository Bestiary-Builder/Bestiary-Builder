import type { AttackModel } from "~/shared";
import { describe, expect, it } from "vitest";
import { normalizeIntExpressions } from "../normalizeIntExpressions";

describe("normalizeIntExpressions", () => {
	it("stringifies IntExpressions without changing other numeric attack fields", () => {
		const attack: AttackModel = {
			_v: 2,
			name: "Imported attack",
			criton: 19,
			activation_type: 1,
			automation: [{
				type: "target",
				target: 2,
				effects: [
					{
						type: "attack",
						attackBonus: 7,
						adv: 1,
						hit: [],
						miss: [],
					},
					{
						type: "save",
						stat: "dex",
						dc: 15,
						adv: 1,
						fail: [],
						success: [],
					},
					{
						type: "check",
						ability: ["athletics"],
						dc: 14,
						adv: -1,
						fail: [],
						success: [],
					},
					{
						type: "variable",
						name: "roll",
						value: 3,
						onError: 0,
						higher: { 2: 4 },
					},
					{
						type: "counter",
						counter: { slot: 2 },
						amount: 1,
					},
					{
						type: "spell",
						id: 2102,
						level: 3,
						dc: 16,
						attackBonus: 8,
						castingMod: 5,
					},
					{
						type: "ieffect2",
						name: "Effect",
						duration: 2,
						effects: {
							attack_advantage: 1,
							ac_bonus: 2,
						},
						buttons: [{
							label: "Button",
							style: 3,
							defaultDC: 14,
							defaultAttackBonus: 6,
							defaultCastingMod: 4,
							automation: [{
								type: "condition",
								condition: 1,
								onTrue: [],
								onFalse: [],
							}],
						}],
					},
				],
			}],
		};

		normalizeIntExpressions(attack);

		expect(attack).toMatchObject({
			criton: 19,
			activation_type: 1,
			automation: [{
				target: 2,
				effects: [
					{ attackBonus: "7", adv: "1" },
					{ dc: "15", adv: 1 },
					{ dc: "14", adv: -1 },
					{ value: "3", onError: "0", higher: { 2: "4" } },
					{ counter: { slot: "2" }, amount: "1" },
					{ id: 2102, level: 3, dc: "16", attackBonus: "8", castingMod: "5" },
					{
						duration: "2",
						effects: { attack_advantage: "1", ac_bonus: "2" },
						buttons: [{
							style: "3",
							defaultDC: "14",
							defaultAttackBonus: "6",
							defaultCastingMod: "4",
							automation: [{ condition: "1" }],
						}],
					},
				],
			}],
		});
	});
});
