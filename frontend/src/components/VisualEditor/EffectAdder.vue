<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, EffectWithTarget, Features } from "~/shared";
import { Icon } from "@iconify/vue";
import { computed, inject, ref } from "vue";
import { useRoute } from "vue-router";
import { useToast } from "@/utils/app/toast";
import { activation_type, defaultNodes, displayNames } from "./util";

const { addToast } = useToast();
const isOpen = ref(false)
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
		return ["target", "roll", "text", "variable", "condition", "counter", "remove_ieffect", "spell"];
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
					addToast(`Effect of type \`${copiedEffect.value?.type}\` cannot be placed outside a Target Effect.`, { color: "warn" });
					return;
				}

				tree.push(JSON.parse(JSON.stringify(copiedEffect.value)));
			}
		}
		else { tree.push(JSON.parse(JSON.stringify(defaultNodes[node]))); }
		currentEffect!.value = tree[tree.length - 1];
		isOpen.value = false
	}
	catch (e) {
		console.error(e);
	}

};

const copiedEffect = inject<Ref<EffectWithTarget | null>>("copiedEffect");

const showControls = inject<Ref<boolean>>("showControls")
</script>

<template>
	<DropdownMenu v-if="displayNames && showControls" location="bottom center" v-model="isOpen">
		<template #activator="{ props }">
			<div role="button" class="container add-effect" v-bind="props">
				<span class="icon">
					<Icon icon="material-symbols:add-circle" width="1em" color="orangered" />
				</span><span>{{ automation === null ? 'Create Automation' : 'Add Effect' }}</span>
			</div>
		</template>
		<v-card max-width="300" subtitle="Choose an effect to add." class="pa-4">
			<v-card-actions>
				<v-row density="compact">
					<v-col v-for="node in availableNodes" :key="node" cols="12">
						<v-btn :key="node" @click="addAndSelect(node)" :prepend-icon="displayNames![node]?.icon"
							size="small">
							{{ displayNames[node]?.label }}
						</v-btn>

					</v-col>
					<v-col cols="12">
						<v-btn v-if="copiedEffect"" @click=" addAndSelect('', true)" prepend-icon="ooui:copy-ltr"
							size="small">
							Paste Cut/Copied Effect
						</v-btn>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-card>
	</DropdownMenu>
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
