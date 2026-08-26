import type { EffectWithTarget, Features } from "~/shared";
import { ref } from "vue";

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
	hit: { label: "Hit", icon: "mdi:check" },
	miss: { label: "Miss", icon: "mdi:close" },
	attack: { label: "Attack", icon: "material-symbols:swords" },
	roll: { label: "Roll", icon: "ion:dice" },
	spell: { label: "Spell", icon: "material-symbols:magic-button" },
	ieffect2: { label: "Init Effect", icon: "streamline-sharp:magic-wand-2-remix" },
	counter: { label: "Use Counter", icon: "material-symbols:123" },
	remove_ieffect: { label: "Remove Ieffect", icon: "material-symbols:delete-sharp" },
	attacks: { label: "Action", icon: "mdi:sword" },
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
		success: [],
		fail: []
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
		success: [],
		fail: []
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
}; ;
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

const dragState = ref<{
	originalDepth: number;
	ghostNodes: { el: HTMLElement; originalDepth: number }[];
} | null>(null);

const collectDepthNodes = (root: HTMLElement) => {
	const nodes: { el: HTMLElement; originalDepth: number }[] = [];
	const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>("[style*='--depth']"))];

	for (const el of all) {
		const raw = el.style.getPropertyValue("--depth");
		if (raw)
			nodes.push({ el, originalDepth: Number.parseFloat(raw) });
	}

	return nodes;
};

const onGhostStart = (evt: any) => {
	const item = evt.item as HTMLElement | null;
	if (!item)
		return;

	const originalDepth = Number.parseFloat(getComputedStyle(item).getPropertyValue("--depth"));
	dragState.value = { originalDepth, ghostNodes: [] };
};

const onGhostMove = (evt: any) => {
	const related = evt.related as HTMLElement | null;
	const to = evt.to as HTMLElement | null;

	const depthSource
		= related?.querySelector<HTMLElement>(".tree-row")
			?? related
			?? to;
	if (!depthSource || !dragState.value)
		return true;

	const targetDepthRaw = getComputedStyle(depthSource).getPropertyValue("--depth").trim();
	if (!targetDepthRaw)
		return true;
	const targetDepth = Number.parseFloat(targetDepthRaw);

	const ghostClass = (draggingProps as any).ghostClass ?? "sortable-ghost";
	const ghostEl = to?.querySelector<HTMLElement>(`.${ghostClass}`);
	if (!ghostEl)
		return true;

	// Lazily snapshot the ghost's own inline-depth nodes the first time we see it,
	// since SortableJS creates the ghost clone slightly after onStart fires.
	if (dragState.value.ghostNodes.length === 0)
		dragState.value.ghostNodes = collectDepthNodes(ghostEl);

	const { originalDepth, ghostNodes } = dragState.value;
	const delta = targetDepth - originalDepth;

	for (const { el, originalDepth: nodeOriginalDepth } of ghostNodes)
		el.style.setProperty("--depth", (nodeOriginalDepth + delta).toString());

	return true;
};

const onGhostEnd = () => {
	dragState.value = null;
};

export const draggingProps = {
	"group": "tree-group",
	"handle": ".drag-handle",
	"ghost-class": "drag-ghost",
	"class": "draggable-list",
	"animation": 200,
	"swap-treshold": 0.65,
	"invert-swap": true,
	"inverted-swap-treshold": 0.65,
	"on-move": onGhostMove,
	"on-start": onGhostStart,
	"on-end": onGhostEnd
};
