<script setup lang="ts">
import { type Ref, computed, inject } from "vue";
import { store } from "../../utils/store";
import { defaultNodes, displayNames } from "./util";
import type { AttackInteraction, AttackModel, ButtonInteraction, Effect } from "~/shared";

const props = defineProps<{ context: string[]; name?: string }>();

const computedContext = computed(() => {
	// a button, attack, or root node defines the current context that the automation runs in.
	// Thus, we consider the relevant context up to when we reach one of these three.
	// The relevant context determines which nodes can be added. For example, a damage node can only be added nested within a target node,
	// while a remove_ieffect node is only available within a button

	// work our way back up the tree as we stop when we reach the first context level
	const ctx = [...props.context].reverse();
	console.log(ctx);
	// node determining context
	let isTargetContext = false;

	// context levels
	let contextLevel: "root" | "attacks" | "buttons" = "root";

	for (const node of ctx) {
		if (node === "$target")
			isTargetContext = true;

		if (node === "buttons") {
			contextLevel = "buttons";
			break;
		}
		if (node === "attacks") {
			contextLevel = "attacks";
			break;
		}
	}

	return {
		isTargetContext,
		contextLevel
	};
});

const availableNodes = computed(() => {
	const { isTargetContext, contextLevel } = computedContext.value;

	if (!isTargetContext && contextLevel === "root")
		return ["target", "roll", "text", "variable", "condition", "counter", "spell"];
	if (isTargetContext && contextLevel === "root")
		return ["attack", "save", "damage", "temphp", "ieffect2", "roll", "text", "variable", "condition", "counter", "check"];

	if (!isTargetContext && (contextLevel === "attacks" || contextLevel === "buttons"))
		return ["target", "remove_ieffect", "roll", "text", "variable", "condition", "counter", "spell"];
	if (isTargetContext && (contextLevel === "attacks" || contextLevel === "buttons"))
		return ["attack", "save", "damage", "temphp", "ieffect2", "remove_ieffect", "roll", "text", "variable", "condition", "counter", "check"];

	return [];
});

const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const currentEffect = inject<Ref<Effect | ButtonInteraction | AttackInteraction>>("currentEffect");
const addAndSelect = async (node: string) => {
	// traverse through the tree.
	if (!automation)
		return;
	if (!automation.value)
		automation.value = { _v: 2, name: props.name || "New Attack", automation: [] };

	let tree: any;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(props.context[0])].automation;
	else tree = automation.value.automation;

	for (const [idx, key] of props.context.entries()) {
		const isArrayIndex = /^\d+$/.test(key);
		if (key === "root")
			continue;
		if (key.startsWith("$"))
			continue;
		if (isArrayIndex) {
			if (idx === 0)
				continue;
			const index = Number.parseInt(key, 10);
			if (Array.isArray(tree) && index < tree.length)
				tree = tree[index];
			else
				return undefined;
		}
		else {
			if (typeof tree === "object" && key in tree)
				tree = tree[key];
			else
				return undefined;
		}
	}
	try {
		tree.push(JSON.parse(JSON.stringify(defaultNodes[node])));
		currentEffect!.value = tree[tree.length - 1];
	}
	catch (e) {
		console.error(e);
	}
};
</script>

<template>
	<VDropdown v-if="displayNames" :distance="6" :positioning-disabled="store.isMobile" placement="left">
		<div role="button" class="container">
			<span class="icon">➕</span><span>Add Effect</span>
		</div>
		<template #popper>
			<div class="v-popper__custom-menu">
				Choose an Effect to add:
				<div v-for="node in availableNodes" :key="node">
					<button v-close-popper class="btn" @click="addAndSelect(node)">
						<Icon :icon="displayNames![node]?.icon" :inline="true" width="1em" color="rgb(128,128,128)" />
						{{ displayNames[node]?.label }}
					</button>
				</div>
			</div>
		</template>
	</VDropdown>
</template>

<style scoped lang="less">
.container {
	background-color: var(--color-surface-0);
	cursor: pointer;
	color: rgb(168, 168, 168);
	transition: all 0.1s ease;

	&:hover {
		color: white;
	}
}

button {
	width: 100%;
}
</style>
