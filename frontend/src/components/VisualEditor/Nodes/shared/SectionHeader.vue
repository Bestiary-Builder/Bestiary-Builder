<script lang="ts" setup>
withDefaults(defineProps<{ title: string; color?: string }>(), { color: "var(--border-color-base)" });
</script>

<template>
	<div class="section-header">
		<hr class="left"> <span> {{ title }}</span> <hr>
	</div>
</template>

<style scoped lang="less">
.section-header {
	display: grid;
	grid-template-columns: 0.3fr auto 10fr;
	margin: 0.5rem 0;
	gap: 0.5rem;
	span {
		display: inline-block;
		text-wrap: nowrap;
		font-weight: bold;
		font-size: 1.1rem;
	}

	hr {
		width: 100%;
		height: 2px;
		margin-top: 0.75rem;
		border-color: v-bind(color);
	}
}

.section-header:first-child {
	margin-top: 0;
}
</style>
