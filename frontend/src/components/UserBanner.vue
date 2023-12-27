<template>
	<div>
		<div class="user" v-if="user">
			<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
			<span v-if="!user.supporter">{{ user.username }}</span>
			<span v-if="user.supporter === 1" class="supporter-tier-1" v-tooltip="'This user is a Wyrmling Patreon Supporter!'"> {{ user.username }}🐲 </span>
			<span v-if="user.supporter === 2" class="supporter-tier-2" v-tooltip="'This user is a Greatwyrm Patreon Supporter!'"> {{ user.username }}🐉 </span>
		</div>
		<div v-else class="user">no User</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User} from "@/generic/types";
import {handleApiResponse} from "@/main";
export default defineComponent({
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
.user {
	display: flex;
	align-items: center;

	gap: 0.3rem;
	& img {
		height: 1.5rem;
		border-radius: 50rem;
		scale: 1.1;
	}
}

.supporter-tier-1 {
	color: #29cf29;
    text-shadow: black 2px 2px;
}

.supporter-tier-2 {
	color: #ca2020;
    text-shadow: black 2px 2px;
}
</style>
