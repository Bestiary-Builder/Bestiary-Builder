<template>
	<div class="container">
		<label class="editor-field__title" :for="elId">{{ title }}<span v-if="takesCustomTextInput" v-tooltip="'Supports custom text input'">*</span></label>
		<slot></slot>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
	props: {
		title: {
			type: String,
			required: true
		},
		id: {
			type: Number,
			required: false
		},
		takesCustomTextInput: {
			type: Boolean,
			required: false,
			default: false
		}
	},
	data() {
		return {
			elId: ""
		};
	},
	mounted() {
		if (this.id) this.elId = this.title.toLowerCase().replaceAll(" ", "") + this.id;
		else this.elId = this.title.toLowerCase().replaceAll(" ", "");
	}
});
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
