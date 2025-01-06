<script setup lang="ts">
const props = withDefaults(defineProps<{ title: string; takesCustomTextInput?: boolean; for?: string }>(), { takesCustomTextInput: false, number: undefined });
</script>

<template>
	<div class="container">
		<label class="editor-field__title" :for="props.for">{{ title }}<span v-if="takesCustomTextInput" v-tooltip="'Supports custom text input'">*</span></label>
		<slot />
	</div>
</template>

<style scoped lang="less">
.container {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	label {
		font-size: 0.9rem;
		font-weight: bold;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor, rgba(0, 0, 0, 0.5));
	}
}
</style>

<style>
	.editor:has(label) .editor-field__title {
	font-weight: normal;
}
</style>
