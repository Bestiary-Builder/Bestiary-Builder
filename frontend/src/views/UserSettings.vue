<template>
<Breadcrumbs :routes="[
{
	path: '',
	text: 'User Settings',
	isCurrent: true
}
]" :isLessWide="true"/> 
<div class="content less-wide">
	<div v-if="!user">
		<p> You are not logged in. Login with Discord to log in.</p>
		<hr />
		<button class="btn confirm" @click.prevent="sendToLogin($route.path)">Login</button>
	</div>
	<div v-else>
		<p> You are logged in to Bestiary Builder with Discord as <b> {{ user.username }} </b>.</p>
		<p> You have been a user of Bestiary Builder since <b>{{ user.joinedAt ? new Date(user.joinedAt).toDateString() : "Not Found" }}</b>.</p>
		<p> You have created <b>{{ user.bestiaries.length }}</b> bestiaries since then.</p>
		<p> Your user id is <code>{{ user._id }}</code>.</p>
		<p v-if="user.supporter == 0" class="patreon" >
			<p> 
				If you enjoy using our site, consider supporting us on Patreon! 
				As a Patreon, you will have several benefits and your support will help Bestiary Builder stay online.
			</p>
			<span class="center"> <JoinPatreon /></span>
		</p>
		<p v-if="user.supporter == 1">
			You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
			If you cannot see your name display change on the website yet, make sure to join our discord.
		</p>
		<p v-if="user.supporter == 2">
			You support us on Patreon as a <b> Greatwyrm </b> Tier supporter. Thank you so much for your support!
			If you cannot see your name display change on the website yet, make sure to join our discord.
		</p>
		<hr />
		<button @click.prevent="logoutClick" class="btn">Log out of Bestiary Builder </button>
	</div>
</div>

</template>

<script setup lang="ts">
import { onMounted, ref} from "vue";
import type {User} from "~/shared";
import {user as getUser, sendToLogin, getLoginRoute, handleApiResponse, toast, type error} from "@/main";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue"
import { useRouter } from "vue-router";

const user = ref<User | null>(null);
const router = useRouter();

onMounted(async () => {
	let search = new URLSearchParams(window.location.search);
	let code = search.get("code");
	if (code && !(await getUser)) {
		await fetch("/api/login/" + code).then(async (response) => {
			let result = await handleApiResponse(response);
			if (result.success) {
				toast.success("Succesfully logged in");
				window.location.href = getLoginRoute();
			} else {
				toast.error((result.data as error).error);
				router.push("/user");
			}
		});
	}  else {
		user.value = await getUser
	}
})

const logoutClick = async () => {
	await fetch("/api/logout").then(async (response) => {
		let result = await handleApiResponse(response);
		if (result.success) {
			location.reload()
		} else {
			toast.error((result.data as error).error);
		}
	});
}
</script>
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