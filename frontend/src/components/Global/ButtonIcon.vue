<script setup lang="ts">
const { icon, inverted = false, label } = defineProps<{ icon: string; inverted?: boolean; label: string }>();
</script>

<template>
	<button v-tooltip="label" :class="{ inverted }" :aria-label="label">
		<font-awesome-icon :icon="['fas', icon]" />
	</button>
</template>
