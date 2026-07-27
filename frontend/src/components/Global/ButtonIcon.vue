<script setup lang="ts">
import AvraeIcon from "@/../public/Avrae_Logo.svg";

const { icon, inverted = false, label } = defineProps<{ icon: string; inverted?: boolean; label: string; noscale?: boolean }>();
</script>

<template>
	<button v-tooltip="label" :class="{ inverted, noscale }" :aria-label="label">
		<font-awesome-icon v-if="icon !== 'avrae'" :icon="['fas', icon]" />
		<AvraeIcon v-if="icon === 'avrae'" class="avrae" />
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
