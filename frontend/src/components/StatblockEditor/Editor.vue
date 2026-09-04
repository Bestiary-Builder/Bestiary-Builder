<script setup lang="ts">
import type * as Monaco from "monaco-editor";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import { useElementSize, watchDebounced } from "@vueuse/core";
import { shallowRef, useTemplateRef, watch } from "vue";
import { useTheme } from "vuetify";
import { useRoute } from "vue-router";

const { height = 150 } = defineProps<{ height?: number }>();

const model = defineModel<string>();
const editorRef = shallowRef<Monaco.editor.IStandaloneCodeEditor>();
function handleMount(
	editor: Monaco.editor.IStandaloneCodeEditor,
	monaco: typeof Monaco
) {
	editorRef.value = editor;

	monaco.editor.setTheme(theme.name.value === 'dark' ? 'vs-dark' : 'vs-light');

	editor.addCommand(
		monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
		() => {
			toggleMarkdown(editor, "**");
		}
	);

	editor.addCommand(
		monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
		() => {
			toggleMarkdown(editor, "*");
		}
	);

	editor.addCommand(
		monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU,
		() => {
			toggleMarkdown(editor, "__");
		}
	);

	editor.layout();

	setTimeout(() => {
		editorRef.value?.layout();
	}, 1000);
}

function toggleMarkdown(
	editor: Monaco.editor.IStandaloneCodeEditor,
	marker: string
) {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const selectedText = model.getValueInRange(selection);

	const startOffset = model.getOffsetAt(selection.getStartPosition());
	const endOffset = model.getOffsetAt(selection.getEndPosition());

	const text = model.getValue();

	const before = text.slice(
		startOffset - marker.length,
		startOffset
	);

	const after = text.slice(
		endOffset,
		endOffset + marker.length
	);

	const hasMarkers
		= before === marker
		&& after === marker;

	if (hasMarkers) {
		// Remove markers
		editor.executeEdits("markdown-toggle", [
			{
				range: {
					startLineNumber: selection.startLineNumber,
					startColumn:
						selection.startColumn - marker.length,

					endLineNumber: selection.endLineNumber,
					endColumn:
						selection.endColumn + marker.length,
				},
				text: selectedText,
			},
		]);

		// Restore selection without markers
		editor.setSelection({
			startLineNumber: selection.startLineNumber,
			startColumn:
				selection.startColumn - marker.length,

			endLineNumber: selection.endLineNumber,
			endColumn:
				selection.endColumn - marker.length,
		});
	}
	else {
		// Add markers
		editor.executeEdits("markdown-toggle", [
			{
				range: selection,
				text: `${marker}${selectedText}${marker}`,
			},
		]);

		// Keep cursor around the content
		editor.setSelection({
			startLineNumber: selection.startLineNumber,
			startColumn:
				selection.startColumn + marker.length,

			endLineNumber: selection.endLineNumber,
			endColumn:
				selection.endColumn + marker.length,
		});
	}

	editor.focus();
}

function toggleLinePrefix(
	editor: Monaco.editor.IStandaloneCodeEditor,
	prefix: string
) {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const startLine = selection.startLineNumber;
	const endLine = selection.endLineNumber;

	const lines = [];

	let remove = true;

	for (let line = startLine; line <= endLine; line++) {
		const text = model.getLineContent(line);

		if (!text.trim().startsWith(prefix)) {
			remove = false;
			break;
		}
	}

	for (let line = startLine; line <= endLine; line++) {
		const text = model.getLineContent(line);

		if (remove) {
			const index = text.indexOf(prefix);

			lines.push(
				index >= 0
					? text.slice(0, index) + text.slice(index + prefix.length)
					: text
			);
		}
		else {
			lines.push(prefix + text);
		}
	}

	editor.executeEdits("toggle-line-prefix", [
		{
			range: {
				startLineNumber: startLine,
				startColumn: 1,
				endLineNumber: endLine,
				endColumn: model.getLineMaxColumn(endLine),
			},
			text: lines.join("\n"),
		},
	]);
}

const toggleLineSuffix = (
	editor: Monaco.editor.IStandaloneCodeEditor,
	suffix: string
) => {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const startLine = selection.startLineNumber;
	const endLine = selection.endLineNumber;

	const lines = [];

	let remove = true;

	for (let line = startLine; line <= endLine; line++) {
		const text = model.getLineContent(line);

		if (!text.trimEnd().endsWith(suffix)) {
			remove = false;
			break;
		}
	}

	for (let line = startLine; line <= endLine; line++) {
		const text = model.getLineContent(line);

		if (remove) {
			const trimmed = text.trimEnd();
			const index = trimmed.lastIndexOf(suffix);

			lines.push(
				index >= 0 && index === trimmed.length - suffix.length
					? text.slice(0, index)
					: text
			);
		}
		else {
			lines.push(text + suffix);
		}
	}

	editor.executeEdits("toggle-line-suffix", [
		{
			range: {
				startLineNumber: startLine,
				startColumn: 1,
				endLineNumber: endLine,
				endColumn: model.getLineMaxColumn(endLine),
			},
			text: lines.join("\n"),
		},
	]);
};

