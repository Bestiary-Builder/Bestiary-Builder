<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, EffectKey, EffectWithTarget, IEffect, Target } from "~/shared";
import { Icon } from "@iconify/vue";
import { computed, inject, mergeProps, ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { capitalizeFirstLetter } from "~/shared";
import EffectAdder from "./EffectAdder.vue";
import NodeHeader from "./Nodes/shared/NodeHeader.vue";
import TreeRoot from "./TreeRoot.vue";

import { deepKeys, draggingProps } from "./util";

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

		return target.toString().substring(0, 99).trim().replace("caster.name", "Caster").replace("target.name", "Target");
	}
	return "";
});

const showControls = inject<Ref<boolean>>("showControls");

</script>

<template>
	<div class="tree-node">
		<p class="drag-area tree-row" :style="`--depth: ${depth}`"
			@click="currentEffect = data; currentContext = context">
			<NodeHeader :type="selfType" :additional-text="additionalText" :is-current="isCurrentSelectedContext" />
			<span v-if="showControls" class="tree-buttons">
				<v-tooltip text="Drag to move this node">
					<template #activator="{ props: dropdownProps }">
						<Icon icon="material-symbols:drag-indicator" inline width=".75em"
							class="no-focus-outline drag-handle" v-bind="dropdownProps" @click.stop />
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
					<v-card class="text-center pb-2"
						:subtitle="`Are you sure you want to delete this ${selfType} Effect?`">
						<v-card-text>
							<v-btn color="error" class="w-100" @click="deleteNode"> Delete </v-btn>
						</v-card-text>
					</v-card>
				</DropdownMenu>

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
					<p v-if="!['root', 'effects'].includes(key)" :key="key" :style="`--depth: ${depth + 1}`"
						style="color: rgb(var(--v-theme-surface-bright));" class="tree-row section-node"
						@click.stop="toggleBranch(key)">
						<NodeHeader :type="key" />
						<span v-if="['onTrue', 'onFalse', 'hit', 'miss', 'fail', 'success'].includes(key)"
							class="collapse-button">
							<Icon icon="solar:alt-arrow-right-bold" inline width=".75em"
								:rotate="branchesCollapsed.includes(key) ? 0 : 45" class="ml-1" />
						</span>
					</p>
					<template v-if="!branchesCollapsed.includes(key)">
						<VueDraggable v-model="(data as any)[key]" v-bind="draggingProps"
							:style="`--depth: ${depth + (!['root', 'effects'].includes(key) ? 2 : 1)}`">
							<TreeNode v-for="(childNode, index) in effect" :key="childNode as any"
								:data="childNode as any" :depth="depth + (!['root', 'effects'].includes(key) ? 2 : 1)"
								:parent-type="key" :context="[...context, `$${selfType}`, key, index.toString()]" />
							<EffectAdder :context="[...context, `$${selfType}`, key]"
								:depth="depth + (!['root', 'effects'].includes(key) ? 2 : 1)" />
						</VueDraggable>
					</template>
				</template>
				<template v-if="(key as EffectKey) === 'buttons'">
					<VueDraggable v-model="(data as any).buttons" v-bind="{ ...draggingProps, group: 'buttons' }"
						:style="`--depth: ${depth + 1}`">
						<div v-for="(button, index) in effect" :key="index" class="button-item">
							<p class="tree-row" :style="`--depth: ${depth + 1}`"
								@click="currentEffect = (button as any as ButtonInteraction); currentContext = [...context, 'buttons', index.toString()]">
								<NodeHeader :type="key"
									:additional-text="(button as any as ButtonInteraction).label.trim()"
									:is-current="JSON.stringify(currentContext) === JSON.stringify([...context, 'buttons', index.toString()])" />
								<span class="tree-buttons">
									<DropdownMenu>
										<template #activator="{ props: menuProps }">
											<v-tooltip text="Delete this node">
												<template #activator="{ props: tooltipProps }">
													<Icon icon="mdi:trash" inline width=".75em"
														v-bind="mergeProps(menuProps, tooltipProps)"
														class="no-focus-outline" />
												</template>
											</v-tooltip>
										</template>
										<v-card class="text-center pb-2"
											:subtitle="`Are you sure you want to delete ${(button as ButtonInteraction).label}?`">
											<v-card-text>
												<v-btn color="error" class="w-100"
													@click="(data as IEffect).buttons?.splice(index as number, 1)">
													Delete </v-btn>
											</v-card-text>
										</v-card>
									</DropdownMenu>
								</span>
							</p>
							<TreeRoot :data="(button as any as AttackModel)" :depth="depth + 2" root-type="button"
								:context="[...context, 'buttons', index.toString(), 'automation']" />
						</div>
					</VueDraggable>
				</template>
				<template v-if="(key as EffectKey) === 'attacks'">
					<VueDraggable v-model="(data as any).attacks" v-bind="{ ...draggingProps, group: 'attacks' }"
						:style="`--depth: ${depth + 1}`">
						<div v-for="(attack, index) in effect" :key="index" class="attack-item">
							<p class="tree-row" :style="`--depth: ${depth + 1}`"
								@click="currentEffect = (attack as any as AttackInteraction); currentContext = [...context, 'attacks', index.toString()]">
								<NodeHeader :type="key"
									:additional-text="(attack as any as AttackInteraction).attack.name.trim()"
									:is-current="JSON.stringify(currentContext) === JSON.stringify([...context, 'attacks', index.toString()])" />

								<span class="tree-buttons">
									<DropdownMenu>
										<template #activator="{ props: menuProps }">
											<v-tooltip text="Delete this node">
												<template #activator="{ props: tooltipProps }">
													<Icon icon="mdi:trash" inline width=".75em"
														v-bind="mergeProps(menuProps, tooltipProps)"
														class="no-focus-outline" />
												</template>
											</v-tooltip>
										</template>
										<v-card class="text-center pb-2"
											:subtitle="`Are you sure you want to delete ${(attack as AttackInteraction).attack.name}?`">
											<v-card-text>
												<v-btn color="error" class="w-100"
													@click="(data as IEffect).attacks?.splice(index as number, 1)">
													Delete </v-btn>
											</v-card-text>
										</v-card>
									</DropdownMenu>
								</span>

							</p>
							<TreeRoot :data="((attack) as AttackInteraction).attack" :depth="depth + 2"
								root-type="attack"
								:context="[...context, 'attacks', index.toString(), 'attack', 'automation']" />
						</div>
					</VueDraggable>
				</template>
			</template>
		</div>
	</div>
</template>

<style scoped>
/* p:has(.drag-ghost) {
	background-color: blue !important;
} */
</style>
