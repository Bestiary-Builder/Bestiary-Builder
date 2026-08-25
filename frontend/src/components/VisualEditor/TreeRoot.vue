<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackModel, EffectWithTarget } from "~/shared";
import { Icon } from "@iconify/vue";
import { inject } from "vue";
import EffectAdder from "./EffectAdder.vue";
import TreeNode from "./TreeNode.vue";
import { VueDraggable } from "vue-draggable-plus";
import { draggingProps } from "./util.js";

const { data, depth = 0, parentType = "root", rootType = "root", context = ["root"], noListAttack = false } = defineProps<{ data: AttackModel | AttackModel[]; depth?: number; parentType?: string; rootType?: "root" | "button" | "attack"; context?: string[]; noListAttack?: boolean }>();

const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const makeListAttack = () => {
	if (Array.isArray(data) || !automation || rootType !== "root")
		return;
	const currentAttack = data;
	automation.value = [currentAttack, { _v: 2, name: "New Attack", automation: [] }];
};

const addListAttack = () => {
	if (!automation || !automation.value || !Array.isArray(automation.value))
		return;

	automation.value.push({ _v: 2, name: "New Attack", automation: [] });
};

const deleteListAttack = (index: number) => {
	if (!automation || !automation.value || !Array.isArray(automation.value))
		return;

	automation.value.splice(index, 1);
	if (automation.value.length === 1)
		automation.value = automation.value[0];
};

const setAutomationEmpty = () => {
	if (automation)
		automation.value = null;
};

const currentEffect = inject<Ref<EffectWithTarget | AttackModel>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");

const showControls = inject<Ref<boolean>>("showControls")
</script>

<template>
	<section :class="{ container: rootType === 'root' }">
		<template v-if="Array.isArray(data)">
			<template v-for="auto, index in data" :key="index">
				<p v-if="rootType === 'root'" class="add root tree-row"
					@click="currentEffect = data[index]; currentContext = [index.toString(), ...context]">
					<Icon
						:icon="JSON.stringify(currentContext) === JSON.stringify([index.toString(), ...context]) ? 'material-symbols:asterisk' : 'material-symbols:swords'"
						:inline="true" width="1em"
						:color="JSON.stringify(currentContext) === JSON.stringify([index.toString(), ...context]) ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-surface-bright))'" />
					{{ auto.name }}
					<span class="tree-buttons" @click.stop v-if="showControls">
						<DropdownMenu>
							<template #activator="{ props }">
								<Icon icon="mdi:trash" inline width=".75em" role="button" class="trigger"
									color="rgb(var(--v-theme-surface-bright))" v-bind="props" />
							</template>
							<v-card min-width="300" class="text-center pb-2">
								<v-card-text>
									Are you sure you want to delete <br><b>{{ auto.name }}</b>?
								</v-card-text>
								<v-card-actions>
									<v-btn color="red" size="large" @click="deleteListAttack(index)" class="mx-auto">
										Confirm
									</v-btn>
								</v-card-actions>
							</v-card>
						</DropdownMenu>
					</span>
				</p>
				<VueDraggable v-model="auto.automation" v-bind="draggingProps" :style="`--depth: ${depth}`">
					<TreeNode v-for="(node, idx) in auto.automation ?? []" :key="(node as any)" :data="node"
						:depth="depth" :parent-type="parentType" :context="[...context, idx.toString()]" />
					<EffectAdder :context="[index.toString(), ...context]" />

				</VueDraggable>
			</template>
			<p v-if="!noListAttack && rootType === 'root' && showControls" style="--depth: 0" class="tree-row"
				@click="addListAttack()">
				Add Attack to this feature
			</p>
		</template>
		<template v-else>
			<p v-if="rootType === 'root'" class="add root tree-row"
				@click="currentEffect = data; currentContext = [...context]">
				<Icon
					:icon="JSON.stringify(currentContext) === JSON.stringify(context) ? 'material-symbols:asterisk' : 'material-symbols:swords'"
					:inline="true" width="1em"
					:color="JSON.stringify(currentContext) === JSON.stringify(context) ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-surface-bright))'" />
				{{ data.name }}
				<span class="tree-buttons" @click.stop v-if="showControls">
					<DropdownMenu>
						<template #activator="{ props }">
							<Icon icon="mdi:trash" inline width=".75em" role="button" class="trigger"
								color="rgb(var(--v-theme-surface-bright))" v-bind="props" />
						</template>
						<v-card min-width="300" class="text-center pb-2">
							<v-card-text>
								Are you sure you want to delete <br><b>{{ data.name }}</b>?
							</v-card-text>
							<v-card-actions>
								<v-btn color="red" size="large" @click="setAutomationEmpty" class="mx-auto">
									Confirm
								</v-btn>
							</v-card-actions>
						</v-card>
					</DropdownMenu>
				</span>
			</p>
			<VueDraggable v-model="data.automation" v-bind="draggingProps" :style="`--depth: ${depth}`">
				<TreeNode v-for="(node, idx) in data.automation ?? []" :key="(node as any)" :data="node" :depth="depth"
					:parent-type="parentType" :context="[...context, idx.toString()]" />
				<EffectAdder :context="context" :depth="depth" />
			</VueDraggable>
			<p v-if="!noListAttack && rootType === 'root' && showControls" style="--depth: 0" class="tree-row"
				@click="makeListAttack()">
				Add Attack to this feature
			</p>
		</template>
	</section>
</template>

<style scoped lang="less">
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
		color: color-mix(in srgb, currentcolor, white);
	}
}

.root {
	color: rgb(var(--v-theme-primary));
	margin-bottom: 0.2rem;
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
	transform: translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
	position: absolute;
}
</style>

<style lang="less">
@import url("./tree-row.less");
</style>