function toggleOrderedList(
	editor: Monaco.editor.IStandaloneCodeEditor
) {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const start = selection.startLineNumber;
	const end = selection.endLineNumber;

	const lines = [];

	let remove = true;

	for (let line = start; line <= end; line++) {
		const text = model.getLineContent(line);

		if (!/^\s*\d+\.\s/.test(text)) {
			remove = false;
			break;
		}
	}

	for (let line = start; line <= end; line++) {
		let text = model.getLineContent(line);

		if (remove)
			text = text.replace(/^\s*\d+\.\s/, "");
		else
			text = `${line - start + 1}. ${text}`;

		lines.push(text);
	}

	editor.executeEdits("toggle-ordered-list", [
		{
			range: {
				startLineNumber: start,
				startColumn: 1,
				endLineNumber: end,
				endColumn: model.getLineMaxColumn(end),
			},
			text: lines.join("\n"),
		},
	]);
}

function toggleHeading(
	editor: Monaco.editor.IStandaloneCodeEditor,
	level: number
) {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const startLine = selection.startLineNumber;
	const endLine = selection.endLineNumber;

	const prefix = `${"#".repeat(level)} `;

	const edits = [];

	for (let line = startLine; line <= endLine; line++) {
		const text = model.getLineContent(line);

		// Match existing heading
		const match = text.match(/^#{1,4}\s+/);

		let newText: string;

		if (match) {
			const existingPrefix = match[0];

			// Same heading level -> remove heading
			if (existingPrefix === prefix)
				newText = text.slice(existingPrefix.length);
			// Different level -> replace heading
			else
				newText = prefix + text.slice(existingPrefix.length);
		}
		// No heading -> add one
		else {
			newText = prefix + text;
		}

		edits.push({
			range: {
				startLineNumber: line,
				startColumn: 1,
				endLineNumber: line,
				endColumn: model.getLineMaxColumn(line),
			},
			text: newText,
		});
	}

	editor.executeEdits(
		"toggle-heading",
		edits
	);
}

const wrapper = useTemplateRef("wrapper");
const { width } = useElementSize(wrapper);
watchDebounced(width, async () => {
	editorRef.value?.layout();
}, { debounce: 500, maxWait: 1000 },);

const theme = useTheme()
watch(() => theme, () => {
	editorRef.value?.updateOptions({ theme: theme.name.value === 'dark' ? 'vs-dark' : 'vs-light' })
})

const $route = useRoute()
</script>

<template>
	<div ref="wrapper" class="monaco-wrapper-thing"
		:style="$route.path.startsWith('/automation/view') || $route.path.startsWith('/creature/view') ? { opacity: 'var(--v-disabled-opacity)' } : {}">
		<div class="button-container">
			<span> <b> Description</b></span>
			<v-divider vertical />
			<v-icon-btn size="20" icon="mdi:format-bold" text="Bold" @click="toggleMarkdown(editorRef!, '**')" />
			<v-icon-btn size="20" icon="mdi:format-italic" text="Italic" @click="toggleMarkdown(editorRef!, '*')" />
			<v-divider vertical />

			<v-icon-btn size="20" icon="mdi:format-list-bulleted" text="List"
				@click="toggleLinePrefix(editorRef!, '* ')" />
			<v-icon-btn size="20" icon="mdi:format-list-numbered" text="Ordered list"
				@click="toggleOrderedList(editorRef!)" />
			<v-icon-btn v-tooltip="'Makes everything but the first line indented as a \'hanging\' list.'" size="20"
				icon="mdi-format-indent-increase" text="Ordered list"
				@click="toggleLineSuffix(editorRef!, ' {.hanging}')" />
			<v-divider vertical />
			<v-icon-btn size="20" icon="mdi:format-header-1" text="Heading 1" @click="toggleHeading(editorRef!, 1)" />
			<v-icon-btn size="20" icon="mdi:format-header-2" text="Heading 2" @click="toggleHeading(editorRef!, 2)" />
			<v-icon-btn size="20" icon="mdi:format-header-3" text="Heading 3" @click="toggleHeading(editorRef!, 3)" />
			<v-icon-btn size="20" icon="mdi:format-header-4" text="Heading 4" @click="toggleHeading(editorRef!, 4)" />
		</div>
		<div class="wrapper">

			<VueMonacoEditor v-model:value="model" theme="vs-dark"
				:options="{ wordWrap: 'on', theme: theme.name.value === 'dark' ? 'vs-dark' : 'vs-light', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false, lineNumbers: 'off' }"
				class="description-editor" :height="`${height}px`" width="100%" language="markdown"
				@mount="handleMount" />
		</div>
	</div>

</template>

<style scoped>
.button-container {
	display: flex;
	gap: 1rem;
	background-color: rgb(var(--v-theme-surface));
	border-top-left-radius: 4px;
	border-top-right-radius: 4px;
	font-size: smaller;
	padding: 0.4rem;
	overflow-x: auto;
	max-width: 90vw
}

.wrapper :deep(.monaco-editor),
.wrapper :deep(.monaco-editor .margin),
.wrapper :deep(.monaco-editor-background) {
	background-color: rgb(var(--v-theme-surface)) !important;
}
</style>

<style lang="less">
.monaco-wrapper-thing {

	.monaco-editor {
		min-height: 100px;

	}

	.monaco-editor,
	.overflow-guard {
		border-radius: 0 0 4px 4px;
	}

	.margin {
		width: 0;
	}
}

.description-editor {
	border: 1px solid rgb(var(--v-theme-surface));

}
</style>
