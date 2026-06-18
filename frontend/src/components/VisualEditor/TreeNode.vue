<script setup lang="ts">
import { type Ref, computed, inject, ref } from "vue";
import { Icon } from "@iconify/vue";
import TreeRoot from "./TreeRoot.vue";
import EffectAdder from "./EffectAdder.vue";
import NodeHeader from "./Nodes/shared/NodeHeader.vue";
import { deepKeys, displayNames } from "./util";
import type { AttackInteraction, AttackModel, ButtonInteraction, Effect, EffectKey } from "~/shared";

const props = defineProps<{ data: Effect; depth: number; parentType: string; context: string[] }>();

const selfType = computed<string>(() => {
	return props.data.type;
});

const currentEffect = inject<Ref<Effect | ButtonInteraction | AttackInteraction>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");
const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const isCollapsed = ref(false);

const branchesCollapsed = ref<string[]>([]);

const toggleBranch = (key: string) => {
	if (branchesCollapsed.value.includes(key))
		branchesCollapsed.value = branchesCollapsed.value.filter(n => n !== key);
	else
		branchesCollapsed.value.push(key);
};

const moveUp = () => {
	if (nodeListEffectIsPartOf.value && nodeListEffectIsPartOf.value.length > 0) {
		const tree = nodeListEffectIsPartOf.value;
		const indexToMove = Number.parseInt(props.context[props.context.length - 1] || "0");
		if (indexToMove === 0)
			return;

		const toReplace = tree[indexToMove - 1];
		tree[indexToMove - 1] = props.data;
		tree[indexToMove] = toReplace;
	}
};

const moveDown = () => {
	if (nodeListEffectIsPartOf.value && nodeListEffectIsPartOf.value.length > 1) {
		const tree = nodeListEffectIsPartOf.value;
		const indexToMove = Number.parseInt(props.context[props.context.length - 1] || "0");
		if (indexToMove === tree.length - 1)
			return;

		const toReplace = tree[indexToMove + 1];
		tree[indexToMove + 1] = props.data;
		tree[indexToMove] = toReplace;
	}
};

const deleteNode = () => {
	if (nodeListEffectIsPartOf.value && nodeListEffectIsPartOf.value.length > 1) {
		const tree = nodeListEffectIsPartOf.value;
		const indexToRemove = Number.parseInt(props.context[props.context.length - 1] || "0");

		tree.splice(indexToRemove, 1);
	}
};

const nodeListEffectIsPartOf = computed(() => {
	let tree: any = [];

	if (!automation || !automation.value)
		return;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(props.context[0])].automation;

	else
		tree = automation.value.automation;

	for (const [idx, key] of props.context.entries()) {
		const isArrayIndex = /^\d+$/.test(key);
		if (idx === props.context.length - 1)
			break;

		if (key === "root")
			continue;
		if (key.startsWith("$"))
			continue;
		if (isArrayIndex) {
			if (idx === 0)
				continue;
			const index = Number.parseInt(key, 10);
			if (Array.isArray(tree) && index < tree.length)
				tree = tree[index];
			else
				return undefined;
		}
		else {
			if (typeof tree === "object" && key in tree)
				tree = tree[key];
			else
				return undefined;
		}
	}

	return tree;
});

const indexInRespectToParent = computed(() => {
	return Number.parseInt(props.context[props.context.length - 1]);
});
</script>

<template>
	<p :style="`margin-left: ${(depth + 1) * 15}px; color: grey;`" @click="currentEffect = data; currentContext = context">
		<NodeHeader :type="selfType" />
		<Icon v-if="nodeListEffectIsPartOf.length > 0 && indexInRespectToParent !== 0" icon="ooui:arrow-up" inline width=".75em" @click.prevent="moveUp" />
		<Icon v-if="nodeListEffectIsPartOf.length > 0 && indexInRespectToParent !== nodeListEffectIsPartOf.length - 1 " icon="ooui:arrow-down" inline width=".75em" @click.prevent="moveDown" />
		<Icon icon="fa7-solid:eraser" inline width=".75em" @click="deleteNode" />
		<Icon icon="ooui:copy-ltr" inline width=".75em" @click="deleteNode" />

		<!-- <Icon icon="material-symbols:ink-pen" inline width="1em" style="margin-left: .5em" /> -->
		<span v-if="['attack', 'condition', 'save'].includes(selfType)" class="collapse-button" @click.stop="isCollapsed = !isCollapsed">
			<Icon icon="ooui:expand" inline width="1em" :rotate="isCollapsed ? 270 : 0" />
		</span>
	</p>
	<div v-show="!isCollapsed">
		<!-- Loop through each key in our data, looking for the keys which continue the structure. -->
		<template v-for="effect, key of data" :key="key">
			<template v-if="deepKeys.includes(key) && selfType !== 'ieffect2'">
				<!--- E.g. hit, Miss, on False text -->
				<p v-if="!['root', 'effects'].includes(key)" :key="key" :style="`margin-left: ${(depth + 2) * 15}px; color: white;`">
					<NodeHeader :type="key" />
					<span v-if="['onTrue', 'onFalse', 'hit', 'miss', 'fail', 'success'].includes(key)" class="collapse-button" @click.stop="toggleBranch(key)">
						<Icon icon="ooui:expand" inline width="1em" :rotate="branchesCollapsed.includes(key) ? 270 : 0" />
					</span>
				</p>
				<template v-if="!branchesCollapsed.includes(key)">
					<TreeNode v-for="(childNode, index) in effect" :key="index" :data="childNode as any" :depth="depth + (!['root', 'effects'].includes(key) ? 2 : 1)" :parent-type="key" :context="[...context, `$${selfType}`, key, index.toString()]" />
					<p :style="`margin-left: ${(depth + (!['root', 'effects'].includes(key) ? 3 : 2)) * 15}px;`">
						<EffectAdder :context="[...context, `$${selfType}`, key]" />
					</p>
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'buttons'">
				<template v-for="(button, index) in effect" :key="index">
					<p :style="`margin-left: ${(depth + 1) * 15}px;`" @click="currentEffect = (button as any as ButtonInteraction); currentContext = [...context, 'buttons', index.toString()]">
						<NodeHeader :type="key" :additional-text="(button as any as ButtonInteraction).label" />
					</p>
					<TreeRoot :data="(button as any as ButtonInteraction)" :depth="depth + 1" root-type="button" :context="[...context, index.toString(), key]" />
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'attacks'">
				<template v-for="(attack, index) in effect" :key="index">
					<p :style="`margin-left: ${(depth + 1) * 15}px;`" @click="currentEffect = (attack as any as AttackInteraction); currentContext = [...context, 'attacks', index.toString()]">
						<NodeHeader :type="key" :additional-text="(attack as any as AttackInteraction).attack.name" />
					</p>
					<TreeRoot :data="(attack as any as AttackModel)" :depth="depth + 1" root-type="attack" :context="[...context, index.toString(), key]" />
				</template>
			</template>
		</template>
	</div>
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

.iconify {
	scale: 1.25;
}
</style>
