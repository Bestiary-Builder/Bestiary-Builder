<script setup lang="ts">
import type MarkdownIt from "markdown-it";
import markdownit from "markdown-it";
import anchor from "markdown-it-anchor";

const props = withDefaults(
	defineProps<{
		text: string;
		tag?: string | undefined;
		options?: MarkdownIt.Options | undefined;
		anchorLinks?: boolean;
	}>(),
	{ tag: "div", options: undefined, anchorLinks: false }
);

const md = markdownit(props.options ?? {});

if (props.anchorLinks) {
	md.use(anchor, {
		permalink: anchor.permalink.linkInsideHeader({
			placement: "before",
			ariaHidden: true,

		})
	});
}
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
	<component :is="tag" class="markdown" v-html="md.render(text, options)" />
</template>
