<template>
	<div class="container">
		<div class="user" v-if="user">
			<img alt="avatar" :src="user.avatar ? 'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png' : 'https://cdn.discordapp.com/embed/avatars/0.png'" />
			<span v-if="!user.supporter">{{ user.username }}</span>
			<span v-if="user.supporter === 1" class="supporter-tier-1" v-tooltip="'This user is a Wyrmling Patreon Supporter!'"> {{ user.username }} </span>
			<span v-if="user.supporter === 2" class="supporter-tier-2" v-tooltip="'This user is a Greatwyrm Patreon Supporter!'"> {{ user.username }} </span>
		</div>
		<div v-else class="user">
			<loading :is-full-page="false" v-model:active="isLoading" color="orangered" :opacity="0" />
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User} from "@/generic/types";
import {handleApiResponse} from "@/main";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";

export default defineComponent({
	components: {
		Loading
	},
	data() {
		return {
			user: null as User | null
		};
	},
	props: {
		id: {
			type: String,
			required: true
		}
	},
	computed: {
		isLoading() {
			return this.user == null;
		}
	},
	async beforeMount() {
		await fetch("/api/user" + "/" + this.id).then(async (response: any) => {
			let result = await handleApiResponse<User>(response);
			if (result.success) this.user = result.data as User;
			else this.user = null;
		});
	}
});
</script>

<style scoped lang="less">
.container {
	white-space: nowrap;
}
.user {
	display: flex;
	align-items: center;

	gap: 0.3rem;
	img {
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
