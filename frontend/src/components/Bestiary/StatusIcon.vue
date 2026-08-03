<script lang="ts" setup>
import type { Bestiary } from "~/shared";

const { icon } = defineProps<{ icon: Bestiary["status"] }>();
</script>

<template>
	<font-awesome-icon v-if="icon === 'public'" v-tooltip="'This colletion is public.'" :icon="['fas', 'earth-europe']" />
	<font-awesome-icon v-if="icon === 'unlisted'" v-tooltip="'This colletion is unlisted.'" :icon="['fas', 'link']" />
	<font-awesome-icon v-if="icon === 'private'" v-tooltip="'This colletion is private.'" :icon="['fas', 'lock']" />
</template>
