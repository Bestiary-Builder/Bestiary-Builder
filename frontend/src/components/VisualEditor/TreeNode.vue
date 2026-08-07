<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, EffectKey, EffectWithTarget, IEffect, Target } from "~/shared";
import { Icon } from "@iconify/vue";
import { computed, inject, ref } from "vue";
import { capitalizeFirstLetter } from "~/shared";
import EffectAdder from "./EffectAdder.vue";
import NodeHeader from "./Nodes/shared/NodeHeader.vue";
import TreeRoot from "./TreeRoot.vue";
import { deepKeys } from "./util";
import { mergeProps } from "vue"

const props = defineProps<{ data: EffectWithTarget; depth: number; parentType: string; context: string[] }>();

const selfType = computed<string>(() => {
	return props.data.type;
});

const currentEffect = inject<Ref<EffectWithTarget | ButtonInteraction | AttackInteraction>>("currentEffect");
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

const isCurrentSelectedContext = computed(() => {
	return JSON.stringify(currentContext?.value || []) === JSON.stringify(props.context);
});
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
	if (nodeListEffectIsPartOf.value && nodeListEffectIsPartOf.value.length > 0) {
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

const copiedEffect = inject<Ref<EffectWithTarget | null>>("copiedEffect");
const copyNode = () => {
	if (!copiedEffect)
		return;
	copiedEffect.value = props.data;
};

const cutNode = () => {
	if (!copiedEffect)
		return;
	copiedEffect.value = props.data;
	deleteNode();
};

const additionalText = computed(() => {
	if (selfType.value === "target") {
		const target = (props.data as Target).target || "";
		if (!target)
			return "";

		return capitalizeFirstLetter(target.toString());
	}
	if (selfType.value === "ieffect2") {
		const target = (props.data as IEffect).name || "";
		if (!target)
			return "";

		return target.toString().substring(0, 99).trim();
	}
	return "";
});

const hoveredEffectContext = inject<Ref<string[] | null>>("hoveredEffectContext")
const hoveredEffectData = inject<Ref<EffectWithTarget | null>>("hoveredEffectData")

const onMouseEnter = (context: string[], data: EffectWithTarget | null) => {
	if (hoveredEffectContext && hoveredEffectData) {
		hoveredEffectContext.value = context
		hoveredEffectData.value = data
	}
}

const onMouseLeave = () => {
	if (hoveredEffectContext && hoveredEffectData) {
		hoveredEffectContext.value = null
		hoveredEffectData.value = null
	}
}

const showControls = inject<Ref<boolean>>("showControls")
</script>

<template>
	<p :style="`margin-left: ${(depth + 1) * 15}px; color: grey;`" class="tree-row"
		@click="currentEffect = data; currentContext = context"
		@mouseenter="onMouseEnter(props.context.slice(0, props.context.length - 1), props.data)"
		@mouseleave="onMouseLeave">
		<NodeHeader :type="selfType" :additional-text="additionalText" :is-current="isCurrentSelectedContext" />
		<span class="tree-buttons" v-if="showControls">
			<v-tooltip text="Move up in current context">
				<template #activator="{ props }">
					<Icon v-if="(nodeListEffectIsPartOf || []).length > 0 && indexInRespectToParent !== 0"
						icon="ooui:arrow-up" inline width=".75em" class="no-focus-outline" v-bind="props"
						@click.prevent="moveUp" />
					<Icon v-else icon="ooui:arrow-up" inline width=".75em" color="#3f3f3f"
						class="disabled no-focus-outline" v-bind="props" />
				</template>
			</v-tooltip>

			<v-tooltip text="Move down in current context">
				<template #activator="{ props }">
					<Icon
						v-if="(nodeListEffectIsPartOf || []).length > 0 && indexInRespectToParent !== (nodeListEffectIsPartOf || []).length - 1"
						icon="ooui:arrow-down" inline width=".75em" class="no-focus-outline" v-bind="props"
						@click.prevent="moveDown" />
					<Icon v-else icon="ooui:arrow-down" inline width=".75em" color="#3f3f3f"
						class="disabled no-focus-outline" v-bind="props" />
				</template>
			</v-tooltip>

			<DropdownMenu>
				<template #activator="{ props: menuProps }">
					<v-tooltip text="Delete this node">
						<template #activator="{ props: tooltipProps }">
							<Icon icon="mdi:trash" inline width=".75em" v-bind="mergeProps(menuProps, tooltipProps)"
								class="no-focus-outline" />
						</template>
					</v-tooltip>
				</template>
				<v-card class="text-center pb-2" :subtitle="`Are you sure you want to delete this ${selfType} Effect?`">
					<v-card-text>
						<v-btn color="error" @click="deleteNode" class="w-100"> Delete </v-btn>
					</v-card-text>
				</v-card>
			</DropdownMenu>

			<v-tooltip text="Copy this node">
				<template #activator="{ props }">
					<Icon icon="ooui:copy-ltr" inline width=".75em" @click="copyNode" v-bind="props"
						class="no-focus-outline" />
				</template>
			</v-tooltip>
			<v-tooltip text="Cut this node">
				<template #activator="{ props }">
					<Icon icon="ooui:cut-ltr" inline width=".75em" @click="cutNode" v-bind="props"
						class="no-focus-outline" />
				</template>
			</v-tooltip>
		</span>
		<span v-if="['attack', 'condition', 'save'].includes(selfType)" class="collapse-button"
			@click.stop="isCollapsed = !isCollapsed">
			<Icon icon="solar:alt-arrow-right-bold" inline width=".75em" :rotate="isCollapsed ? 0 : 45" />
		</span>
	</p>
	<div v-show="!isCollapsed">
		<!-- Loop through each key in our data, looking for the keys which continue the structure. -->
		<template v-for="effect, key of data" :key="key">
			<template v-if="deepKeys.includes(key) && selfType !== 'ieffect2'">
				<!--- E.g. hit, Miss, on False text -->
				<p v-if="!['root', 'effects'].includes(key)" :key="key" :style="`margin-left: ${(depth + 2) * 15}px;`"
					class="tree-row section-node" @click.stop="toggleBranch(key)"
					@mouseenter="onMouseEnter([...props.context, key], null)" @mouseleave="onMouseLeave">
					<NodeHeader :type="key" />
					<span v-if="['onTrue', 'onFalse', 'hit', 'miss', 'fail', 'success'].includes(key)"
						class="collapse-button">
						<Icon icon="solar:alt-arrow-right-bold" inline width=".75em"
							:rotate="branchesCollapsed.includes(key) ? 0 : 45" />
					</span>
				</p>
				<template v-if="!branchesCollapsed.includes(key)">
					<TreeNode v-for="(childNode, index) in effect" :key="childNode as any" :data="childNode as any"
						:depth="depth + (!['root', 'effects'].includes(key) ? 2 : 1)" :parent-type="key"
						:context="[...context, `$${selfType}`, key, index.toString()]" />
					<p :style="`margin-left: ${(depth + (!['root', 'effects'].includes(key) ? 3 : 2)) * 15}px;`"
						class="tree-row" @mouseenter="hoveredEffectContext = [...context, `$${selfType}`, key];"
						@mouseleave="hoveredEffectContext = null">
						<EffectAdder :context="[...context, `$${selfType}`, key]" />
					</p>
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'buttons'">
				<template v-for="(button, index) in effect" :key="index">
					<p :style="`margin-left: ${(depth + 2) * 15}px;`" class="tree-row"
						@click="currentEffect = (button as any as ButtonInteraction); currentContext = [...context, 'buttons', index.toString()]">
						<NodeHeader :type="key" :additional-text="(button as any as ButtonInteraction).label.trim()"
							:is-current="JSON.stringify(currentContext) === JSON.stringify([...context, 'buttons', index.toString()])" />
					</p>
					<TreeRoot :data="(button as any as AttackModel)" :depth="depth + 2" root-type="button"
						:context="[...context, 'buttons', index.toString(), 'automation']" />
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'attacks'">
				<template v-for="(attack, index) in effect" :key="index">
					<p :style="`margin-left: ${(depth + 2) * 15}px;`" class="tree-row"
						@click="currentEffect = (attack as any as AttackInteraction); currentContext = [...context, 'attacks', index.toString()]">
						<NodeHeader :type="key"
							:additional-text="(attack as any as AttackInteraction).attack.name.trim()"
							:is-current="JSON.stringify(currentContext) === JSON.stringify([...context, 'attacks', index.toString()])" />
					</p>
					<TreeRoot :data="(attack as any as AttackModel)" :depth="depth + 2" root-type="attack"
						:context="[...context, 'attacks', index.toString(), 'automation']" />
				</template>
			</template>
		</template>
	</div>
</template>
