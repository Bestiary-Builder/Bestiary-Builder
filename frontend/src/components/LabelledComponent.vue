<template>
	<div class="container">
		<label class="editor-field__title" :for="elId">{{ title }}<span v-if="takesCustomTextInput" v-tooltip="'Supports custom text input'">*</span></label>
		<slot></slot>
	</div>
</template>

<script setup lang="ts">
import {withDefaults, defineProps, ref} from "vue";
const props = withDefaults(defineProps<{title: string, id?: number | undefined, takesCustomTextInput?: boolean}>(), {takesCustomTextInput: false, number: undefined})
const elId = ref("")

if (props.id) elId.value = props.title.toLowerCase().replaceAll(" ", "") + props.id;
else elId.value = props.title.toLowerCase().replaceAll(" ", "");
</script>

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
