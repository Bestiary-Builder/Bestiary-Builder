<script setup lang="ts">
import { ref, shallowRef, useTemplateRef, watch } from "vue";
import { VueMonacoEditor } from "@guolao/vue-monaco-editor";
import type * as Monaco from "monaco-editor";
import ButtonIcon from "../Global/ButtonIcon.vue";

const { height = 250 } = defineProps<{ height?: number }>();

const model = defineModel<string>();
const editorRef = shallowRef();
function handleMount(
	editor: Monaco.editor.IStandaloneCodeEditor,
	monaco: typeof Monaco
) {
	editorRef.value = editor;

	monaco.editor.defineTheme("my-dark-theme", {
		base: "vs-dark",
		inherit: true,
		rules: [],
		colors: {
			"editor.background": "#1a1919",
		},
	});

	monaco.editor.setTheme("my-dark-theme");

	updateDecorations(editor);

	editor.onDidChangeModelContent(() => {
		updateDecorations(editor);
	});

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
}

let decorationIds: string[] = [];

function updateDecorations(editor: Monaco.editor.IStandaloneCodeEditor) {
	const model = editor.getModel();

	if (!model)
		return;

	const text = model.getValue();

	const decorations = [];

	const regex = /::.*::/g;

	let match: RegExpExecArray | null;

	// eslint-disable-next-line no-cond-assign
	while ((match = regex.exec(text))) {
		const start = model.getPositionAt(match.index + 2);
		const end = model.getPositionAt(
			match.index + match[0].length
		);

		decorations.push({
			range: {
				startLineNumber: start.lineNumber,
				startColumn: start.column,

				endLineNumber: end.lineNumber,
				endColumn: end.column,
			},

			options: {
				inlineClassName: "markdown-highlight",
			},
		});

		const markerStart = model.getPositionAt(match.index);
		const markerEnd = model.getPositionAt(match.index + 2);

		decorations.push({
			range: {
				startLineNumber: markerStart.lineNumber,
				startColumn: markerStart.column,
				endLineNumber: markerEnd.lineNumber,
				endColumn: markerEnd.column,
			},
			options: {
				inlineClassName: "markdown-marker",
			},
		});
	}
	decorationIds = editor.deltaDecorations(
		decorationIds,
		decorations
	);
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
			if (existingPrefix === prefix) {
				newText = text.slice(existingPrefix.length);
			}
			// Different level -> replace heading
			else {
				newText
          = prefix
          	+ text.slice(existingPrefix.length);
			}
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

function toggleInlineHighlight(
	editor: Monaco.editor.IStandaloneCodeEditor
) {
	const model = editor.getModel();
	const selection = editor.getSelection();

	if (!model || !selection)
		return;

	const selectedText = model.getValueInRange(selection);

	// Case 1: selected text
	if (selectedText.length > 0) {
		const startOffset = model.getOffsetAt(
			selection.getStartPosition()
		);

		const endOffset = model.getOffsetAt(
			selection.getEndPosition()
		);

		const fullText = model.getValue();

		const before = fullText.slice(
			startOffset - 2,
			startOffset
		);

		const after = fullText.slice(
			endOffset,
			endOffset + 2
		);

		const isHighlighted
      = before === "::"
      	&& after === "::";

		if (isHighlighted) {
			editor.executeEdits("toggle-highlight", [
				{
					range: {
						startLineNumber: selection.startLineNumber,
						startColumn: selection.startColumn - 2,
						endLineNumber: selection.endLineNumber,
						endColumn: selection.endColumn + 2,
					},
					text: selectedText,
				},
			]);

			editor.setSelection({
				startLineNumber: selection.startLineNumber,
				startColumn: selection.startColumn - 2,
				endLineNumber: selection.endLineNumber,
				endColumn: selection.endColumn - 2,
			});
		}
		else {
			editor.executeEdits("toggle-highlight", [
				{
					range: selection,
					text: `::${selectedText}::`,
				},
			]);

			editor.setSelection({
				startLineNumber: selection.startLineNumber,
				startColumn: selection.startColumn + 2,
				endLineNumber: selection.endLineNumber,
				endColumn: selection.endColumn + 2,
			});
		}

		editor.focus();
		return;
	}

	// Case 2: no selection -> current line
	const lineNumber = selection.startLineNumber;
	const lineText = model.getLineContent(lineNumber);

	const match = lineText.match(/^::(.*)::$/);

	const range = {
		startLineNumber: lineNumber,
		startColumn: 1,
		endLineNumber: lineNumber,
		endColumn: model.getLineMaxColumn(lineNumber),
	};

	if (match) {
		// Remove :: markers
		editor.executeEdits("toggle-highlight", [
			{
				range,
				text: match[1],
			},
		]);

		editor.setPosition({
			lineNumber,
			column: match[1].length + 1,
		});
	}
	else {
		// Add :: markers
		editor.executeEdits("toggle-highlight", [
			{
				range,
				text: `::${lineText}::`,
			},
		]);

		editor.setPosition({
			lineNumber,
			column: lineText.length + 3,
		});
	}

	editor.focus();
}
</script>

<template>
	<div class="monaco-wrapper-thing">
		<div class="button-container">
			<ButtonIcon icon="bold" label="Bold" noscale @click="toggleMarkdown(editorRef, '**')" />
			<ButtonIcon icon="italic" label="Italic" noscale @click="toggleMarkdown(editorRef, '*')" />
			<ButtonIcon icon="list" label="List" noscale @click="toggleLinePrefix(editorRef, '* ')" />
			<ButtonIcon icon="list-ol" label="Ordered list" noscale @click="toggleOrderedList(editorRef)" />
			<ButtonIcon icon="grip-vertical" label="Hanging list" noscale @click="toggleInlineHighlight(editorRef)" />

			<span style="margin-left: 1rem"> H </span>
			<ButtonIcon icon="1" label="Heading 1" noscale @click="toggleHeading(editorRef, 1)" />
			<ButtonIcon icon="2" label="Heading 2" noscale @click="toggleHeading(editorRef, 2)" />
			<ButtonIcon icon="3" label="Heading 3" noscale @click="toggleHeading(editorRef, 3)" />
			<ButtonIcon icon="4" label="Heading 4" noscale @click="toggleHeading(editorRef, 4)" />
		</div>
		<VueMonacoEditor
			v-model:value="model" theme="vs-dark"
			:options="{ wordWrap: 'on', theme: 'vs-dark', minimap: { enabled: false }, formatOnPaste: true, formatOnType: true, automaticLayout: true, scrollBeyondLastLine: false, lineNumbers: 'off' }"
			class="description-editor" :height="`${height}px`" language="markdown" @mount="handleMount"
		/>
	</div>
</template>

<style lang="less" scoped>
.button-container {
	display: flex;
	gap: 0.2rem;
	background-color: #262525;
	border-top-left-radius: 6px;
	border-top-right-radius: 6px;
	font-size: smaller;
}
</style>

<style lang="less">
.monaco-wrapper-thing {
	max-width: calc(100vw - 7%);
	.monaco-editor,
	.overflow-guard {
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		border-top-left-radius: 0px;
		border-top-right-radius: 0px;
	}

	.margin {
		width: 0px;
	}

	.monaco-scrollable-element.editor-scrollable {
		left: 20px !important;
	}

	.markdown-highlight {
		color: #ff79c6;
	}

	.markdown-marker {
		opacity: 0.5;
	}
}
</style>
