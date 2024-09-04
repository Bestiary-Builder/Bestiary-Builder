<script lang="ts" setup>
import type { Bestiary } from "~/shared";

const { icon } = defineProps<{ icon: Bestiary["status"] }>();
</script>

<template>
	<font-awesome-icon v-if="icon === 'public'" :icon="['fas', 'earth-europe']" />
	<font-awesome-icon v-if="icon === 'unlisted'" :icon="['fas', 'link']" />
	<font-awesome-icon v-if="icon === 'private'" :icon="['fas', 'lock']" />
</template>

<style scoped>
svg {
	color: orangered;
	translate: 0 3px;
}
</style>
