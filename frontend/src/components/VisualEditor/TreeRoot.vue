<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackModel, EffectWithTarget } from "~/shared";
import { Icon } from "@iconify/vue";
import { inject } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import EffectAdder from "./EffectAdder.vue";
import TreeNode from "./TreeNode.vue";
import { draggingProps } from "./util";

const { data, noListAttack = false } = defineProps<{ data: AttackModel | AttackModel[]; noListAttack?: boolean }>();

const emit = defineEmits<{
	emptyAutomation: [];
}>();

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

const deleteListAttack = (index: number) => {
	if (!automation || !automation.value || !Array.isArray(automation.value))
		return;

	automation.value.splice(index, 1);
	if (automation.value.length === 1)
		automation.value = automation.value[0];

	currentContext!.value = [];
	currentEffect!.value = null;
};

const setAutomationEmpty = () => {
	emit("emptyAutomation");
	currentContext!.value = [];
	currentEffect!.value = null;
};

const currentEffect = inject<Ref<EffectWithTarget | AttackModel | null>>("currentEffect");
const currentContext = inject<Ref<string[]>>("currentContext");

const showControls = inject<Ref<boolean>>("showControls");
</script>

<template>
	<section class="container">
		<template v-if="Array.isArray(data)">
			<template v-for="auto, index in data" :key="index">
				<p
					class="add root tree-row"
					@click="currentEffect = data[index]; currentContext = [index.toString(), 'root']"
				>
					<Icon
						:icon="JSON.stringify(currentContext) === JSON.stringify([index.toString(), 'root']) ? 'material-symbols:asterisk' : 'material-symbols:swords'"
						:inline="true" width="1em"
						:color="JSON.stringify(currentContext) === JSON.stringify([index.toString(), 'root']) ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-primary))'"
					/>
					{{ auto.name || "Unnamed Attack" }}
					<span v-if="showControls" class="tree-buttons" @click.stop>
						<DropdownMenu>
							<template #activator="{ props }">
								<Icon
									icon="mdi:trash" inline width=".75em" role="button" class="trigger" color="gray"
									v-bind="props"
								/>
							</template>
							<v-card min-width="300" class="text-center pb-2">
								<v-card-text>
									Are you sure you want to delete <br><b>{{ auto.name }}</b>?
								</v-card-text>
								<v-card-actions>
									<v-btn color="error" size="large" class="mx-auto" @click="deleteListAttack(index)">
										Confirm
									</v-btn>
								</v-card-actions>
							</v-card>
						</DropdownMenu>
					</span>
				</p>
				<VueDraggable v-model="auto.automation" v-bind="draggingProps" :style="`--depth: ${0}`">
					<TreeNode
						v-for="(node, idx) in auto.automation ?? []" :key="(node as any)" :data="node" :depth="0"
						:context="[index.toString(), 'root', idx.toString()]"
					/>
					<EffectAdder :context="[index.toString(), 'root']" />
				</VueDraggable>
			</template>
			<p v-if="!noListAttack && showControls" style="--depth: 0" class="tree-row" @click="addListAttack()">
				Add Attack to this feature
			</p>
		</template>
		<template v-else>
			<p class="add root tree-row" @click="currentEffect = data; currentContext = ['root']">
				<Icon
					:icon="JSON.stringify(currentContext) === JSON.stringify(['root']) ? 'material-symbols:asterisk' : 'material-symbols:swords'"
					:inline="true" width="1em"
					:color="JSON.stringify(currentContext) === JSON.stringify(['root']) ? 'rgb(var(--v-theme-success))' : 'rgb(var(--v-theme-primary))'"
				/>
				{{ data.name || "Unnamed Attack" }}
				<span v-if="showControls" class="tree-buttons" @click.stop>
					<DropdownMenu>
						<template #activator="{ props }">
							<Icon
								icon="mdi:trash" inline width=".75em" role="button" class="trigger" color="gray"
								v-bind="props"
							/>
						</template>
						<v-card min-width="300" class="text-center pb-2">
							<v-card-text>
								Are you sure you want to delete <br><b>{{ data.name }}</b>?
							</v-card-text>
							<v-card-actions>
								<v-btn color="error" size="large" class="mx-auto" @click="setAutomationEmpty">
									Confirm
								</v-btn>
							</v-card-actions>
						</v-card>
					</DropdownMenu>
				</span>
			</p>
			<VueDraggable v-model="data.automation" v-bind="draggingProps" :style="`--depth: ${0}`">
				<TreeNode
					v-for="(node, idx) in data.automation ?? []" :key="(node as any)" :data="node" :depth="0"
					:context="['root', idx.toString()]"
				/>
				<EffectAdder :context="['root']" :depth="0" />
			</VueDraggable>

			<p v-if="!noListAttack && showControls" style="--depth: 0" class="tree-row" @click="makeListAttack()">
				Add Attack to this feature
			</p>
		</template>
	</section>
</template>

<style scoped lang="less">
.container:first-of-type {
	padding: 0.4rem;
	background-color: rgb(var(--v-theme-surface));
	max-height: 55vh;
	overflow-y: scroll;
	scrollbar-gutter: stable;
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
</style>

<style lang="less">
@import url("./tree-row.less");
</style>
