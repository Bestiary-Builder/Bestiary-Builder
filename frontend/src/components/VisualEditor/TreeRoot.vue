<script setup lang="ts">
import { type Ref, inject } from "vue";
import TreeNode from "./TreeNode.vue";
import EffectAdder from "./EffectAdder.vue";
import type { AttackModel, ButtonInteraction, EffectWithTarget } from "~/shared";

const { data, depth = 0, parentType = "root", rootType = "root", context = ["root"] } = defineProps<{ data: AttackModel | AttackModel[] | ButtonInteraction; depth?: number; parentType?: string; rootType?: "root" | "button" | "attack"; context?: string[] }>();

const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const makeListAttack = () => {
	if (Array.isArray(data) || !automation || rootType !== "root")
		return;
	const currentAttack = data;
	automation.value = [currentAttack as AttackModel, { _v: 2, name: "New Attack", automation: [] }];
};

const addListAttack = () => {
	if (!automation || !automation.value || !Array.isArray(automation.value))
		return;

	automation.value.push({ _v: 2, name: "New Attack", automation: [] });
};

const currentEffect = inject<Ref<EffectWithTarget | AttackModel | ButtonInteraction >>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");
</script>

<template>
	<section :class="{ container: rootType === 'root' }">
		<template v-if="Array.isArray(data)">
			<template v-for="auto, index in data" :key="index">
				<p v-if="rootType === 'root'" class="add" @click="currentEffect = data[index]; currentContext = [...context]">
					-{{ auto.name }}-
				</p>
				<TransitionGroup name="fade">
					<div v-for="(node, idx) in auto.automation ?? []" :key="idx">
						<TreeNode :data="node" :depth="depth" :parent-type="parentType" :context="[index.toString(), ...context, idx.toString()]" />
					</div>
				</TransitionGroup>
				<p :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`">
					<EffectAdder :context="[index.toString(), ...context]" />
				</p>
			</template>
			<p v-if="rootType === 'root'" :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`" class="add" @click="addListAttack()">
				Add Attack to this feature
			</p>
		</template>
		<template v-else>
			<p v-if="rootType === 'root'" class="add" @click="currentEffect = data; currentContext = [...context]">
				-Attack Root-
			</p>
			<TransitionGroup name="fade">
				<div v-for="(node, idx) in data.automation ?? []" :key="idx">
					<TreeNode :data="node" :depth="depth" :parent-type="parentType" :context="[...context, idx.toString()]" />
				</div>
			</TransitionGroup>
			<p :style="`background-color: var(--color-surface-0); margin-left: ${(depth + 1) * 15}px`">
				<EffectAdder :context="context" />
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

.fade-move,
.fade-enter-active,
.fade-leave-active {
	transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
	position: absolute;
}
</style>
