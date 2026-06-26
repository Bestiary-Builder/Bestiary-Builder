import type { EffectWithTarget, Features } from "~/shared";

export const displayNames: Record<string, { label: string; icon: string }> = {
	variable: { label: "Set Variable", icon: "proicons:braces-variable" },
	target: { label: "Target", icon: "mdi:target-variant" },
	onFalse: { label: "On False", icon: "material-symbols:chat-error-sharp" },
	onTrue: { label: "On True", icon: "material-symbols:check-box" },
	fail: { label: "Fail", icon: "material-symbols:chat-error-sharp" },
	success: { label: "Success", icon: "material-symbols:check-box" },
	text: { label: "Text", icon: "material-symbols:text-fields-sharp" },
	damage: { label: "Damage", icon: "picon:angry" },
	condition: { label: "Branch", icon: "material-symbols:arrow-split" },
	hit: { label: "Hit", icon: "" },
	miss: { label: "Miss", icon: "" },
	attack: { label: "Attack Roll", icon: "material-symbols:swords" },
	roll: { label: "Roll", icon: "ion:dice" },
	spell: { label: "Spell", icon: "material-symbols:magic-button" },
	ieffect2: { label: "Initiative Effect", icon: "streamline-sharp:magic-wand-2-remix" },
	counter: { label: "Use Counter", icon: "material-symbols:123" },
	remove_ieffect: { label: "Remove Initiative Effect", icon: "material-symbols:delete-sharp" },
	attacks: { label: "Action", icon: "" },
	buttons: { label: "Button", icon: "material-symbols:joystick" },
	save: { label: "Saving Throw", icon: "fa6-solid:recycle" },
	temphp: { label: "Temp HP", icon: "material-symbols:shield-with-heart" },
	check: { label: "Ability Check", icon: "twemoji:man-cartwheeling" }
} as const;

export const defaultNodes: Record<string, EffectWithTarget> = {
	target: {
		type: "target",
		target: "all",
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
		fail: [],
		success: []
	},
	remove_ieffect: {
		type: "remove_ieffect",
	},
	spell: {
		type: "spell",
		id: 2102
	}
};

export const deepKeys = ["effects", "hit", "miss", "fail", "success", "onTrue", "onFalse"];

type activation_types = {
	[id in keyof Features]: number;
};;
export const activation_type: activation_types = {
	features: 2,
	actions: 1,
	bonus: 3,
	reactions: 4,
	legendary: 9,
	mythic: 10,
	lair: 11,
	regional: 8
};
