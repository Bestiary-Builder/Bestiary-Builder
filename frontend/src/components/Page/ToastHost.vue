<script setup lang="ts">
import { useToast } from "@/utils/app/toast";

const { toasts, removeToast } = useToast();

function offsetStyle(index: number) {
	return index * 60;
}
</script>

<template>
	<v-snackbar
		v-for="toast, idx in toasts" :key="toast.id" v-model="toast.show" :color="toast.color"
		:timeout="toast.timeout" location="bottom left" :style="`bottom: ${offsetStyle(idx)}px`"
		:loading="toast.loading" :prepend-icon="toast.prependIcon"
		class="bestiary-builder-snackbar" @update:model-value="v => !v && removeToast(toast.id)"
	>
		<template v-if="!toast.isHtml">
			{{ toast.text }}
		</template>
		<div v-else v-html="toast.text" />
		<template v-if="toast.timeout < 0" #actions>
			<v-btn color="black" variant="text" icon="mdi-close" @click="removeToast(toast.id)" />
		</template>
	</v-snackbar>
</template>

<style>
.bestiary-builder-snackbar {
	transition: bottom 0.2s linear;
}
</style>
