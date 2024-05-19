<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "@/utils/store";
import { getLoginRoute, sendToLogin, useFetch } from "@/utils/utils";
import { toast } from "@/utils/app/toast";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue";

const router = useRouter();

onMounted(async () => {
	const search = new URLSearchParams(window.location.search);
	const code = search.get("code");
	if (code && !store.user) {
		const { success, error } = await useFetch(`/api/login/${code}`);
		if (success) {
			toast.success("Succesfully logged in");
			window.location.href = getLoginRoute();
		}
		else {
			toast.error(error);
			await router.push("/user");
		}
	}
});

const logoutClick = async () => {
	const { success, error } = await useFetch("/api/logout");
	if (success)
		location.reload();
	else
		toast.error(error);
};
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'User Settings',
				isCurrent: true
			}
		]" :is-less-wide="true"
	/>
	<div class="content less-wide">
		<div v-if="!store.user">
			<p> You are not logged in. Login with Discord to log in.</p>
			<hr>
			<button class="btn confirm" @click.prevent="sendToLogin($route.path)">
				Login
			</button>
		</div>
		<div v-else>
			<p> You are logged in to Bestiary Builder with Discord as <b> {{ store.user.username }} </b>.</p>
			<p> You have been a user of Bestiary Builder since <b>{{ store.user.joinedAt ? new Date(store.user.joinedAt).toDateString() : "Not Found" }}</b>.</p>
			<p> You have created <b>{{ store.user.bestiaries.length }}</b> bestiaries since then.</p>
			<p> Your user id is <code>{{ store.user._id }}</code>.</p>
			<p v-if="store.user.supporter === 0" class="patreon" /><p>
				If you enjoy using our site, consider supporting us on Patreon!
				As a Patreon, you will have several benefits and your support will help Bestiary Builder stay online.
			</p>
			<span class="center"> <JoinPatreon /></span>
			<p v-if="store.user.supporter === 1">
				You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
				If you cannot see your name display change on the website yet, make sure to join our discord.
			</p>
			<p v-if="store.user.supporter === 2">
				You support us on Patreon as a <b> Greatwyrm </b> Tier supporter. Thank you so much for your support!
				If you cannot see your name display change on the website yet, make sure to join our discord.
			</p>
			<hr>
			<button class="btn" @click.prevent="logoutClick">
				Log out of Bestiary Builder
			</button>
		</div>
	</div>
</template>

<style scoped lang="less">
.content div {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;

	.patreon {
		margin-top: 1rem;
		color: orangered;
	}
	.center {
		display: flex;
		justify-content: center;
	}

	.btn {
		width: fit-content;
		margin: 1rem auto;
	}
}

hr {
	width: 100%;
}
</style>
