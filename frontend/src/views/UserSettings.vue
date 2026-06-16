<script setup lang="ts">
import { ref } from "vue";
import { store } from "@/utils/store";
import { sendToLogin, useFetch } from "@/utils/utils";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue";
import { type Bestiary, SupporterStatus, type User } from "~/shared";
import { toast } from "@/utils/app/toast";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";

const logoutClick = async () => {
	const { success, error } = await useFetch("/api/logout");
	if (success)
		location.reload();
	else toast.error(error);
};

const bestiaryCount = ref(0);
if (store.user)
	useFetch<Bestiary[]>(`/api/user/${store.user.id}/bestiaries`).then(result => bestiaryCount.value = result.data?.length ?? 0).catch(() => { });

const design = ref();
design.value = store.user?.statblockDesign;

const layout = ref();
layout.value = store.user?.statblockLayout;

const editor = ref();
editor.value = store.user?.preferredEditor;

const saveSettings = async () => {
	const { success, data } = await useFetch("/api/user/updatePreferences", "POST", { statblockDesign: design.value, statblockLayout: layout.value, preferredEditor: editor.value });
	if (success)
		store.user = (data as any).data;
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
			<button class="btn confirm" @click.prevent="sendToLogin($route.path)">
				Login
			</button>
		</div>
		<div v-else>
			<div class="list">
				<p> You are logged in to Bestiary Builder with Discord as <b> {{ store.user.username }} </b>.</p>
				<p> You have been a user of Bestiary Builder since <b>{{ store.user.joinedAt ? new Date(store.user.joinedAt).toDateString() : "Not Found" }}</b>.</p>
				<p> You have created <b>{{ bestiaryCount }}</b> bestiaries since then.</p>
				<p v-if="store.user.supporter === SupporterStatus.none">
					If you enjoy using our site, consider supporting us on Patreon!
					As a Patreon, you will have several benefits and your support will help Bestiary Builder stay online.
				</p>
				<span v-if="!(store.user.supporter === SupporterStatus.wirmling || store.user.supporter === SupporterStatus.greatwyrm)" class="center"> <JoinPatreon /></span>
				<p v-if="store.user.supporter === SupporterStatus.wirmling">
					You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
					If you cannot see your name display change on the website yet, make sure to join our discord.
				</p>
				<p v-if="store.user.supporter === SupporterStatus.greatwyrm">
					You support us on Patreon as a <b> Greatwyrm </b> Tier supporter. Thank you so much for your support!
					If you cannot see your name display change on the website yet, make sure to join our discord.
				</p>
			</div>

			<div class="container">
				<SectionHeader
					title="User Preferences"
				/>
				<div class="preferences">
					<LabelledComponent title="Statblock Layout">
						<select v-model="layout">
							<option value="SL_2024">
								2024 (OneD&D / Default)
							</option>
							<option value="SL_2014">
								2014 (5e2014)
							</option>
						</select>
					</LabelledComponent>

					<LabelledComponent title="Statblock Design">
						<select v-model="design">
							<option value="BestiaryBuilder">
								Bestiary Builder (Default)
							</option>
							<option value="Beyond">
								Beyond
							</option>
							<option value="Odyssey">
								Odyssey
							</option>
						</select>
					</LabelledComponent>

					<LabelledComponent title="Automation Editor">
						<select v-model="editor">
							<option value="Visual">
								Visual (Default)
							</option>
							<option value="Code">
								Code
							</option>
						</select>
					</LabelledComponent>

					<button class="btn confirm" @click.prevent="saveSettings">
						Save Preferences
					</button>
				</div>
				<hr>
				<button class="btn" @click.prevent="logoutClick">
					Log out of Bestiary Builder
				</button>
			</div>
		</div>
		{{ store.user }}
	</div>
</template>

<style scoped lang="less">
.content div {
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

	&.container {
		display: grid;
		margin-top: 1rem;

		.preferences {
			display: flex;
			flex-direction: column;
			gap: 1rem;

			select {
				max-width: 300px;
			}
		}
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
}

hr {
	width: 100%;
}
</style>
