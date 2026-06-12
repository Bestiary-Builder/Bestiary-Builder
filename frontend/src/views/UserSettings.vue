<script setup lang="ts">
import { ref } from "vue";
import { store } from "@/utils/store";
import { sendToLogin, useFetch } from "@/utils/utils";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue";
import { type Bestiary, SupporterStatus } from "~/shared";
import { toast } from "@/utils/app/toast";

const logoutClick = async () => {
	const { success, error } = await useFetch("/api/logout");
	if (success)
		location.reload();
	else toast.error(error);
};

const bestiaryCount = ref(0);
if (store.user)
	useFetch<Bestiary[]>(`/api/user/${store.user.id}/bestiaries`).then(result => bestiaryCount.value = result.data?.length ?? 0).catch(() => { });
</script>

<template>
	<p>Test</p>
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
			<p> You have created <b>{{ bestiaryCount }}</b> bestiaries since then.</p>
			<p v-if="store.user.supporter === SupporterStatus.none">
				If you enjoy using our site, consider supporting us on Patreon!
				As a Patreon, you will have several benefits and your support will help Bestiary Builder stay online.
			</p>
			<span class="center"> <JoinPatreon /></span>
			<p v-if="store.user.supporter === SupporterStatus.wirmling">
				You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
				If you cannot see your name display change on the website yet, make sure to join our discord.
			</p>
			<p v-if="store.user.supporter === SupporterStatus.greatwyrm">
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

	.settings {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;

		label {
			font-size: 1rem;
			width: 75%;

			span {
				padding-left: 0.5rem;
			}
		}
	}
}

hr {
	width: 100%;
}
</style>
