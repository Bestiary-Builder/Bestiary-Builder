<script setup lang="ts">
import { ref } from "vue";
import { store } from "@/utils/store";
import { sendToLogin, useFetch } from "@/utils/utils";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import JoinPatreon from "@/components/JoinPatreon.vue";
import { type Bestiary, type Stat, type Statblock, SupporterStatus } from "~/shared";
import { toast } from "@/utils/app/toast";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";

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
	if (success) {
		store.user = (data as any).data;
		toast.success("Successfully saved your preferences");
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
					<div class="with-button">
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
						<VDropdown :positioning-disabled="store.isMobile">
							<button v-tooltip="'Preview statblock'" aria-label="Preview statblock" class="btn-icon" style="color: orangered">
								<font-awesome-icon :icon="['fas', 'eye']" />
							</button>
							<template #popper>
								<div class="v-popper__custom-menu">
									<StatblockRenderer :data="creatureData" :statblock-design="design" :is2024="layout === 'SL_2024' " style="max-width: 650px" />
								</div>
							</template>
						</VDropdown>
					</div>

					<div class="with-button">
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
						<VDropdown :positioning-disabled="store.isMobile">
							<button v-tooltip="'Preview statblock'" aria-label="Preview statblock" class="btn-icon" style="color: orangered">
								<font-awesome-icon :icon="['fas', 'eye']" />
							</button>
							<template #popper>
								<div class="v-popper__custom-menu">
									<StatblockRenderer :data="creatureData" :statblock-design="design" :is2024="layout === 'SL_2024' " style="max-width: 650px" />
								</div>
							</template>
						</VDropdown>
					</div>

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
			padding: 0 0.5rem;

			.with-button {
				display: flex;
				gap: 1rem;
				align-items: flex-end;
			}

			select {
				width: 300px;
			}

			.btn {
				margin-left: 0;
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

.btn-icon {
	color: orangered;
	translate: 0 -3px;
}
</style>
