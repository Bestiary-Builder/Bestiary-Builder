<template>
	<div class="notLoggedIn" v-if="!user">
		<button @click.prevent="LoginClick">Login</button>
	</div>
	<div class="login-test" v-else>
		<p>Logged in as {{ user.global_name }}</p>
		<button @click.prevent="LogoutClick">Logout</button>
		<p>
			E-mail: <code>{{ user.email }}</code>
		</p>
		<p>
			Username: <code>{{ user.username }}</code>
		</p>
		<p>
			Id: <code>{{ user._id }}</code>
		</p>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
export default defineComponent({
	data: () => ({} as {user: User | null}),
	async mounted() {
		this.user = (await fetch("/api/user").then(async (response: any) => {
			if (response.status == 200) return await response.json();
			else return null;
		})) as User;
		console.log(this.user);
		this.$forceUpdate();
	},
	components: {
		UserBanner
	},
	methods: {
		LoginClick() {
			window.location.href = "https://discord.com/oauth2/authorize?client_id=1183362236509601813&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Flogin&scope=identify+email";
		},
		LogoutClick() {
			window.location.href = "/logout";
		}
	}
});
</script>
