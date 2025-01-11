<script setup lang="ts">
import { type Ref, inject, onMounted, provide, ref } from "vue";
import TreeNode from "./TreeNode.vue";
import TreeNodeAdder from "./EffectAdder.vue";
import { defaultNodes } from "./util";
import { useFetch } from "@/utils/utils";
import type { AttackModel, Effect } from "~/shared";

const { data, depth = 0, parentType = "root", rootType = "root", context = ["root"] } = defineProps<{ data: AttackModel | AttackModel[]; depth?: number; parentType?: string; rootType?: "root" | "button" | "attack"; context?: string[] }>();

// Documentation helpers
const metaData = ref<any | null>(null);

onMounted(async () => {
	const { success, data } = await useFetch("/api/automationMetaData");
	if (success)
		metaData.value = data;
});
provide("metaData", metaData);

const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const makeListAttack = () => {
	if (Array.isArray(data) || !automation)
		return;
	const currentAttack = data;
	automation.value = [currentAttack, { _v: 2, name: "New Attack", automation: [] }];
};

const addListAttack = () => {
	if (!automation || !automation.value || !Array.isArray(automation.value))
		return;

	automation.value.push({ _v: 2, name: "New Attack", automation: [] });
};

const currentEffect = inject<Ref<Effect | AttackModel >>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");
</script>

<template>
	<section v-if="metaData" :class="{ container: rootType === 'root' }">
		<template v-if="Array.isArray(data)">
			<template v-for="auto, index in data" :key="index">
				<p v-if="rootType === 'root'" @click="currentEffect = data[index]; currentContext = [...context]">
					-{{ auto.name }}-
				</p>
				<div v-for="(node, idx) in auto.automation ?? []" :key="node.type">
					<TreeNode :data="node" :depth="depth" :parent-type="parentType" :context="[...context, idx.toString()]" />
				</div>
				<p :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`">
					<TreeNodeAdder :context="context" @add="(nodeType: string) => auto.automation.push(defaultNodes[nodeType] ?? {})" />
				</p>
			</template>
			<p v-if="rootType === 'root'" :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`" class="add" @click="addListAttack()">
				Add Attack to this feature
			</p>
		</template>
		<template v-else>
			<p v-if="rootType === 'root'" @click="currentEffect = data; currentContext = [...context]">
				-Attack Root-
			</p>
			<div v-for="(node, index) in data.automation ?? []" :key="node.type">
				<TreeNode :data="node" :depth="depth" :parent-type="parentType" :context="[...context, index.toString()]" />
			</div>
			<p :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`">
				<TreeNodeAdder :context="context" @add="(nodeType: string) => data!.automation.push(defaultNodes[nodeType] ?? {})" />
			</p>
			<p v-if="rootType === 'root'" :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`" class="add" @click="makeListAttack()">
				Add Attack to this feature
			</p>
		</template>
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

.add {
	cursor: pointer;
	transition: color 150ms ease-out;
	&:hover {
		color: color-mix(in srgb, currentColor, white) !important;
	}
}
</style>
