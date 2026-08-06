<script setup lang="ts">
import markdownit from "markdown-it";
import anchor from "markdown-it-anchor";

import markdownItAttrs from "markdown-it-attrs";
import { nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { prefersReducedMotion } from "@/utils/utils";

const props = defineProps<{ filePath: string }>();
const dataFile = ref("");
const route = useRoute();
const md = markdownit();
md.use(markdownItAttrs);
md.use(anchor, {
	permalink: anchor.permalink.linkInsideHeader({
		placement: "before",
		ariaHidden: true
	})
});

onMounted(() => {
	if (route.hash)
		window.scrollTo({ top: 0, behavior: "instant" });
});

watch(
	() => route.fullPath,
	async () => {
		import(`../assets/documents/${props.filePath}.md`).then(async (doc) => {
			dataFile.value = doc.default;
			if (!route.hash)
				return;
			await nextTick();
			const el = document.getElementById(route.hash.replace("#", ""));
			if (el) {
				const y = el.getBoundingClientRect().y - 50 + window.scrollY;
				window.scrollTo({ top: y, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
			}
		}).catch(() => { });
	},
	{ immediate: true }
);
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: $route.name as string ?? 'Name not found',
			isCurrent: true
		}
	]" :is-less-wide="true" />
	<div class="content markdown less-wide" v-html="md.render(dataFile)" />
</template>
