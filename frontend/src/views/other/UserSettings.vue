<script setup lang="ts">
import type { Bestiary, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, reactive, ref } from "vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { sendToLogin, useFetch } from "@/utils/utils";
import { defaultInterestingStatblock, SupporterStatus } from "~/shared";
import { useTheme } from "vuetify";
import { useThemePersistence } from "@/utils/app/theme";
import { useStatblockColors } from "@/utils/app/customTheme";

const { addToast } = useToast();
const logoutClick = async () => {
	const { success, error } = await useFetch("/api/logout");
	if (success)
		location.reload();
	else addToast(error, { color: "error" });
};

const bestiaryCount = ref(0);
if (store.user)
	useFetch<Bestiary[]>(`/api/user/${store.user.id}/bestiaries`).then(result => bestiaryCount.value = result.data?.length ?? 0).catch(() => { });

const preferences = reactive({
	statblockDesign: store.user?.statblockDesign,
	statblockLayout: store.user?.statblockLayout,
	preferredEditor: store.user?.preferredEditor,
	SRDVersion: store.user?.SRDVersion
});

const saveSettings = async () => {
	const { success, data } = await useFetch("/api/user/updatePreferences", "POST", preferences);
	if (success) {
		store.user = (data as any).data;
		void getUmami()?.track("Update preferences", preferences);
		addToast("Successfully saved your preferences", { color: "success" });
	}
};


const AvraeToken = useLocalStorage("AvraeToken", "");

const theme = useTheme()
const { themeOptions } = useThemePersistence()
const { statblockDesignOptions } = useStatblockColors()

const layoutOptions = [
	{ title: "2024 (OneD&D / Default)", value: "SL_2024" },
	{ title: "2014 (5e2014)", value: "SL_2014" },
];


const preferredEditorOptions = [
	{ title: "Visual (Default)", value: "Visual" },
	{ title: "Code", value: "Code" },
];

