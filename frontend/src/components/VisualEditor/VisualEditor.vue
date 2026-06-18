<script setup lang="ts">
import { computed, provide, ref, watch } from "vue";
import TreeRoot from "./TreeRoot.vue";
import NodeHelper from "./NodeHelper.vue";
import EffectAdder from "./EffectAdder.vue";
import AutomationDocumentation from "./Nodes/shared/AutomationDocumentation.vue";
import EffectAsRaw from "./Nodes/shared/EffectAsRaw.vue";
import SectionHeader from "./Nodes/shared/SectionHeader.vue";
import type { AttackModel, ButtonInteraction, Effect, EffectWithTarget } from "~/shared";

const props = defineProps<{ name: string }>();
const currentEffect = ref<EffectWithTarget | AttackModel | ButtonInteraction | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

defineExpose<{ currentEffect: any; currentContext: any }>({ currentEffect, currentContext });

const automation = defineModel<null | AttackModel | AttackModel[]>();
if (automation.value == null)
	automation.value = { _v: 2, name: "Action", automation: [] };
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
	if (Object.hasOwn(currentEffect.value, "type"))
		// @ts-expect-error Yes it fucking does
		return currentEffect.value.type;

	return "";
});

const copiedEffect = ref<EffectWithTarget | null>(null);
provide("copiedEffect", copiedEffect);
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<SectionHeader title="Effect Tree" />
			<TreeRoot v-if="automation" :data="automation" :depth="-1" />
			<p v-else class="container" style="padding: 6px">
				<EffectAdder :context="['root']" :name="props.name" />
			</p>
		</div>
		<div class="editor">
			<div v-if="!currentEffect && currentContext.length === 0">
				<SectionHeader title="No Effect Selected" />
				Select or create a node in the Effect Tree to get started.
				<img src="../../../public/Devourer.png" style="max-width: 200px;     transform: scale(-1, 1); margin-top: 1rem">
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

.two-wide.uneven {
	width: 100%;
	display: grid;
	gap: 0rem 1rem;
	margin-bottom: 1rem;
	grid-template-columns: 1fr 3fr;
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
</style>
