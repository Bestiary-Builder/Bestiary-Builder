<script setup lang="ts">
import { type Ref, computed, inject, ref } from "vue";
import TreeRoot from "./TreeRoot.vue";
import TreeNodeAdder from "./TreeNodeAdder.vue";
import type { Effect } from "~/shared";

const props = defineProps<{ data: Effect; depth: number; parentType: string; context: string[] }>();

const metaData = inject<any>("metaData");

const selfType = computed<string>(() => {
	return props.data.type;
});

const displayNames = inject<Record<string, string>>("displayNames");

const defaultNodes = inject<Record<string, any>>("defaultNodes");

const currentEffect = inject<Ref<Effect>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");

const isCollapsed = ref(false);

const branchesCollapsed = ref<string[]>([]);

const toggleBranch = (nodeType: string) => {
	if (branchesCollapsed.value.includes(nodeType))
		branchesCollapsed.value = branchesCollapsed.value.filter(n => n !== nodeType);
	 else
		branchesCollapsed.value.push(nodeType);
};
</script>

<template>
	<template v-if="displayNames && defaultNodes">
		<p :style="`margin-left: ${(depth + 1) * 15}px; color: grey;`" @click="currentEffect = data; currentContext = [...context, selfType]">
			{{ displayNames![selfType] }}
			<font-awesome-icon :icon="['fas', 'pen']" />
			<span v-if="['attack', 'condition', 'save'].includes(selfType)" class="collapse-button" @click.stop="isCollapsed = !isCollapsed">
				<font-awesome-icon v-if="!isCollapsed" :icon="['fas', 'chevron-down']" />
				<font-awesome-icon v-else :icon="['fas', 'chevron-right']" />
			</span>
		</p>
		<div v-show="!isCollapsed">
			<template v-for="node, nodeType of data" :key="node">
				<template v-if="['Effects[]', 'Effect[]'].includes(metaData[selfType][nodeType])">
					<!--- E.g. hit, Miss, on False text -->
					<p v-if="!['root', 'effects'].includes(nodeType)" :key="nodeType" :style="`margin-left: ${(depth + 2) * 15}px; color: white;`">
						{{ displayNames![nodeType] }}
						<span v-if="['onTrue', 'onFalse', 'hit', 'miss', 'fail', 'success'].includes(nodeType)" class="collapse-button" @click.stop="toggleBranch(nodeType)">
							<font-awesome-icon v-if="!branchesCollapsed.includes(nodeType)" :icon="['fas', 'chevron-down']" />
							<font-awesome-icon v-else :icon="['fas', 'chevron-right']" />
						</span>
					</p>
					<template v-if="!branchesCollapsed.includes(nodeType)">
						<TreeNode v-for="(childNode, index) in node" :key="childNode" :data="childNode as any" :depth="depth + (!['root', 'effects'].includes(nodeType) ? 2 : 1)" :parent-type="nodeType" :context="[...context, selfType, nodeType, index.toString()]" />
						<p :style="`margin-left: ${(depth + (!['root', 'effects'].includes(nodeType) ? 3 : 2)) * 15}px;`">
							<TreeNodeAdder :context="[...context, selfType]" @add="(n: string) => (node as any).push(defaultNodes![n] ?? {})" />
						</p>
					</template>
				</template>
				<template v-if="(nodeType as any) === 'buttons' && (node as any).length > 0">
					<template v-for="(button, index) in node" :key="button">
						<p :style="`margin-left: ${(depth + 1) * 15}px; color: white;`">
							{{ displayNames![nodeType] ?? nodeType }} ({{ (button as any).label }}):
						</p>
						<TreeRoot :data="(button as any)" :depth="depth + 1" root-type="button" :context="[...context, selfType, index.toString(), nodeType]" />
					</template>
				</template>
				<template v-if="(nodeType as any) === 'attacks' && (node as any).length > 0">
					<template v-for="(attack, index) in node" :key="attack">
						<p :style="`margin-left: ${(depth + 1) * 15}px; color: white;`">
							{{ displayNames![nodeType] ?? nodeType }} ({{ (attack as any).name }}):
						</p>
						<TreeRoot :data="(attack as any)" :depth="depth + 1" root-type="attack" :context="[...context, selfType, index.toString(), nodeType]" />
					</template>
				</template>
			</template>
		</div>
	</template>
</template>

<style scoped lang="less">
p {
	background-color: var(--color-surface-0);
	cursor: pointer;
	transition: color 150ms ease-out;
	&:hover {
		color: color-mix(in srgb, currentColor, white) !important;
	}
}

svg {
	color: currentColor;
	cursor: pointer;
}
.collapse-button {
	user-select: none;
	margin-left: 0.3rem;
}
</style>
