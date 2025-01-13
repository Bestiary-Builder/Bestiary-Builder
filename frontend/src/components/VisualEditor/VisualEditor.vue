<script setup lang="ts">
import { computed, provide, ref } from "vue";
import TreeRoot from "./TreeRoot.vue";
import NodeHelper from "./NodeHelper.vue";
import EffectAdder from "./EffectAdder.vue";
import AutomationDocumentation from "./Nodes/shared/AutomationDocumentation.vue";
import EffectAsRaw from "./Nodes/shared/EffectAsRaw.vue";
import type { AttackModel, ButtonInteraction, Effect } from "~/shared";

const props = defineProps<{ name: string }>();
const currentEffect = ref<Effect | AttackModel | ButtonInteraction | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

const automation = defineModel<null | AttackModel | AttackModel[]>();

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
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<h3> Effect Tree</h3>
			<TreeRoot v-if="automation" :data="automation" :depth="-1" />
			<div v-else>
				<EffectAdder :context="['root']" :name="props.name" />
			</div>
		</div>
		<div class="editor">
			<Transition>
				<NodeHelper v-if="currentEffect" :key="currentContext.toString()" :node="currentNode" />
			</Transition>
			<hr>
			<Transition>
				<AutomationDocumentation :key="currentContext.toString()" :node-type="currentNode" />
			</Transition>
			<Transition>
				<EffectAsRaw :key="currentContext.toString()" />
			</Transition>
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
</style>
