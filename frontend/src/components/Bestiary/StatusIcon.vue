<script lang="ts" setup>
import type { Bestiary } from "~/shared";

const { icon } = defineProps<{ icon: Bestiary["status"] }>();
</script>

<template>
	<v-icon v-if="icon === 'public'" icon="mdi:earth" size="20" />
	<v-icon v-else-if="icon === 'unlisted'" icon="mdi:link" size="20" />
	<v-icon v-else-if="icon === 'private'" icon="mdi:lock" size="20" />
	<v-icon v-else icon="mdi:question" size="20" />
</template>
