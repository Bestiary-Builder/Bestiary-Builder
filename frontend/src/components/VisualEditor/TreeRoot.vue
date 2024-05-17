<script setup lang="ts">
import { ref, watch } from "vue";
import YAML from "yaml";
import TreeNode from "./TreeNode.vue";

const props = withDefaults(defineProps<{ data: string; depth?: number; parentType?: string }>(), { depth: 0, parentType: "root" });

const parsedAutomation = ref<Record<string, unknown> | null>(null);
watch(() => props.data, () => {
	try {
		parsedAutomation.value = YAML.parse(props.data);
	}
	catch {
		// eslint-disable-next-line no-console
		console.log("data is not ready yet...", props.data);
	}
}, { immediate: true });
</script>

<template>
	<span v-if="!parsedAutomation"> No data set </span>
	<p v-for="node in parsedAutomation.automation ?? []" v-else :key="node">
		<TreeNode :data="node" :depth :parent-type />
	</p>
</template>