const srdOptions = [
	{ title: "2024 (Default)", value: "SRD_2024" },
	{ title: "2014", value: "SRD_2014" },
];
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'User',
			isCurrent: true
		}
	]" />
	<div class="content less-wide">
		<div v-if="!store.user">
			<p> You are not logged in. Login with Discord to begin.</p>
			<v-btn color="success" size="large" class="mt-4" prepend-icon="ic:sharp-discord"
				@click.prevent="sendToLogin($route.path)">
				Login
			</v-btn>
		</div>
		<div v-else>
			<div class="list">
				<p> You are logged in to Bestiary Builder with Discord as <b> {{ store.user.username }} </b>.</p>
				<p>
					You have been a user of Bestiary Builder since <b>{{ store.user.joinedAt ? new
						Date(store.user.joinedAt).toDateString() : "Not Found" }}</b>.
				</p>
				<p> You have created <b>{{ bestiaryCount }}</b> bestiaries since then.</p>
				<p v-if="store.user.supporter === SupporterStatus.none">
					If you enjoy using our site, consider supporting us on Patreon!
					As a Patreon Supporter, you will have several benefits and you will support the active development
					of Bestiary Builder.

				<ul>
					<li> You can create your own custom theme for the statblock and the website. </li>
					<li> You can create your own custom statblock theme. </li>
					<li> You can make feature requests directly to the developers. </li>
				</ul>
				</p>

				<span
					v-if="!(store.user.supporter === SupporterStatus.wirmling || store.user.supporter === SupporterStatus.greatwyrm)">
					<v-btn color="#f1465a" size="x-large" prepend-icon="mdi:patreon" class="mt-4 rounded"
						variant="elevated" href="https://www.patreon.com/join/BestiaryBuilder">
						Support us on Patreon
					</v-btn>
				</span>
				<p v-if="store.user.supporter === SupporterStatus.wirmling">
					You support us on Patreon as a <b> Wyrmling </b> Tier supporter. Thank you so much for your pledge!
					If you cannot see your name display change on the website yet, make sure to join our discord.
				</p>
				<p v-if="store.user.supporter === SupporterStatus.greatwyrm">
					You support us on Patreon as a <b> Greatwyrm </b> Tier supporter. Thank you so much for your
					support!
					If you cannot see your name display change on the website yet, make sure to join our discord.
				</p>
			</div>

			<div class="preferences-container mt-4">
				<SectionHeader title="User Preferences" />
				<div class="preferences mt-4">
					<div class="setting-container">
						<div>
							<v-select v-model="theme.global.name.value" :items="themeOptions" label="Theme"
								item-props="props" width="400" hide-details />

						</div>


					</div>
					<span style="font-size: smaller" class="pt-2">
						Custom theme is available to Patreon Supporters.
						<br> You can create your custom theme
						<RouterLink to="./user/theme" style="color: rgb(var(--v-theme-primary))"> on this page.
						</RouterLink>
					</span>

					<div class="setting-container">
						<div>
							<v-select v-model="preferences.statblockLayout" label="Statblock Layout"
								:items="layoutOptions" width="400" hide-details />
						</div>

						<v-icon-btn v-tooltip="'Set statblock layout to 2024 or 2014. This is appearance only.'"
							icon="mdi:information" />
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon-btn text="Preview statblock style" icon="mdi:eye" v-bind="props" />
							</template>
							<v-card min-width="300" class="pa-4">
								<StatblockRenderer :data="defaultInterestingStatblock"
									:statblock-design="preferences.statblockDesign"
									:is2024="preferences.statblockLayout === 'SL_2024'" style="max-width: 650px" />
							</v-card>
						</DropdownMenu>
					</div>

					<div class="setting-container">
						<div>
							<v-select v-model="preferences.statblockDesign" :items="statblockDesignOptions"
								label="Statblock Theme" width="400" hide-details />

						</div>

						<v-icon-btn
							v-tooltip="'Change the visual design of the statblock. This changes its appearance only.'"
							icon="mdi:information" title="Setting information" />

						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon-btn text="Preview statblock style" icon="mdi:eye" v-bind="props" />
							</template>
							<v-card min-width="300" class="pa-4">
								<StatblockRenderer :data="defaultInterestingStatblock"
									:statblock-design="preferences.statblockDesign"
									:is2024="preferences.statblockLayout === 'SL_2024'" style="max-width: 650px" />
							</v-card>
						</DropdownMenu>
					</div>
					<span style="font-size: smaller" class="pt-2">
						Custom statblock theme is available to Patreon Supporters.
						<br> You can create your custom statblock theme
						<RouterLink to="./user/theme" style="color: rgb(var(--v-theme-primary))"> on this page.
						</RouterLink>
					</span>
					<div class="setting-container">
						<div>
							<v-select v-model="preferences.preferredEditor" :items="preferredEditorOptions"
								label="Preferred Editor" width="400" hide-details />
						</div>

						<v-icon-btn
							v-tooltip="'Set default automation editor to visual (button and layout) or code (YAML) editor.'"
							icon="mdi:information" />
					</div>

					<div class="setting-container">
						<div>
							<v-select v-model="preferences.SRDVersion" :items="srdOptions" label="SRD Version"
								width="400" hide-details />
						</div>
						<v-icon-btn
							v-tooltip="'Set whether creating Creatures and Features from the SRD should use the 2024 or 2014 list of options.'"
							icon="mdi:information" />
					</div>
					<div class="my-6">
						<v-btn color="success" size="large" @click.prevent="saveSettings">
							Save Preferences
						</v-btn>
					</div>

					<div>
						<SectionHeader title="Avrae Integration" />
						<v-container class="pa-0">
							<small> With this setting you can edit character attacks and import attacks to characters
								directly within BB. <br>To enable it, set your Avrae Token below. Bestiary Builder does
								not
								store this
								token, it is only saved in your browser.
							</small>
							<v-text-field v-model="AvraeToken" label="Token" class="mt-4" max-width="600" />

							<small> To get the Token:
								<ol>
									<li>
										Log in on the <a href="https://avrae.io/dashboard/characters"
											style="color: rgb(var(--v-theme-primary))"> Avrae Dashboard
										</a>
									</li>
									<li>
										Open developer console (CTRL-SHIFT-I or Right click -> Inspect)
									</li>
									<li>
										Open the <code> Application </code> Tab.
									</li>
									<li>
										Choose Local Storage (https://avrae.io)
									</li>
									<li>
										Copy the entire value of the
										<code> avrae-token</code> key and paste it into the field above.
									</li>
								</ol>
							</small>
						</v-container>
					</div>

				</div>
			</div>
			<SectionHeader title="Log out" />
			<v-btn color="error" size="large" @click.prevent="logoutClick">
				Log out of Bestiary Builder
			</v-btn>
		</div>
	</div>
</template>

<style scoped lang="less">
.content div {
	.patreon {
		margin-top: 1rem;
		color: rgb(var(--v-theme-primary));
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

	&.preferences-container {
		.preferences {
			display: flex;
			flex-direction: column;
			padding: 0 0.5rem;

			.setting-container {
				display: flex;
				flex-direction: row;
				gap: 0.5rem;
				align-items: center;
				margin-top: 2rem;
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
