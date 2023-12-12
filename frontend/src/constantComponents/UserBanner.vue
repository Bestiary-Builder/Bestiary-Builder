<template :key="">
	<a class="user" v-if="user" :href="'/user' + (id ? '?id=' + id : '')">
		<img alt="avatar" :src="'https://cdn.discordapp.com/avatars/' + user._id + '/' + user.avatar + '.png'" />
		<p>{{ user.global_name }}</p>
	</a>
	<div v-else-if="id" class="login">
		<button @click.prevent="LoginClick">Login</button>
	</div>
	<div v-else class="user"></div>
</template>

<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import {defineComponent, defineProps} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import {handleApiResponse} from "@/main";
export default defineComponent({
	data: () => ({key: 0} as {user: User | null; key: number}),
	props: {
		id: String
	},
	async mounted() {
		await fetch("/api/user" + (this.id ? "/" + this.id : "")).then(async (response: any) => {
			let result = await handleApiResponse<User>(response);
			if (result.success) this.user = result.data as User;
			else this.user = null;
		});
		this.key++;
		console.log(this.user);
		this.$forceUpdate();
	},
	methods: {
		LoginClick() {
			window.location.href = "https://discord.com/oauth2/authorize?client_id=1183362236509601813&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Flogin&scope=identify+email";
		}
	}
});
</script>

<style scoped lang="less">
.user,
.login {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	border: 1px solid var(--border-color-base);
	background-color: var(--color-surface-0);
}
.user {
	padding-right: 1rem;
	text-decoration: none;
	color: var(--color-base);
}
.user img {
	max-height: 3.5dvh;
	border-radius: 50rem;
}
.user p {
	font-size: 1.25rem;
	text-decoration: none;
}
button {
	font-size: 1rem;
}

@media screen and (max-width: 999px) {
	.user img {
		max-height: 5dvh;
	}
}
</style>
