<script setup lang="ts">
defineOptions({
	inheritAttrs: false
});

withDefaults(defineProps<{ title: string; takesCustomTextInput?: boolean }>(), { takesCustomTextInput: false, number: undefined });
</script>

<template>
	<div class="container">
		<label class="editor-field__title" v-bind="$attrs">{{ title }}<span v-if="takesCustomTextInput" v-tooltip="'Supports custom text input'">*</span></label>
		<slot />
	</div>
</template>

<style scoped lang="less">
.container {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	label {
		font-weight: bold;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, currentColor, rgba(0, 0, 0, 0.5));
	}
}
</style>
