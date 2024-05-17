<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import TreeRoot from "./TreeRoot.vue";
import { useFetch } from "@/utils/utils";

const props = defineProps<{ data: unknown; depth: number; parentType: string }>();

// Documentation helpers
const metaData = ref<any | null>(null);

onMounted(async () => {
	const { success, data } = await useFetch("/api/automationMetaData");
	if (success)
		metaData.value = data;
});

const selfType = computed(() => {
	// @ts-expect-error Automation does not have typing.
	return props.data.type;
});
</script>

<template>
	<template v-if="metaData">
		<p :style="`margin-left: ${(depth + 0) * 20}px`">
			{{ parentType }}:
		</p>
		<p :style="`margin-left: ${(depth + 1) * 20}px`">
			{{ selfType }}
		</p>
	</template>
	<!-- <p v-if="metaData" :style="`margin-left: ${depth * 20}px`"> {{parentType}}:
        <p style="margin-left: 20px"> {{ selfType }}</p>
    </p> -->
	<template v-if="metaData">
		<template v-for="node, nodeType of data">
			<template v-if="metaData[selfType][nodeType] === 'Effects[]'">
				<TreeNode v-for="childNode in node" :key="childNode" :data="childNode" :depth="depth + 1" :parent-type="nodeType" />
			</template>
			<template v-if="nodeType === 'buttons'">
				<TreeRoot v-for="button in node" :key="button" :data="JSON.stringify(button)" :depth="depth + 1" parent-type="buttonRoot" />
			</template>
			<template v-if="nodeType === 'attacks'">
				<TreeRoot v-for="attack in node" :key="attack" :data="JSON.stringify(attack)" :depth="depth + 1" parent-type="attackRoot" />
			</template>
		</template>
	</template>
</template>

<style scoped>
.red {
	border: 4px solid lightcoral;
}

.blue {
	border: 4px solid lightblue;
	margin-right: 0.5rem;
}

.green {
	border: 4px solid lightgreen;
}
</style>
