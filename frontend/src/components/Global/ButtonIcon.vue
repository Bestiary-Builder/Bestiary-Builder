<script setup lang="ts">
const { icon, inverted = false, label } = defineProps<{ icon: string; inverted?: boolean; label: string; noscale?: boolean }>();
</script>

<template>
	<button v-tooltip="label" :class="{ inverted, noscale }" :aria-label="label">
		<font-awesome-icon :icon="['fas', icon]" />
	</button>
</template>

<style scoped lang="less">
button {
	color: orangered;
	background-color: unset;
	border: unset;
	cursor: pointer;
	&:not(.noscale) {
		transition: scale 0.5s;
	}
}

button&:not(.noscale):hover {
	scale: 1.2;
}
</style>
