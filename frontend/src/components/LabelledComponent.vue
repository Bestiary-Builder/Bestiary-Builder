<template>
    <div class="container">
        <label class="editor-field__title" :for="title.toLowerCase().replaceAll(' ', '')">{{ title }}</label>
        <slot></slot>
    </div>
    </template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        title: {
            type: String,
            required: true
        },
    },
})
</script>

<style scoped lang="less">
.container {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	& label {
		font-weight: bold;
		text-decoration: underline;
        text-decoration-color: #8a8a8a;
	}
}

</style>