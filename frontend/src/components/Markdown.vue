<template>
<component :is="tag" class="markdown" v-html="md.render(text, options)"></component>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{   
        text: string, 
        tag?: string | undefined, 
        options?: MarkdownIt.Options | undefined,
        anchorLinks?: boolean
    }>(), { tag: 'div', options: undefined, anchorLinks: false}
)
import type MarkdownIt from "markdown-it";
import markdownit from "markdown-it"
import anchor from "markdown-it-anchor";
const md = markdownit(props.options ?? {})

if (props.anchorLinks) {
    md.use(anchor, { 
        permalink: anchor.permalink.linkInsideHeader({
            placement: 'before',
            ariaHidden: true,
            
        })
    })
}
</script>