<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { useFetch } from "@/utils/utils";
import type { AutomationDocumentation, AutomationDocumentationEntity } from "~/shared";

import Markdown from "@/components/Markdown.vue";

const { nodeType } = defineProps<{ nodeType: string | null }>();

const docu = ref<AutomationDocumentation>({});

onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const currentDocu = computed(() => {
	if (!nodeType)
		return null;
	return docu.value[nodeType] || null;
});
</script>

<template>
	<template v-if="nodeType && currentDocu">
		<div>
			<details>
				<summary> Show documentation</summary>
				<div class="docs-container">
					<div v-if="currentDocu" class="docs">
						<Markdown class="small" :text="currentDocu.desc" />
						<div>
							<hr>
							<h4>Overview</h4>
							See full documentation <a :href="`https://avrae.readthedocs.io/en/stable/automation_ref.html#${currentDocu.url}`" target="_blank">here</a>.
							<VueMonacoEditor
								v-if="currentDocu?.ts"
								:value="`// Values denoted with an ? are optional.\n${currentDocu.ts}`"
								theme="vs-dark"
								:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, automaticLayout: true, readOnly: true, scrollBeyondLastLine: false }"
								language="typescript"
								height="200px"
							/>
						</div>
						<div v-if="currentDocu?.opt">
							<hr>
							<h4>Options</h4>
							<ul>
								<li v-for="(info, name) in currentDocu.opt" :key="name">
									<span class="highlight">{{ name }}</span>
									<Markdown :text="info" />
								</li>
							</ul>
						</div>
						<div v-if="currentDocu?.variables">
							<hr>
							<h4>Exposed Variables</h4>
							<ul>
								<li v-for="(info, name) in currentDocu.variables" :key="name">
									<span class="highlight">{{ name }}</span>
									[<code>{{ info.type }}</code>]
									<Markdown :text="info.desc" />
								</li>
							</ul>
						</div>
					</div>
				</div>
			</details>
		</div>
	</template>
</template>

<style scoped>
a {
	color: orangered;
}

.highlight {
	color: orangered;
	border-left: 3px solid orangered;
	padding: 3px;
}

.docs-container {
	width: 100%;
}
summary {
	font-size: smaller;
}
</style>
