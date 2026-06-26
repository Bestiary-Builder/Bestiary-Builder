<script setup lang="ts">
import { type Ref, computed, inject } from "vue";
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { store } from "../../utils/store";
import { activation_type, defaultNodes, displayNames } from "./util";
import type { AttackInteraction, AttackModel, ButtonInteraction, EffectWithTarget, Features } from "~/shared";
import { toast } from "@/utils/app/toast";

const props = defineProps<{ context: string[]; name?: string }>();
const $route = useRoute();
const type = $route.params.type as keyof Features;
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
const currentEffect = inject<Ref<EffectWithTarget | ButtonInteraction | AttackInteraction>>("currentEffect");
const addAndSelect = async (node: string, pasteCopied = false) => {
	// traverse through the tree.
	if (!automation)
		return;
	if (!automation.value) {
		automation.value = { _v: 2, name: props.name || "New Attack", automation: [JSON.parse(JSON.stringify(defaultNodes[node]))], activation_type: activation_type[type] };
		return;
	}

	let tree: any;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(props.context[0])].automation;
	else
		tree = automation.value.automation;

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
		if (pasteCopied) {
			if (copiedEffect) {
				const { isTargetContext } = computedContext.value;
				if (!isTargetContext && ["error", "attack", "save", "damage", "temphp", "check"].includes(copiedEffect.value?.type || "error")) {
					toast.error(`Effect of type \`${copiedEffect.value?.type}\` cannot be placed outside a Target Effect.`);
					return;
				}

				tree.push(JSON.parse(JSON.stringify(copiedEffect.value)));
			}
		}
		else { tree.push(JSON.parse(JSON.stringify(defaultNodes[node]))); }
		currentEffect!.value = tree[tree.length - 1];
	}
	catch (e) {
		console.error(e);
	}
};

const copiedEffect = inject<Ref<EffectWithTarget | null>>("copiedEffect");
</script>

<template>
	<VDropdown v-if="displayNames" :distance="6" :positioning-disabled="store.isMobile" placement="left" container="#effectAdderContainer">
		<div role="button" class="container">
			<span class="icon"><Icon icon="material-symbols:add-circle" width="1em" color="orangered" /></span><span>Add Effect</span>
		</div>
		<template #popper>
			<div class="v-popper__custom-menu">
				<span style="color: lightgrey"> Choose an Effect to add:</span>
				<div class="two-wide">
					<button v-for="node in availableNodes" :key="node" v-close-popper class="btn" @click="addAndSelect(node)">
						<Icon :icon="displayNames![node]?.icon" :inline="true" width="1em" />
						{{ displayNames[node]?.label }}
					</button>
					<button v-if="copiedEffect" class="btn" @click="addAndSelect('', true)">
						<Icon icon="ooui:copy-ltr" width="1em" />
						Paste Cut/Copied Effect
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
	color: orangered;
}

.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5rem;
}
</style>
