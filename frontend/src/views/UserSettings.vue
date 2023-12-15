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
import {user, loginLink, handleApiResponse, toast, type error} from "@/main";
export default defineComponent({
	data() {
		return {
			user: null as User | null
		};
	},
	async mounted() {
		//Login handling:
		let search = new URLSearchParams(window.location.search);
		let code = search.get("code");
		if (code) {
			await fetch("/api/login/" + code).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Succesfully logged in");
					window.location.href = "/";
				} else {
					toast.error((result.data as error).error);
				}
			});
		} else {
			this.user = await user;
			console.log(this.user);
		}
	},
	components: {
		UserBanner
	},
	methods: {
		LoginClick() {
			window.location.href = loginLink;
		},
		async LogoutClick() {
			await fetch("/api/logout").then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					toast.success("Succesfully logged out");
				} else {
					toast.error((result.data as error).error);
				}
			});
		}
	}
});
</script>
