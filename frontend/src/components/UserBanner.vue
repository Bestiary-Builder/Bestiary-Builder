<template>
	<div>
		<div class="user" v-if="user">
			<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
			<span :class="user.supporter ? 'supporter' : ''">{{ user.username }}{{ user.supporter ? "👑" : "" }}</span>
		</div>
		<div v-else class="user">no User</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, defineProps} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
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

.supporter {
	color: goldenrod;
}
</style>
