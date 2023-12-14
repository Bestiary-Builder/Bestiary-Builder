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
import {user, loginLink} from "@/main";
export default defineComponent({
	data() {
		return {
			user: null as User | null
		}
	},
	async mounted() {
		this.user = await user;
		console.log(this.user);
	},
	components: {
		UserBanner
	},
	methods: {
		LoginClick() {
			window.location.href = loginLink;
		},
		LogoutClick() {
			window.location.href = "/logout";
		}
	}
});
</script>
