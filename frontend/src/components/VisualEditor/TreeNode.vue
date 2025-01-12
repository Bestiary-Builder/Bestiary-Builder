<script setup lang="ts">
import { type Ref, computed, inject, ref } from "vue";
import TreeRoot from "./TreeRoot.vue";
import EffectAdder from "./EffectAdder.vue";
import NodeHeader from "./Nodes/shared/NodeHeader.vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, Effect, EffectKey } from "~/shared";

const props = defineProps<{ data: Effect; depth: number; parentType: string; context: string[] }>();

const metaData = inject<any>("metaData");

const selfType = computed<string>(() => {
	return props.data.type;
});

const currentEffect = inject<Ref<Effect | ButtonInteraction | AttackInteraction>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");

const isCollapsed = ref(false);

const branchesCollapsed = ref<string[]>([]);

const toggleBranch = (key: string) => {
	if (branchesCollapsed.value.includes(key))
		branchesCollapsed.value = branchesCollapsed.value.filter(n => n !== key);
	 else
		branchesCollapsed.value.push(key);
};
</script>

<template>
	<p :style="`margin-left: ${(depth + 1) * 15}px; color: grey;`" @click="currentEffect = data; currentContext = context">
		<NodeHeader :type="selfType" />
		<Icon icon="ooui:edit" inline width="1em" style="margin-left: .75em" />
		<span v-if="['attack', 'condition', 'save'].includes(selfType)" class="collapse-button" @click.stop="isCollapsed = !isCollapsed">
			<Icon icon="ooui:expand" inline width="1em" :rotate="isCollapsed ? '270deg' : ''" />
		</span>
	</p>
	<div v-show="!isCollapsed">
		<!-- Loop through each key in our data, looking for the keys which continue the structure. -->
		<template v-for="effect, key of data" :key="effect">
			<template v-if="['Effects[]', 'Effect[]'].includes(metaData[selfType][key])">
				<!--- E.g. hit, Miss, on False text -->
				<p v-if="!['root', 'effects'].includes(key)" :key="key" :style="`margin-left: ${(depth + 2) * 15}px; color: white;`">
					<NodeHeader :type="key" />
					<span v-if="['onTrue', 'onFalse', 'hit', 'miss', 'fail', 'success'].includes(key)" class="collapse-button" @click.stop="toggleBranch(key)">
						<Icon icon="ooui:expand" inline width="1em" :rotate="branchesCollapsed.includes(key) ? '270deg' : ''" />
					</span>
				</p>
				<template v-if="!branchesCollapsed.includes(key)">
					<TreeNode v-for="(childNode, index) in effect" :key="childNode" :data="childNode as any" :depth="depth + (!['root', 'effects'].includes(key) ? 2 : 1)" :parent-type="key" :context="[...context, key, index.toString()]" />
					<p :style="`margin-left: ${(depth + (!['root', 'effects'].includes(key) ? 3 : 2)) * 15}px;`">
						<EffectAdder :context="[...context, key]" />
					</p>
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'buttons'">
				<template v-for="(button, index) in effect" :key="button">
					<p :style="`margin-left: ${(depth + 1) * 15}px;`" @click="currentEffect = (button as any as ButtonInteraction); currentContext = [...context, 'buttons', index.toString()]">
						<NodeHeader :type="key" :additional-text="(button as any as ButtonInteraction).label" />
					</p>
					<TreeRoot :data="(button as any as ButtonInteraction)" :depth="depth + 1" root-type="button" :context="[...context, index.toString(), key]" />
				</template>
			</template>
			<template v-if="(key as EffectKey) === 'attacks'">
				<template v-for="(attack, index) in effect" :key="attack">
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
