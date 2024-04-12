<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Privacy Policy',
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
// @ts-ignore
import markdownit from "markdown-it";
const md = markdownit();
import dataFile from "@/assets/documents/privacy-policy.md";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile)
		};
	},
	components: {
		Breadcrumbs
	}
});
</script>
