<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Loading from "vue-loading-overlay";
import type { User } from "~/shared";
import { useFetch } from "@/utils/utils";
import "vue-loading-overlay/dist/css/index.css";

const props = defineProps<{ id: string }>();
const user = ref<User | null>(null);
onMounted(async () => {
	const { success, data } = await useFetch<User>(`/api/user/${props.id}`);
	if (success)
		user.value = data;
	else user.value = null;
});

const isLoading = computed(() => {
	return user.value == null;
});
</script>

<template>
	<div class="container">
		<div v-if="user" class="user">
			<img class="img" alt="" :src="user.avatar ? `https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'">
			<span v-if="!user.supporter">{{ user.username }}</span>
			<span v-if="user.supporter === 1" v-tooltip="'This user is a Wyrmling Patreon Supporter!'" class="supporter-tier-1"> {{ user.username }} </span>
			<span v-if="user.supporter === 2" v-tooltip="'This user is a Greatwyrm Patreon Supporter!'" class="supporter-tier-2"> {{ user.username }} </span>
		</div>
		<div v-else class="user">
			<Loading v-model:active="isLoading" :is-full-page="false" color="orangered" :opacity="0" />
		</div>
	</div>
</template>

<style scoped lang="less">
.container {
	white-space: nowrap;
}
.user {
	display: flex;
	align-items: center;

	gap: 0.3rem;
	.img {
		height: 1.5rem;
		border-radius: 50%;
		scale: 1.1;
	}
}

.supporter-tier-1 {
	color: #29cf29;
	text-shadow: var(--color-surface-0) 2px 2px;
}

.supporter-tier-2 {
	color: #ca2020;
	text-shadow: var(--color-surface-0) 2px 2px;
}

.loading {
	display: relative;
}
</style>
