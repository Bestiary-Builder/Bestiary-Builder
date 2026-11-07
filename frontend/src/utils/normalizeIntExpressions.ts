import type { AttackInteraction, AttackModel, ButtonInteraction, Effect, PassiveEffects, Variable } from "~/shared";

type MutableRecord = Record<string, unknown>;

const passiveIntExpressionKeys = [
	"attack_advantage",
	"magical_damage",
	"silvered_damage",
	"ac_value",
	"ac_bonus",
	"max_hp_value",
	"max_hp_bonus",
	"dc_bonus",
] satisfies (keyof PassiveEffects)[];

const stringifyNumberProperties = (value: object, properties: readonly string[]) => {
	const record = value as MutableRecord;
	for (const property of properties) {
		if (typeof record[property] === "number")
			record[property] = String(record[property]);
	}
};

const normalizeInteractionDefaults = (interaction: AttackInteraction | ButtonInteraction) => {
	stringifyNumberProperties(interaction, ["defaultDC", "defaultAttackBonus", "defaultCastingMod"]);
};

const normalizeVariableHigherLevels = (variable: Variable) => {
	if (!variable.higher)
		return;

	for (const level of Object.keys(variable.higher)) {
		const numericLevel = Number(level);
		if (typeof variable.higher[numericLevel] === "number")
			variable.higher[numericLevel] = String(variable.higher[numericLevel]);
	}
};

const normalizeEffects = (effects: Effect[]) => {
	for (const effect of effects)
		normalizeEffect(effect);
};

const normalizeEffect = (effect: Effect) => {
	switch (effect.type) {
		case "target":
			normalizeEffects(effect.effects);
			break;
		case "attack":
			stringifyNumberProperties(effect, ["attackBonus", "adv"]);
			normalizeEffects(effect.hit);
			normalizeEffects(effect.miss);
			break;
		case "save":
			stringifyNumberProperties(effect, ["dc"]);
			normalizeEffects(effect.fail);
			normalizeEffects(effect.success);
			break;
		case "check":
			stringifyNumberProperties(effect, ["dc"]);
			normalizeEffects(effect.fail);
			normalizeEffects(effect.success);
			break;
		case "ieffect2":
			stringifyNumberProperties(effect, ["duration"]);
			if (effect.effects)
				stringifyNumberProperties(effect.effects, passiveIntExpressionKeys);
			for (const attack of effect.attacks ?? []) {
				normalizeInteractionDefaults(attack);
				normalizeAttackModel(attack.attack);
			}
			for (const button of effect.buttons ?? []) {
				stringifyNumberProperties(button, ["style"]);
				normalizeInteractionDefaults(button);
				normalizeEffects(button.automation);
			}
			break;
		case "variable":
			stringifyNumberProperties(effect, ["value", "onError"]);
			normalizeVariableHigherLevels(effect);
			break;
		case "condition":
			stringifyNumberProperties(effect, ["condition"]);
			normalizeEffects(effect.onTrue);
			normalizeEffects(effect.onFalse);
			break;
		case "counter":
			stringifyNumberProperties(effect, ["amount"]);
			if (typeof effect.counter === "object" && "slot" in effect.counter)
				stringifyNumberProperties(effect.counter, ["slot"]);
			break;
		case "spell":
			stringifyNumberProperties(effect, ["dc", "attackBonus", "castingMod"]);
			break;
		case "remove_ieffect":
		case "roll":
		case "text":
		case "damage":
		case "temphp":
			break;
	}
};

const normalizeAttackModel = (attack: AttackModel) => {
	normalizeEffects(attack.automation);
};

export const normalizeIntExpressions = (automation: AttackModel | AttackModel[] | null | undefined) => {
	if (!automation)
		return;

	for (const attack of Array.isArray(automation) ? automation : [automation])
		normalizeAttackModel(attack);
};
