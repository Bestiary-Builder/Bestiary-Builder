<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: $route.name as string ?? 'Name not found',
				isCurrent: true
			}
		]"
		:isLessWide="true"
	/> 
	<div class="content markdown less-wide">
		<Markdown v-if="dataFile" :text="dataFile"/>
	</div>
</template>

<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import Markdown from "@/components/Markdown.vue";
import { useRoute } from "vue-router";
import { ref, watch } from "vue";

const dataFile = ref('');
const route = useRoute();
const props = defineProps<{filePath: string}>();

watch(() => route.fullPath, () => {
	import(`../assets/documents/${props.filePath}.md`).then(doc => { 
		dataFile.value = doc.default;
	})
}, { immediate: true});
</script>