<script setup lang="ts">
import { type Ref, inject, onMounted, provide, ref, watch } from "vue";
import YAML from "yaml";
import TreeNode from "./TreeNode.vue";
import TreeNodeAdder from "./TreeNodeAdder.vue";
import { useFetch } from "@/utils/utils";
import type { AttackModel, Effect } from "~/shared";

const { data, depth = 0, parentType = "root", rootType = "root", context = ["root"] } = defineProps<{ data: AttackModel; depth?: number; parentType?: string; rootType?: "root" | "button" | "attack"; context?: string[] }>();

// Documentation helpers
const metaData = ref<any | null>(null);

onMounted(async () => {
	const { success, data } = await useFetch("/api/automationMetaData");
	if (success)
		metaData.value = data;
});
provide("metaData", metaData);

const displayNames: Record<string, string> = {
	variable: "📱Set Variable",
	target: "🎯Target",
	onTrue: "✅On True",
	onFalse: "❌On False",
	success: "Success",
	fail: "Fail",
	damage: "💢Damage",
	condition: "🔀Branch",
	attack: "🔪Attack Roll",
	hit: "Hit",
	miss: "Miss",
	text: "💬Text",
	ieffect2: "💫Initiative Effect",
	counter: "🔢Use Counter",
	spell: "🔮Cast Spell",
	roll: "🎲Roll",
	save: "♻Saving Throw",
	temphp: "🛡Temp HP",
	check: "🤸‍♂️Ability Check",
	remove_ieffect: "🗑️Remove Initiative Effect",
	buttons: "🖱Button",
	attacks: "Action"
} as const;

const defaultNodes: Record<string, Effect> = {
	target: {
		type: "target",
		target: "each",
		effects: []
	},
	attack: {
		type: "attack",
		hit: [],
		miss: []
	},
	damage: {
		type: "damage",
		damage: ""
	},
	save: {
		type: "save",
		stat: "dex",
		dc: "10",
		fail: [],
		success: []
	},
	temphp: {
		type: "temphp",
		amount: ""
	},
	ieffect2: {
		type: "ieffect2",
		name: ""
	},
	roll: {
		type: "roll",
		dice: "",
		name: "",
	},
	text: {
		type: "text",
		text: "",
		title: ""
	},
	variable: {
		type: "variable",
		name: "",
		value: ""
	},
	condition: {
		type: "condition",
		condition: "",
		onTrue: [],
		onFalse: []
	},
	counter: {
		type: "counter",
		counter: "",
		amount: ""
	},
	check: {
		type: "check",
		ability: ["athletics"],
	},
	remove_ieffect: {
		type: "remove_ieffect",
	},
	spell: {
		type: "spell",
		id: 2102
	}
};

provide("defaultNodes", defaultNodes);

provide("displayNames", displayNames);
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
