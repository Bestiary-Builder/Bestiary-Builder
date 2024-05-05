<template>
<component :is="tag" class="markdown" v-html="md.render(text, options)"></component>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{   
        text: string, 
        tag?: string | undefined, 
        options?: MarkdownIt.Options | undefined
    }>(), { tag: 'div', options: undefined}
)
import type MarkdownIt from "markdown-it";
import markdownit from "markdown-it"
const md = markdownit(props.options ?? {})
</script>