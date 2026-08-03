<script setup lang="ts">
import type { AutomationDocumentation } from "~/shared";
import { computed, onMounted, ref } from "vue";
import { useFetch } from "@/utils/utils";
import { defaultNodes } from "../VisualEditor/util";

// Documentation helpers
const docu = ref<AutomationDocumentation>({});
const selectedDocu = ref("");
onMounted(async () => {
	const { success, data } = await useFetch<AutomationDocumentation>("/api/automationDocumentation");
	if (success)
		docu.value = data;
});

const currentDocu = computed(() => {
	if (!selectedDocu.value)
		return;
	return docu.value[selectedDocu.value];
});
</script>

<template>
	<div class="documentation-container">
		<h3> Documentation</h3>
		<p> Select documentation to view:</p>
		<div>
			<select v-model="selectedDocu" class="ghost">
				<option v-for="key of Object.keys(defaultNodes)">
					{{ key }}
				</option>
			</select>
		</div>
		<div v-if="currentDocu" class="docs">
			<hr>
			<h3>Documentation: {{ selectedDocu }}</h3>
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
</template>

<style>
.docs a {
	color: orangered;
}

.documentation-container {
	margin-top: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.highlight {
	color: orangered;
	border-left: 3px solid orangered;
	padding: 3px;
}
</style>
