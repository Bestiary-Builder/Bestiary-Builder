<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import TreeNode from "./TreeNode.vue";
import TreeNodeAdder from "./NodeAdder.vue";
import { defaultNodes, displayNames } from "./util";
import { useFetch } from "@/utils/utils";
import type { AttackModel } from "~/shared";

const { data, depth = 0, parentType = "root", rootType = "root", context = ["root"] } = defineProps<{ data: AttackModel; depth?: number; parentType?: string; rootType?: "root" | "button" | "attack"; context?: string[] }>();

// Documentation helpers
const metaData = ref<any | null>(null);

onMounted(async () => {
	const { success, data } = await useFetch("/api/automationMetaData");
	if (success)
		metaData.value = data;
});
provide("metaData", metaData);

provide("defaultNodes", defaultNodes);
</script>

<template>
	<section v-if="metaData" :class="{ container: rootType === 'root' }">
		<span v-if="!data"> No data set </span>
		<div v-for="(node, index) in data.automation ?? []" v-else :key="node.type">
			<TreeNode :data="node" :depth="depth" :parent-type="parentType" :context="[...context, index.toString()]" />
		</div>
		<p :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`">
			<TreeNodeAdder :context="context" @add="(nodeType: string) => (data?.automation as Array<any>).push(defaultNodes[nodeType] ?? {})" />
		</p>
	</section>
</template>

<style scoped lang="less">
div {
	background: repeating-linear-gradient(
		to right,
		grey,
		grey 1px,
		var(--color-surface-0) 1px,
		var(--color-surface-0) 15px
	);
	background-position: -9px;
}
p,
div {
	font-size: 14px;
}

.container:first-of-type {
	padding: 0.4rem;
	background-color: var(--color-surface-0);
	max-height: 55vh;
	overflow-y: scroll;
}
</style>
