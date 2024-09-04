<script setup lang="ts">
import { inject, provide, ref, watch } from "vue";
import YAML from "yaml";
import TreeRoot from "./TreeRoot.vue";
import NodeRoot from "./NodeRoot.vue";
import type { AttackModel, Effect } from "~/shared";

const currentEffect = ref<Effect | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

const automation = defineModel<AttackModel>();
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<h3> Automation Tree</h3>
			<TreeRoot v-if="automation" :data="automation" :depth="-1" />
		</div>
		<div class="editor">
			<Transition>
				<NodeRoot v-if="currentEffect" :key="currentContext.toString()" :node="currentEffect.type" />
			</Transition>
		</div>
	</section>
</template>

<style scoped lang="less">
.tree {
	min-width: 20rem;
}

.v-enter-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
