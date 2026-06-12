<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { displayNames } from "../../util";

const props = defineProps<{ type: keyof typeof displayNames; additionalText?: string }>();
</script>

<template>
	<Icon :icon="displayNames![props.type]?.icon" :inline="true" width="1em" color="orangered" i />
	{{ displayNames![props.type]?.label }}{{ additionalText ? ` (${additionalText})` : '' }}
</template>
