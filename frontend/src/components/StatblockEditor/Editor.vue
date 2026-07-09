<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { Editor, EditorContent } from "@tiptap/vue-3";
import { onBeforeUnmount, watch } from "vue";
import { Markdown } from "@tiptap/markdown";
import { Document } from "@tiptap/extension-document";
import ButtonIcon from "../Global/ButtonIcon.vue";

const model = defineModel<string>();

const CustomDocument = Document.extend({
	renderMarkdown: (node, h) =>
		node.content ? h.renderChildren(node.content, "\n\n") : "",
});

const editor = new Editor({
	extensions: [
		StarterKit.configure({ document: false }), // disables the default
		CustomDocument,
		Markdown
	],
	content: model.value,
	onUpdate: () => {
		if (editor)
			model.value = editor.getMarkdown();
	},
	contentType: "markdown"
});

onBeforeUnmount(() => {
	editor?.destroy();
});

watch(model, (value) => {
	const incoming = value ?? "";
	if (incoming === editor.getMarkdown())
		return;

	editor.commands.setContent(incoming, {
		contentType: "markdown",
		emitUpdate: false,
	});
});
</script>

<template>
	<div class="button-container">
		<ButtonIcon icon="bold" label="Bold" noscale @click="editor.commands.toggleBold()" />
		<ButtonIcon icon="italic" label="Italic" noscale @click="editor.commands.toggleItalic()" />
		<ButtonIcon icon="underline" label="Underline" noscale @click="editor.commands.toggleUnderline()" />
		<ButtonIcon icon="list" label="List" noscale @click="editor.commands.toggleBulletList()" />
	</div>
	<div class="tip-tap-container">
		<EditorContent :editor="editor" />
	</div>
</template>

<style lang="less">
.tip-tap-container {
	resize: vertical;
	overflow: auto;
	min-height: 100px;
	padding: 6px 12px;
	background: var(--color-surface-0);
	border: 1px solid var(--color-surface-1);
	border-bottom-left-radius: 6px;
	border-bottom-right-radius: 6px;
	font-size: 13px;
	color: #f7f8f8;
	height: 46px;
}

.button-container {
	display: flex;
	gap: 0.2rem;
	background-color: #262525;
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
	translate: 0 8px;
}

/* Basic editor styles */
.tiptap {
	&:focus {
		outline: none;
	}

	&:first-child {
		margin-top: 0;
	}

	/* List styles */
	ul,
	ol {
		padding: 0 1rem;
		margin: 1.25rem 1rem 1.25rem 0.4rem;

		li p {
			margin-top: 0.25em;
			margin-bottom: 0.25em;
		}
	}

	/* Heading styles */
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		line-height: 1.1;
		margin-top: 2.5rem;
		text-wrap: pretty;
	}

	h1,
	h2 {
		margin-top: 3.5rem;
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.4rem;
	}

	h2 {
		font-size: 1.2rem;
	}

	h3 {
		font-size: 1.1rem;
	}

	h4,
	h5,
	h6 {
		font-size: 1rem;
	}

	/* Code and preformatted text styles */
	code {
		background-color: var(--purple-light);
		border-radius: 0.4rem;
		color: var(--black);
		font-size: 0.85rem;
		padding: 0.25em 0.3em;
	}

	pre {
		background: var(--black);
		border-radius: 0.5rem;
		color: var(--white);
		font-family: "JetBrainsMono", monospace;
		margin: 1.5rem 0;
		padding: 0.75rem 1rem;

		code {
			background: none;
			color: inherit;
			font-size: 0.8rem;
			padding: 0;
		}
	}

	blockquote {
		border-left: 3px solid var(--gray-3);
		margin: 1.5rem 0;
		padding-left: 1rem;
	}

	hr {
		border: none;
		border-top: 1px solid var(--gray-2);
		margin: 2rem 0;
	}
}

/* Placeholder (at the top) */
p.is-editor-empty:first-child::before {
	color: var(--gray-4);
	content: attr(data-placeholder);
	float: left;
	height: 0;
	pointer-events: none;
}
</style>
