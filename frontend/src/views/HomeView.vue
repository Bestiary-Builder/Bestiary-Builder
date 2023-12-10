<template>
	<div class="content-container">
		<div class="content"><StatblockEditor /></div>
		<div class="content"><StatblockRenderer :data="{key: 5}" /></div>
	</div>
	<div class="login-test">
		<button @click.prevent="LoginClick">Login</button>
		<p v-if="user">Logged in as {{ user.global_name }} ({{ user.username }})</p>
		<p v-else>Not logged in</p>
		<button @click.prevent="LogoutClick">Logout</button>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {user} from "../main";
import StatblockRenderer from "../widgets/StatblockRenderer.vue";
import StatblockEditor from "../widgets/StatblockEditor.vue";
export default defineComponent({
	components: {
		StatblockRenderer,
		StatblockEditor
	},
	data: () => ({} as {user: user | null}),
	async mounted() {
		this.user = (await fetch("/user").then((response: any) => {
			console.log(response.status);
			if (response.status == 200) return response.json();
			else return null;
		})) as user;
		console.log(this.user);
		this.$forceUpdate();
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

<style scoped lang="less">
.content-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	height: 60rem;
	gap: 2rem;
}

.content {
	background-color: rgb(46, 44, 44);
	display: flex;
}
</style>
