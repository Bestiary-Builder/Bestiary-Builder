<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Help',
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
const md = markdownit({html: true, linkify: true, typographer: true});
import dataFile from "@/assets/documents/help.md";
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
