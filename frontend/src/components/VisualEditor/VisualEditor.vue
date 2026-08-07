<script setup lang="ts">
import type { AttackModel, ButtonInteraction, EffectWithTarget } from "~/shared";
import { computed, provide, ref } from "vue";
import EffectAdder from "./EffectAdder.vue";
import NodeHelper from "./NodeHelper.vue";
import AutomationDocumentation from "./Nodes/shared/AutomationDocumentation.vue";
import EffectAsRaw from "./Nodes/shared/EffectAsRaw.vue";
import SectionHeader from "./Nodes/shared/SectionHeader.vue";
import TreeRoot from "./TreeRoot.vue";
import { useHotkey } from "vuetify";
import { useToast } from "@/utils/app/toast";

const { addToast } = useToast()

const { name, noListAttack = false } = defineProps<{ name: string; noListAttack?: boolean }>();
const currentEffect = ref<EffectWithTarget | AttackModel | ButtonInteraction | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

defineExpose<{ currentEffect: any; currentContext: any }>({ currentEffect, currentContext });

const automation = defineModel<null | AttackModel | AttackModel[]>();
provide("automation", ref(automation));
const currentNode = computed(() => {
	if (!currentEffect.value)
		return null;
	if (currentContext.value[0] === "root" && currentContext.value.length === 1)
		return "noderoot";
	if (currentContext.value[currentContext.value.length - 2] === "buttons")
		return "buttonroot";
	if (currentContext.value[currentContext.value.length - 2] === "attacks")
		return "attackroot";
	if (currentContext.value.length === 2 && currentContext.value[1] === "root")
		return "noderoot";
	if (Object.hasOwn(currentEffect.value, "type"))
		// @ts-expect-error Yes it fucking does
		return currentEffect.value.type;

	return "";
});

const copiedEffect = ref<EffectWithTarget | null>(null);
provide("copiedEffect", copiedEffect);

const hoveredEffectContext = ref<string[] | null>(null)
provide("hoveredEffectContext", hoveredEffectContext)

const hoveredEffectData = ref<EffectWithTarget | null>(null)
provide("hoveredEffectData", hoveredEffectData)

useHotkey("cmd+c", () => {
	if (hoveredEffectContext && hoveredEffectContext.value && hoveredEffectData && hoveredEffectData.value) {
		copiedEffect.value = hoveredEffectData.value
		addToast("Copied effect")
	} else if (Object.hasOwn(currentEffect.value || {}, "type")) {
		// @ts-ignore
		copiedEffect.value = currentEffect.value
	}
})

useHotkey("cmd+x", () => {
	if (hoveredEffectContext && hoveredEffectContext.value && hoveredEffectData && hoveredEffectData.value) {
		const context = hoveredEffectContext.value
		let nodeList = nodeListEffectIsPartOf.value
		if (!context) return
		if (nodeList && nodeList.length > 0) {
			copiedEffect.value = hoveredEffectData.value
			addToast("Cut effect")

			const tree = nodeList
			const indexToRemove = Number.parseInt(context[context.length - 1] || "0");
			tree.splice(indexToRemove, 1);
		}
	}
}, { preventDefault: false })

useHotkey("cmd+v", async () => {
	if (hoveredEffectContext && hoveredEffectContext.value) {
		console.log(hoveredEffectContext.value)
		await pasteCopiedWithHotkey()
	}
}, { preventDefault: false })

const pasteCopiedWithHotkey = async () => {
	if (!hoveredEffectContext || !hoveredEffectContext.value)
		return
	const context = hoveredEffectContext.value
	// traverse through the tree.
	if (!automation || !automation.value || !context)
		return;

	let tree: any;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(context[0])].automation;
	else
		tree = automation.value.automation;

	for (const [idx, key] of context.entries()) {
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
		if (copiedEffect) {
			const isTargetContext = context.includes("$target")
			if (!isTargetContext && ["error", "attack", "save", "damage", "temphp", "check"].includes(copiedEffect.value?.type || "error")) {
				addToast(`Effect of type \`${copiedEffect.value?.type}\` cannot be placed outside a Target Effect.`, { color: "warn" });
				return;
			}

			tree.push(JSON.parse(JSON.stringify(copiedEffect.value)));
			addToast("Pasted effect")
		}
	}
	catch (e) {
		console.error(e);
	}
};

const nodeListEffectIsPartOf = computed(() => {
	let tree: any = [];
	const context = hoveredEffectContext.value

	// traverse through the tree.
	if (!automation || !automation.value || !context)
		return;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(context[0])].automation;

	else
		tree = automation.value.automation;

	for (const [idx, key] of context.entries()) {
		const isArrayIndex = /^\d+$/.test(key);
		if (idx === context.length - 1)
			break;

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

	return tree;
});

const showControls = ref(true)
provide("showControls", showControls)
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<SectionHeader title="Effect Tree" />
			<TreeRoot v-if="automation" :data="automation" :depth="-1" :no-list-attack="noListAttack" />
			<p v-else class="container" style="padding: 6px">
				<EffectAdder :context="['root']" :name="name" />
			</p>
			<v-btn @click="showControls = !showControls" class="pl-2" variant="text" size="x-small">
				<small> <i>{{ showControls ? 'Hide' : 'Show' }} controls</i></small>
			</v-btn>
		</div>
		<div class="editor">
			<div v-if="!currentEffect && currentContext.length === 0">
				<SectionHeader title="No Effect Selected" />
				Select or create a node in the Effect Tree to get started.
				<img src="/Devourer.png" style="max-width: 200px; transform: scale(-1, 1); margin-top: 1rem">
				<sub> Nom nom nom</sub>
			</div>
			<template v-else>
				<Transition>
					<NodeHelper v-if="currentEffect" :key="currentContext.toString()" :node="currentNode" />
				</Transition>
				<hr>
				<Transition>
					<AutomationDocumentation :key="currentContext.toString()" :node-type="currentNode" />
				</Transition>
				<Transition>
					<EffectAsRaw :current-effect />
				</Transition>
			</template>
		</div>
		<div id="effectAdderContainer" />
	</section>
</template>

<style scoped lang="less">
.tree {
	min-width: 25rem;
}

.v-enter-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

h3 {
	margin-bottom: 0.25rem;
}

section {
	background-color: var(--color-surface-1);
	min-height: 800px;
	padding: 1rem;
	border-radius: 6px;
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.container {
	min-height: 800px;
	border-radius: 6px;
	box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
	background-color: var(--color-surface-0);
}

.two-wide.uneven {
	width: 100%;
	display: grid;
	gap: 0rem 1rem;
	margin-bottom: 1rem;
	grid-template-columns: 1fr 3fr;
}

@media screen and (max-width: 1200px) {
	.two-wide.two-wide.uneven {
		grid-template-columns: 1fr;
	}

	section,
	.container {
		min-height: unset;
	}
}
</style>
