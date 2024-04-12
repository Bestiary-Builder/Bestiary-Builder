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
		<div v-if="content" v-html="content"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import markdownit from "markdown-it";
const md = markdownit();
import dataFile from "@/assets/terms-and-conditions.md";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile)
		};
	}
});
</script>
