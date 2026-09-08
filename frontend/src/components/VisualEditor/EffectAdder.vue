<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction, AttackModel, ButtonInteraction, EffectWithTarget, Features } from "~/shared";
import { Icon } from "@iconify/vue";
import { computed, inject, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { activation_type, defaultNodes, displayNames } from "./util";

const props = defineProps<{ context: string[]; name?: string; depth?: number }>();
const isOpen = ref(false);
const $route = useRoute();
const type = $route.params.type as keyof Features;
const computedContext = computed(() => {
	// a button, attack, or root node defines the current context that the automation runs in.
	// Thus, we consider the relevant context up to when we reach one of these three.
	// The relevant context determines which nodes can be added. For example, a damage node can only be added nested within a target node,
	// while a remove_ieffect node is only available within a button

	// work our way back up the tree as we stop when we reach the first context level
	const ctx = [...props.context].reverse();
	// node determining context
	let isTargetContext = false;

	// context levels
	let contextLevel: "root" | "attacks" | "buttons" = "root";

	for (const node of ctx) {
		if (node === "$target")
			isTargetContext = true;

		if (node === "buttons") {
			contextLevel = "buttons";
			break;
		}
		if (node === "attacks") {
			contextLevel = "attacks";
			break;
		}
	}

	return {
		isTargetContext,
		contextLevel
	};
});

const availableNodes = computed(() => {
	const { isTargetContext, contextLevel } = computedContext.value;
	let output: string[] = []
	if (!isTargetContext)
		output = ["target", "roll", "text", "variable", "condition", "counter", "spell"];
	if (isTargetContext)
		output = ["attack", "save", "damage", "temphp", "ieffect2", "roll", "text", "variable", "condition", "counter", "check",];
	if (!isTargetContext && contextLevel !== "buttons")
		output.push(...["__divider__", "__header__Presets", "basicAttack", "saveForHalfDamage", "saveForHalfDamageWithRecharge", "attackWithPoison", "attackWithGrappleRestrain"])
	if (isTargetContext && contextLevel !== "buttons")
		output.push(...["__divider__", "__header__Button Presets", "proneButton", "rechargeButton", "damageStartOfTurnButton"])
	if (!isTargetContext && contextLevel === "buttons")
		output.splice(6, 1, "remove_ieffect")
	if (isTargetContext && contextLevel === "buttons")
		output.splice(5, 0, "remove_ieffect")

	return output;
});

const automation = inject<Ref<null | AttackModel | AttackModel[]>>("automation");
const currentEffect = inject<Ref<EffectWithTarget | ButtonInteraction | AttackInteraction>>("currentEffect");
const addAndSelect = async (node: string) => {
	// traverse through the tree.
	if (!automation)
		return;
	if (!automation.value) {
		automation.value = { _v: 2, name: props.name || "New Attack", automation: [JSON.parse(JSON.stringify(defaultNodes[node]))], activation_type: activation_type[type] };
		return;
	}

	let tree: any;
	if (Array.isArray(automation.value))
		tree = automation.value[Number.parseInt(props.context[0])].automation;
	else
		tree = automation.value.automation;

	for (const [idx, key] of props.context.entries()) {
		const isArrayIndex = /^\d+$/.test(key);
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
	try {
		const toAdd = defaultNodes[node]
		if (Array.isArray(toAdd)) {
			tree.push(...JSON.parse(JSON.stringify(toAdd)));
			currentEffect!.value = tree[tree.length - toAdd.length];
		} else {
			tree.push(JSON.parse(JSON.stringify(toAdd)));
			currentEffect!.value = tree[tree.length - 1];
		}

		isOpen.value = false;
	}
	catch (e) {
		console.error(e);
	}
};

const showControls = inject<Ref<boolean>>("showControls");

const search = ref('')
const menuOpen = ref(false)
const highlightedIndex = ref(0)

const btnRef = useTemplateRef("btnRef")
const searchFieldRef = useTemplateRef("searchFieldRef")
const listRef = useTemplateRef("listRef")



const HEADER_PREFIX = '__header__'
const DIVIDER_TOKEN = '__divider__'

const isHeader = (node: string) => node.startsWith(HEADER_PREFIX)
const isDivider = (node: string) => node === DIVIDER_TOKEN
const isSelectable = (node: string) => !isHeader(node) && !isDivider(node)
const headerTitle = (node: string) => node.slice(HEADER_PREFIX.length)

const filteredNodes = computed(() => {
	const q = search.value.toLowerCase()
	const result = []
	let pendingHeader = null
	let pendingDivider = false

	for (const node of availableNodes.value) {
		if (isHeader(node)) {
			pendingHeader = node
			continue
		}
		if (isDivider(node)) {
			pendingDivider = true
			continue
		}

		const matches = displayNames[node]?.label.toLowerCase().includes(q)
		if (!matches) continue

		if (pendingDivider && result.length) {
			result.push(DIVIDER_TOKEN)
			pendingDivider = false
		}
		if (pendingHeader) {
			result.push(pendingHeader)
			pendingHeader = null
		}
		result.push(node)
	}
	return result
})

// whenever the filtered results change, the first match becomes highlighted —
// this is what makes plain "type + Enter" select the top result
watch(filteredNodes, () => {
	highlightedIndex.value = 0
})

const onMenuToggle = (isOpen: boolean) => {
	if (isOpen) {
		search.value = ''
		highlightedIndex.value = 0
		nextTick(() => searchFieldRef.value?.focus())
	}
}

const scrollToHighlighted = () => {
	nextTick(() => {
		const activeEl = listRef.value?.$el.querySelector('.v-list-item--active')
		activeEl?.scrollIntoView({ block: 'nearest' })
	})
}

const moveHighlight = (delta: number) => {
	const max = filteredNodes.value.length - 1
	if (max < 0) return
	highlightedIndex.value = Math.min(Math.max(highlightedIndex.value + delta, 0), max)
	scrollToHighlighted()
}
const selectNode = (node: string) => {
	addAndSelect(node)
	menuOpen.value = false
	nextTick(() => btnRef.value?.focus())
}

const onKeydown = (e: KeyboardEvent) => {
	switch (e.key) {
		case 'ArrowDown':
			e.preventDefault()
			moveHighlight(1)
			break
		case 'ArrowUp':
			e.preventDefault()
			moveHighlight(-1)
			break
		case 'Enter':
			e.preventDefault()
			if (filteredNodes.value[highlightedIndex.value]) {
				selectNode(filteredNodes.value[highlightedIndex.value])
			}
			break
		case 'Escape':
			menuOpen.value = false
			nextTick(() => btnRef.value?.focus())
			break
	}
}

</script>

<template>
	<DropdownMenu v-model="menuOpen" :close-on-content-click="false" @update:model-value="onMenuToggle" :scrim="false"
		v-if="showControls">
		<template #activator="{ props }">
			<p class="tree-row" v-bind="props" :style="`--depth: ${depth}`"
				style="color: rgb(var(--v-theme-surface-bright));" ref="btnRef">
				<span class="icon">
					<Icon icon="mdi:plus-circle" width="1em" color="rgb(var(--v-theme-primary))" />
				</span><span>{{ automation === null ? 'Create Automation' : 'Add Effect' }}</span>
			</p>
		</template>

		<v-card border class="pa-1">
			<v-card-text class="pb-0">
				<v-text-field ref="searchFieldRef" v-model="search" density="compact" variant="plain" hide-details
					placeholder="Search..." persistent-placeholder @keydown="onKeydown" autofocus />
			</v-card-text>

			<v-list ref="listRef" max-height="300" class="overflow-y-auto">
				<template v-for="(node, index) in filteredNodes" :key="node + '-' + index">
					<v-list-subheader v-if="isHeader(node)">{{ headerTitle(node) }}</v-list-subheader>
					<v-divider v-else-if="isDivider(node)" />
					<v-list-item v-else :title="displayNames[node]?.label" :prepend-icon="displayNames[node]?.icon"
						:active="index === highlightedIndex" @click="selectNode(node)"
						@mouseenter="highlightedIndex = index" />
				</template>
				<v-list-item v-if="!filteredNodes.length" title="No matches" disabled />
			</v-list>
		</v-card>
	</DropdownMenu>
</template>

<style scoped lang="less">
button {
	width: 100%;
	color: rgb(var(--v-theme-primary));
}

.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.5rem;
}
</style>