<script setup lang="ts">
import type { AttackModel, ButtonInteraction, EffectWithTarget } from "~/shared";
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue";
import EffectAdder from "./EffectAdder.vue";
import NodeHelper from "./NodeHelper.vue";
import AutomationDocumentation from "./Nodes/shared/AutomationDocumentation.vue";
import EffectAsRaw from "./Nodes/shared/EffectAsRaw.vue";
import SectionHeader from "./Nodes/shared/SectionHeader.vue";
import TreeRoot from "./TreeRoot.vue";
import type * as Monaco from 'monaco-editor'
import { loader } from '@guolao/vue-monaco-editor';
import { automationContextHints, AliasAPIClasses, AliasAPIInstances } from '~/shared'


const { name, noListAttack = false } = defineProps<{ name: string; noListAttack?: boolean }>();
const currentEffect = ref<EffectWithTarget | AttackModel | ButtonInteraction | null>(null);
const currentContext = ref<string[]>([]);
provide("currentEffect", currentEffect);
provide("currentContext", currentContext);

defineExpose<{ currentEffect: any; currentContext: any }>({ currentEffect, currentContext });

const automation = defineModel<null | AttackModel | AttackModel[]>();
provide("automation", ref(automation));
const currentNode = computed(() => {
	if (!currentEffect.value)
		return null;
	if (currentContext.value[0] === "root" && currentContext.value.length === 1)
		return "noderoot";
	if (currentContext.value[currentContext.value.length - 2] === "buttons")
		return "buttonroot";
	if (currentContext.value[currentContext.value.length - 2] === "attacks")
		return "attackroot";
	if (currentContext.value.length === 2 && currentContext.value[1] === "root")
		return "noderoot";
	if (Object.hasOwn(currentEffect.value, "type"))
		// @ts-expect-error Yes it fucking does
		return currentEffect.value.type;

	return "";
});

const showControls = ref(true);
provide("showControls", showControls);



let providerDisposable: Monaco.IDisposable | undefined

const registerProvider = (monaco: typeof Monaco) => {
	providerDisposable = monaco.languages.registerCompletionItemProvider('python', {
		triggerCharacters: ['.'],
		provideCompletionItems: (model, position) => {
			const word = model.getWordUntilPosition(position)
			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: word.startColumn,
				endColumn: word.endColumn,
			}

			const textBeforeCursor = model.getValueInRange({
				startLineNumber: position.lineNumber,
				startColumn: 1,
				endLineNumber: position.lineNumber,
				endColumn: position.column,
			})

			const memberAccessMatch = textBeforeCursor.match(/([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\.\w*$/)

			if (memberAccessMatch) {
				const [rootName, ...path] = memberAccessMatch[1].split('.')
				let currentClassName: string | undefined = AliasAPIInstances[rootName]

				for (const propName of path) {
					const propDef: any = currentClassName && AliasAPIClasses[currentClassName]?.properties.find((p) => p.name === propName)
					currentClassName = propDef && AliasAPIClasses[propDef.type] ? propDef.type : undefined
				}

				const classDef = currentClassName ? AliasAPIClasses[currentClassName] : undefined
				if (!classDef) return { suggestions: [] }

				const suggestions = classDef.properties.map((prop) => ({
					label: prop.name,
					kind: monaco.languages.CompletionItemKind.Property,
					detail: `${currentClassName}.${prop.name}: ${prop.type}`,
					documentation: prop.doc,
					insertText: prop.name,
					range,
				}))

				return { suggestions }
			}

			const suggestions = automationContextHints.map((v) => ({
				label: v.name,
				kind: monaco.languages.CompletionItemKind.Variable,
				detail: `${v.detail}`,
				documentation: v.doc,
				insertText: v.name,
				range,
			}))

			return { suggestions }
		},
	})
}

onMounted(async () => {
	const monaco = await loader.init()
	registerProvider(monaco)
})

onBeforeUnmount(() => {
	providerDisposable?.dispose()
})
</script>

<template>
	<section class="two-wide uneven">
		<div class="tree">
			<SectionHeader title="Effect Tree" />
			<TreeRoot v-if="automation" :data="automation" :depth="0" :no-list-attack="noListAttack" />
			<p v-else class="container" style="padding: 6px">
				<EffectAdder :context="['root']" :name="name" />
			</p>
			<v-btn class="pl-2" variant="text" size="x-small" @click="showControls = !showControls">
				<small> <i>{{ showControls ? 'Hide' : 'Show' }} controls</i></small>
			</v-btn>
		</div>
		<div class="editor">
			<div v-if="!currentEffect && currentContext.length === 0">
				<SectionHeader title="No Effect Selected" />
				Select or create a node in the Effect Tree to get started.
				<img :src="['/Devourer.png', '/Beholder.webp', '/Flumph.png'][Math.floor(Math.random() * 3)]"
					style="max-width: 200px; transform: scale(-1, 1); margin-top: 2rem">
			</div>
			<template v-else>
				<Transition>
					<NodeHelper v-if="currentEffect" :key="currentContext.toString()" :node="currentNode" />
				</Transition>
				<hr>
				<Transition>
					<AutomationDocumentation :key="currentContext.toString()" :node-type="currentNode" />
				</Transition>
				<Transition>
					<EffectAsRaw :current-effect />
				</Transition>
			</template>
		</div>
	</section>
</template>

<style scoped lang="less">
.tree {
	min-width: 25rem;
}

.v-enter-active {
	transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

h3 {
	margin-bottom: 0.25rem;
}

section {
	background-color: rgb(var(--v-theme-surface-light));
	min-height: 800px;
	padding: 1rem;
	border-radius: 6px;
	box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
}

.container {
	min-height: 800px;
	border-radius: 6px;
	box-shadow: rgb(0 0 0 / 24%) 0 3px 8px;
	background-color: rgb(var(--v-theme-surface));
}

.two-wide.uneven {
	width: 100%;
	display: grid;
	gap: 0 1rem;
	margin-bottom: 1rem;
	grid-template-columns: 1fr 2fr;
}

@media screen and (width <=1200px) {
	.two-wide.two-wide.uneven {
		grid-template-columns: 1fr;
	}

	section,
	.container {
		min-height: unset;
	}
}
</style>
