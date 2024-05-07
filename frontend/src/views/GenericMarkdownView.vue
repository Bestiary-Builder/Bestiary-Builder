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
	<div class="content markdown less-wide" v-html="md.render(dataFile)" />
</template>

<script setup lang="ts">
import Breadcrumbs from "@/components/Breadcrumbs.vue";

import {useRoute} from "vue-router";
import {ref, watch, nextTick} from "vue";

import markdownit from "markdown-it";
import anchor from "markdown-it-anchor";
// @ts-ignore
import markdownItAttrs from "markdown-it-attrs";

const dataFile = ref("");
const route = useRoute();
const props = defineProps<{filePath: string}>();

const md = markdownit();
md.use(markdownItAttrs);
md.use(anchor, {
	permalink: anchor.permalink.linkInsideHeader({
		placement: "before",
		ariaHidden: true
	})
});

watch(
	() => route.fullPath,
	() => {
		import(`../assets/documents/${props.filePath}.md`).then(async (doc) => {
			dataFile.value = doc.default;

			if (!route.hash) return;
			await nextTick();
			const el = document.getElementById(route.hash.replace("#", ""));
			if (el) {
				const bodyStyles = document.body.style;
				const yOffset = parseFloat(bodyStyles.getPropertyValue("--breadcrumbs-height")) + parseFloat(bodyStyles.getPropertyValue("--navbar-height"));
				const y = el.getBoundingClientRect().top + yOffset + 50 + (window.scrollY - 263);
				window.scrollTo({top: y, behavior: "smooth"});
			}
		});
	},
	{immediate: true}
);
</script>
