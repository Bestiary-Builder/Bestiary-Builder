<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { displayNames } from "../../util";

const props = defineProps<{ type: keyof typeof displayNames; additionalText?: string; isCurrent?: boolean }>();
</script>

<template>
	<Icon :icon="isCurrent ? 'material-symbols:asterisk' : displayNames![props.type]?.icon" :inline="true" width="1em" :color="isCurrent ? 'var(--color-success)' : 'orangered'" />
	{{ displayNames![props.type]?.label }}<span v-if="additionalText" style="font-size: x-small; margin-left: 6px" class="additional-text">{{ additionalText }}</span>
</template>
