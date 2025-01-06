<script setup lang="ts">
import { computed, inject } from "vue";
import { store } from "../../utils/store";
import { displayNames } from "./util";

const props = defineProps<{ context: string[] }>();

defineEmits<{
	add: [node: string];
}>();

const computedContext = computed(() => {
	// a button, attack, or root node defines the current context that the automation runs in.
	// Thus, we consider the relevant context up to when we reach one of these three.
	// The relevant context determines which nodes can be added. For example, a damage node can only be added nested within a target node,
	// while a remove_ieffect node is only available within a button

	// work our way back up the tree as we stop when we reach the first context level
	const ctx = [...props.context].reverse();
	// node determining context
	let isTargetContext = false;

	// context levels
	let contextLevel: "root" | "attacks" | "buttons" = "root";

	for (const node of ctx) {
		if (node === "target")
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
	const ctx = computedContext.value;

	if (!ctx.isTargetContext && ctx.contextLevel === "root")
		return ["target", "roll", "text", "variable", "condition", "counter", "spell"];
	if (ctx.isTargetContext && ctx.contextLevel === "root")
		return ["attack", "save", "damage", "temphp", "ieffect2", "roll", "text", "variable", "condition", "counter", "check"];

	if (!ctx.isTargetContext && (ctx.contextLevel === "attacks" || ctx.contextLevel === "buttons"))
		return ["target", "remove_ieffect", "roll", "text", "variable", "condition", "counter", "spell"];
	if (ctx.isTargetContext && (ctx.contextLevel === "attacks" || ctx.contextLevel === "buttons"))
		return ["attack", "save", "damage", "temphp", "ieffect2", "remove_ieffect", "roll", "text", "variable", "condition", "counter", "check"];

	return [];
});
</script>

<template>
	<VDropdown v-if="displayNames" :distance="6" :positioning-disabled="store.isMobile" placement="left">
		<div role="button" class="container">
			<span class="icon">➕</span><span>Add Effect</span>
		</div>
		<template #popper>
			<div class="v-popper__custom-menu">
				Choose a Node to add:
				<div v-for="node in availableNodes" :key="node">
					<button v-close-popper class="btn" @click="$emit('add', node)">
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
