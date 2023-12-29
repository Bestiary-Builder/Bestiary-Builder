<template>
<Breadcrumbs :routes="[
{
	path: '',
	text: 'User Settings',
	isCurrent: true
}
]" :isLessWide="true"/> 
<div class="content">
	<div v-if="!user">
		<p> You are not logged in. Login with Discord to log in.</p>
		<hr />
		<button class="btn confirm" @click.prevent="LoginClick">Login</button>
	</div>
	<div v-else>
		<p> You are logged in to Bestiary Builder with Discord as <b> {{ user.username }} </b>.</p>
		<p> You have been a user of Bestiary Builder since <b>{{ user.joinedAt ? new Date(user.joinedAt).toDateString() : "Not Found" }}</b>.</p>
		<p> You have created <b>{{ user.bestiaries.length }}</b> bestiaries since then.</p>
		<p v-if="user.supporter == 0">
			<p> 
				If you enjoy using our site, consider supporting us on Patreon! 
				As a Patreon, you will have several benefits and your support will help Bestiary Builder stay online.
			</p>
			<p class="center"> <JoinPatreon /></p>
		</p>
		<p v-if="user.supporter == 1">
			You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
		</p>
		<p v-if="user.supporter == 2">
			You support us on Patreon as a <b> Greatwyrm </b> Tier supporter. Thank you so much for your support!
		</p>
		<hr />
		<button @click.prevent="LogoutClick" class="btn">Log out of Bestiary Builder </button>
	</div>
</div>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/generic/types";
import UserBanner from "@/components/UserBanner.vue";
import {user, loginLink, handleApiResponse, toast, type error} from "@/main";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue"
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
			///console.log(this.user);
		}
	},
	components: {
		UserBanner,
		Breadcrumbs,
		JoinPatreon
	},
	methods: {
		LoginClick() {
			window.location.href = loginLink;
		},
		async LogoutClick() {
			await fetch("/api/logout").then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					location.reload()
				} else {
					toast.error((result.data as error).error);
				}
			});
		}
	}
});
</script>


<style scoped lang="less">
.content {
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: center;
	padding-bottom: 5rem;
}

@media screen and (min-width: 1080px) {
	.content div {
		min-width: 50rem;
		width: 50%;
	}
}

.content div {
	display: flex;
	flex-direction: column;
	gap: .5rem;
	
	.center {
		display: flex;
		justify-content: center;
	}

	& .btn {
		width: fit-content;
		margin: auto;	
	}
}

hr {
	width: 100%;
}

</style>