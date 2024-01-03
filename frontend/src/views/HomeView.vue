<template>
<Breadcrumbs
:routes="[
	{
		path: '',
		text: 'Home',
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
const md = markdownit({html: true, linkify: true, typographer: true});
import dataFile from "@/assets/home.md";
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
