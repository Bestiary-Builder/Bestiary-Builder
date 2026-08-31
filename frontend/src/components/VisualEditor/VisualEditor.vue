<script setup lang="ts">
import type { AttackModel, ButtonInteraction, EffectWithTarget } from "~/shared";
import { computed, provide, ref } from "vue";
import EffectAdder from "./EffectAdder.vue";
import NodeHelper from "./NodeHelper.vue";
import AutomationDocumentation from "./Nodes/shared/AutomationDocumentation.vue";
import EffectAsRaw from "./Nodes/shared/EffectAsRaw.vue";
import SectionHeader from "./Nodes/shared/SectionHeader.vue";
import TreeRoot from "./TreeRoot.vue";
import { useRoute } from "vuetify/lib/composables/router.mjs";

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

const showControls = ref(true);
provide("showControls", showControls);
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<SectionHeader title="Effect Tree" />
			<TreeRoot v-if="automation" :data="automation" :depth="0" :no-list-attack="noListAttack" />
			<p v-else class="container" style="padding: 6px">
				<EffectAdder :context="['root']" :name="name" />
			</p>
			<v-btn class="pl-2" variant="text" size="x-small" @click="showControls = !showControls">
				<small> <i>{{ showControls ? 'Hide' : 'Show' }} controls</i></small>
			</v-btn>
		</div>
		<div class="editor">
			<div v-if="!currentEffect && currentContext.length === 0">
				<SectionHeader title="No Effect Selected" />
				Select or create a node in the Effect Tree to get started.
				<img :src="['/Devourer.png', '/Beholder.webp', '/Flumph.png'][Math.floor(Math.random() * 3)]"
					style="max-width: 200px; transform: scale(-1, 1); margin-top: 2rem">
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
	background-color: rgb(var(--v-theme-surface-light));
	min-height: 800px;
	padding: 1rem;
	border-radius: 6px;
	box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
}

.container {
	min-height: 800px;
	border-radius: 6px;
	box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
	background-color: rgb(var(--v-theme-surface));
}

.two-wide.uneven {
	width: 100%;
	display: grid;
	gap: 0 1rem;
	margin-bottom: 1rem;
	grid-template-columns: 1fr 2fr;
}

@media screen and (width <=1200px) {
	.two-wide.two-wide.uneven {
		grid-template-columns: 1fr;
	}

	section,
	.container {
		min-height: unset;
	}
}
</style>
