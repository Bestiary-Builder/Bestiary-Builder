<script lang="ts" setup>
import type { Bestiary } from "~/shared";

const { icon } = defineProps<{ icon: Bestiary["status"] }>();
</script>

<template>
	<font-awesome-icon v-if="icon === 'public'" :icon="['fas', 'earth-europe']" v-tooltip="'This colletion is public.'"/>
	<font-awesome-icon v-if="icon === 'unlisted'" :icon="['fas', 'link']" v-tooltip="'This colletion is unlisted.'"/>
	<font-awesome-icon v-if="icon === 'private'" :icon="['fas', 'lock']" v-tooltip="'This colletion is private.'"/>
</template>
