<script setup lang="ts">
import { useRoute } from "vue-router";
import { nextTick, onMounted, ref, watch } from "vue";

import markdownit from "markdown-it";
import anchor from "markdown-it-anchor";
// @ts-expect-error untyped
import markdownItAttrs from "markdown-it-attrs";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";

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
				const bodyStyles = document.body.style;
				const yOffset = Number.parseFloat(bodyStyles.getPropertyValue("--breadcrumbs-height")) + Number.parseFloat(bodyStyles.getPropertyValue("--navbar-height"));
				const y = el.getBoundingClientRect().y - 50 - yOffset + window.scrollY;
				window.scrollTo({ top: y, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
			}
		}).catch(() => {});
	},
	{ immediate: true }
);
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: $route.name as string ?? 'Name not found',
				isCurrent: true
			}
		]"
		:is-less-wide="true"
	/>
	<div class="content markdown less-wide" v-html="md.render(dataFile)" />
</template>
