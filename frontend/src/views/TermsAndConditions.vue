<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Terms and Conditions',
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
import dataFile from "@/assets/documents/terms-and-conditions.md";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import Markdown from "@/components/Markdown.vue";
</script>

