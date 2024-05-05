<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Changelog',
				isCurrent: true
			}
		]"
		:isLessWide="true"
	/>

	<div class="content markdown less-wide">
		<Markdown :text="dataFile" />
	</div>
</template>

<script setup lang="ts">
import dataFile from "@/assets/documents/changelog.md";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import Markdown from "@/components/Markdown.vue";
</script>
