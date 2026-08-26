<script setup lang="ts">
import type { Bestiary, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { reactive, ref } from "vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { sendToLogin, useFetch } from "@/utils/utils";
import { SupporterStatus } from "~/shared";

const { addToast } = useToast();
const logoutClick = async () => {
	const { success, error } = await useFetch("/api/logout");
	if (success)
		location.reload();
	else addToast(error, { color: "error" });
	;
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

const creatureData = {
	core: {
		race: "Dragon",
		size: "Medium",
		speed: [
			{
				name: "Walk",
				unit: "ft",
				value: 30,
				comment: ""
			},
			{
				name: "Fly",
				unit: "ft",
				value: 60,
				comment: ""
			},
			{
				name: "Burrow",
				unit: "ft",
				value: 15,
				comment: ""
			}
		],
		senses: [
			{
				name: "Blindsight",
				unit: "ft",
				value: 10,
				comment: ""
			},
			{
				name: "Darkvision",
				unit: "ft",
				value: 60,
				comment: ""
			}
		],
		languages: [
			"Draconic"
		],
		proficiencyBonus: 2
	},
	misc: {
		telepathy: 0,
		featureHeaderTexts: {
			lair: "On initiative count 20 (losing initiative ties), the creature can take one of the following lair actions; it can't take the same lair action two rounds in a row",
			bonus: "",
			mythic: "",
			actions: "",
			features: "",
			regional: "The region containing the creatures lair can be transformed by its presence, creating one or more of the following effects:",
			legendary: "",
			reactions: ""
		},
		legActionsPerRound: 0,
		passivePerceptionOverride: null
	},
	defenses: {
		ac: {
			ac: 17,
			acSource: "natural armor"
		},
		hp: {
			override: null,
			numOfHitDie: 8,
			sizeOfHitDie: 8
		},
		immunities: [
			"Lightning"
		],
		resistances: [],
		vulnerabilities: [],
		conditionImmunities: []
	},
	features: {
		lair: [],
		bonus: [],
		mythic: [],
		actions: [
			{
				name: "Bite",
				automation: {
					_v: 2,
					name: "Bite",
					automation: [
						{
							type: "target",
							target: "each",
							effects: [
								{
									hit: [
										{
											type: "damage",
											damage: "1d10 + 3 [piercing] + 1d6 [lightning]",
											overheal: false
										}
									],
									miss: [],
									type: "attack",
									attackBonus: "5"
								}
							]
						},
						{
							text: "*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 8 (1d10 + 3) piercing damage plus 3 (1d6) lightning damage.",
							type: "text",
							title: "Effect"
						}
					],
					activation_type: 1
				},
				description: "*Melee Weapon Attack:* +5 to hit, reach 5 ft., one target. *Hit:* 8 (1d10 + 3) piercing damage plus 3 (1d6) lightning damage."
			},
			{
				name: "Lightning Breath (Recharge 5-6)",
				automation: null,
				description: "The dragon exhales lightning in a 30-foot line that is 5 feet wide. Each creature in that line must make a DC 12 Dexterity saving throw, taking 22 (4d10) lightning damage on a failed save, or half as much damage on a successful one."
			}
		],
		features: [],
		regional: [],
		legendary: [],
		reactions: []
	},
	abilities: {
		saves: {
			cha: {
				adv: null,
				override: null,
				isProficient: true
			},
			con: {
				adv: null,
				override: null,
				isProficient: true
			},
			dex: {
				adv: null,
				override: null,
				isProficient: true
			},
			int: {
				adv: null,
				override: null,
				isProficient: false
			},
			str: {
				adv: null,
				override: null,
				isProficient: false
			},
			wis: {
				adv: null,
				override: null,
				isProficient: true
			}
		},
		stats: {
			cha: 15,
			con: 15,
			dex: 10,
			int: 12,
			str: 17,
			wis: 11
		},
		skills: [
			{
				adv: null,
				override: null,
				skillName: "Perception",
				isExpertise: true,
				isProficient: false,
				isHalfProficient: false
			},
			{
				adv: null,
				override: null,
				skillName: "Stealth",
				isExpertise: false,
				isProficient: true,
				isHalfProficient: false
			}
		]
	},
	description: {
		cr: 3,
		xp: 700,
		name: "Blue Dragon Wyrmling",
		image: "",
		faction: "",
		alignment: "Lawful Evil",
		description: "",
		environment: "",
		isProperNoun: false
	},
	spellcasting: {
		casterSpells: {
			spellList: [
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[],
				[]
			],
			casterLevel: null,
			castingClass: null,
			spellSlotList: {},
			displayAsAction: false,
			spellDcOverride: null,
			customDescription: "",
			spellBonusOverride: null,
			spellCastingAbility: null,
			spellCastingAbilityOverride: null
		},
		innateSpells: {
			spellList: {
				0: [],
				1: [],
				2: [],
				3: []
			},
			isPsionics: false,
			displayAsAction: false,
			spellDcOverride: null,
			customDescription: "",
			noComponentsOfType: [
				"Material",
				"Verbal",
				"Somatic"
			],
			spellBonusOverride: null,
			spellCastingAbility: null
		}
	}
} as Statblock;

const AvraeToken = useLocalStorage("AvraeToken", "");

const layoutOptions = [
	{ title: "2024 (OneD&D / Default)", value: "SL_2024" },
	{ title: "2014 (5e2014)", value: "SL_2014" },
];

const statblockDesignOptions = [
	{ title: "Bestiary Builder (Default)", value: "BestiaryBuilder" },
	{ title: "Beyond", value: "Beyond" },
	{ title: "Odyssey", value: "Odyssey" },
	{ title: "Monster Manual (Compact)", value: "MonsterManual" },
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
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'User',
				isCurrent: true
			}
		]" :is-less-wide="true"
	/>
	<div class="content less-wide">
		<div v-if="!store.user">
			<p> You are not logged in. Login with Discord to begin.</p>
			<v-btn
				color="success" size="large" class="mt-4" prepend-icon="ic:sharp-discord"
				@click.prevent="sendToLogin($route.path)"
			>
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
					As a Patreon, you will have several benefits and your support will help Bestiary Builder stay
					online.
				</p>
				<span
					v-if="!(store.user.supporter === SupporterStatus.wirmling || store.user.supporter === SupporterStatus.greatwyrm)"
					class="center"
				>
					<a href="https://www.patreon.com/join/BestiaryBuilder" class="patreon">
						<v-icon icon="mdi:patreon" size="small" />
						<span> Become a patreon </span>
					</a>
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
							<v-select
								v-model="preferences.statblockLayout" label="Statblock Layout"
								:items="layoutOptions" variant="outlined" density="comfortable" width="400"
							/>
						</div>

						<v-icon-btn
							v-tooltip="'Set statblock layout to 2024 or 2014. This is appearance only.'"
							icon="mdi:information"
						/>
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon-btn text="Preview statblock style" icon="mdi:eye" v-bind="props" />
							</template>
							<v-card min-width="300" class="pa-4">
								<StatblockRenderer
									:data="creatureData" :statblock-design="preferences.statblockDesign"
									:is2024="preferences.statblockLayout === 'SL_2024'" style="max-width: 650px"
								/>
							</v-card>
						</DropdownMenu>
					</div>

					<div class="setting-container">
						<div>
							<v-select
								v-model="preferences.statblockDesign" :items="statblockDesignOptions"
								label="Statblock Design" variant="outlined" density="comfortable" width="400"
							/>
						</div>
						<v-icon-btn
							v-tooltip="'Change the visual design of the statblock. This changes its appearance only.'"
							icon="mdi:information"
							title="Setting information"
						/>

						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon-btn text="Preview statblock style" icon="mdi:eye" v-bind="props" />
							</template>
							<v-card min-width="300" class="pa-4">
								<StatblockRenderer
									:data="creatureData" :statblock-design="preferences.statblockDesign"
									:is2024="preferences.statblockLayout === 'SL_2024'" style="max-width: 650px"
								/>
							</v-card>
						</DropdownMenu>
					</div>

					<div class="setting-container">
						<div>
							<v-select
								v-model="preferences.preferredEditor" :items="preferredEditorOptions"
								label="Preferred Editor" variant="outlined" density="comfortable" width="400"
							/>
						</div>

						<v-icon-btn
							v-tooltip="'Set default automation editor to visual (button and layout) or code (YAML) editor.'"
							icon="mdi:information"
						/>
					</div>

					<div class="setting-container">
						<div>
							<v-select
								v-model="preferences.SRDVersion" :items="srdOptions" label="SRD Version"
								variant="outlined" density="comfortable" width="400"
							/>
						</div>
						<v-icon-btn
							v-tooltip="'Set whether creating Creatures and Features from the SRD should use the 2024 or 2014 list of options.'"
							icon="mdi:information"
						/>
					</div>

					<div>
						<v-btn color="success" size="large" @click.prevent="saveSettings">
							Save Preferences
						</v-btn>
					</div>

					<SectionHeader title="Avrae Integration" />
					<v-container class="pa-0">
						<small> With this setting you can edit character attacks and import attacks to characters
							directly within BB. <br>To enable it, set your Avrae Token below. Bestiary Builder does not
							store this
							token, it is only saved in your browser.
						</small>
						<v-text-field
							v-model="AvraeToken" label="Token" variant="outlined" class="mt-4"
							max-width="600"
						/>

						<small> To get the Token:
							<ol>
								<li>
									Log in on the <a
										href="https://avrae.io/dashboard/characters"
										style="color: rgb(var(--v-theme-primary))"
									> Avrae Dashboard
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
			gap: 1rem;
			padding: 0 0.5rem;

			.container {
				display: flex;
				flex-direction: column;
				gap: 0.6rem;
			}

			select {
				width: 300px;
			}

			.btn {
				margin-left: 0;
			}

			.setting-container {
				display: flex;
				flex-direction: row;
				gap: 0.5rem;

				& > div {
					margin: auto 0;
				}
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
