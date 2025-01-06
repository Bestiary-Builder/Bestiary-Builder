<script setup lang="ts">
import { inject, provide, ref } from "vue";
import TreeRoot from "./TreeRoot.vue";
import NodeRoot from "./NodeHelper.vue";
import NodeAdder from "./NodeAdder.vue";
import { defaultNodes } from "./util";
import type { AttackModel, Effect } from "~/shared";

const props = defineProps<{ name: string }>();
const currentEffect = ref<Effect | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

const automation = defineModel<AttackModel>();
console.log(automation.value);
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<h3> Effect Tree</h3>
			<TreeRoot v-if="automation" :data="automation" :depth="-1" />
			<div v-else>
				<NodeAdder :context="['root']" @add="(n: string) => automation = { _v: 2, name: props.name, automation: [defaultNodes[n]] }" />
			</div>
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
	min-width: 30rem;
}

.v-enter-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
