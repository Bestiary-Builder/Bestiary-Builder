import type { Effect } from "~/shared";

export const displayNames: Record<string, { label: string; icon: string }> = {
	variable: { label: "Set Variable", icon: "fluent:braces-variable-24-filled" },
	target: { label: "Target", icon: "fluent:target-arrow-24-filled" },
	onFalse: { label: "On False", icon: "emojione:cross-mark" },
	onTrue: { label: "On True", icon: "emojione:white-heavy-check-mark" },
	fail: { label: "Fail", icon: "" },
	success: { label: "Success", icon: "" },
	text: { label: "Text", icon: "emojione-monotone:speech-balloon" },
	damage: { label: "Damage", icon: "emojione:anger-symbol" },
	condition: { label: "Branch", icon: "f7:arrow-branch" },
	hit: { label: "Hit", icon: "" },
	miss: { label: "Miss", icon: "" },
	attack: { label: "Attack Roll", icon: "twemoji:crossed-swords" },
	roll: { label: "Roll", icon: "twemoji:game-die" },
	spell: { label: "Spell", icon: "twemoji:crystal-ball" },
	ieffect2: { label: "Initiative Effect", icon: "twemoji:sparkles" },
	counter: { label: "Use Counter", icon: "twemoji:input-numbers" },
	remove_ieffect: { label: "Remove Initiative Effect", icon: "material-symbols:delete-forever" },
	attacks: { label: "Action", icon: "" },
	buttons: { label: "Button", icon: "" },
	save: { label: "Saving Throw", icon: "fa6-solid:recycle" },
	temphp: { label: "Temp HP", icon: "twemoji:shield" },
	check: { label: "Ability Check", icon: "twemoji:man-cartwheeling" }
} as const;

export const defaultNodes: Record<string, Effect> = {
	target: {
		type: "target",
		target: "each",
		effects: []
	},
	attack: {
		type: "attack",
		hit: [],
		miss: []
	},
	damage: {
		type: "damage",
		damage: ""
	},
	save: {
		type: "save",
		stat: "dex",
		dc: "10",
		fail: [],
		success: []
	},
	temphp: {
		type: "temphp",
		amount: ""
	},
	ieffect2: {
		type: "ieffect2",
		name: ""
	},
	roll: {
		type: "roll",
		dice: "",
		name: "",
	},
	text: {
		type: "text",
		text: "",
		title: ""
	},
	variable: {
		type: "variable",
		name: "",
		value: ""
	},
	condition: {
		type: "condition",
		condition: "",
		onTrue: [],
		onFalse: []
	},
	counter: {
		type: "counter",
		counter: "",
		amount: ""
	},
	check: {
		type: "check",
		ability: ["athletics"],
	},
	remove_ieffect: {
		type: "remove_ieffect",
	},
	spell: {
		type: "spell",
		id: 2102
	}
};
