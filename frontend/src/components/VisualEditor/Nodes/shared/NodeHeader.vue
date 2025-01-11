<script lang="ts" setup>
import { defineProps } from "vue";
import { displayNames } from "../../util";

const props = defineProps<{ type: keyof typeof displayNames; additionalText?: string }>();
</script>

<template>
	<Icon :icon="displayNames![props.type]?.icon" :inline="true" width="1em" color="rgb(128,128,128)" />
	{{ displayNames![props.type]?.label }}{{ additionalText ? ` (${additionalText})` : '' }}
</template>
