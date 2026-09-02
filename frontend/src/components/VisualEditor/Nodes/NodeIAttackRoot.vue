<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction } from "~/shared";
import { inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

const currentEffect = inject<Ref<AttackInteraction>>("currentEffect");
useDataCleanup(currentEffect, ["defaultAttackBonus", "defaultCastingMod", "defaultDC"], { attack: ["activation_type", "criton", "extra_crit_damage", "phrase", "proper", "thumb", "verb"] });
</script>

<template>
	<template v-if="currentEffect">
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader :title="`Attack (${currentEffect.attack.name})`" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.attack.name" label="Attack Name*"
					:class="{ required: currentEffect.attack.name.length === 0 }" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.attack.thumb" label="Thumbnail URL" />

			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.attack.verb" label="Verb" placeholder="attacks with"
					persistent-placeholder />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="currentEffect.attack.proper" label="Name is proper noun" hide-details />

			</v-col>
			<v-col cols="12">
				<v-textarea v-model="currentEffect.attack.phrase" label="Flavor Text" rows="5" />

			</v-col>
			<v-col cols="6">
				<v-select v-model="currentEffect.attack.criton" label="Crit On" :items="[
					{ title: '(crit on 20)', value: null },
					...Array.from({ length: 20 }, (_, i) => ({ title: (20 - i).toString(), value: 20 - i })),
				]" />
			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.attack.extra_crit_damage" label="Extra Crit Damage" />
			</v-col>
			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.attack.activation_type" label="Action Type" title="Activation Type"
					:items="[
						{ title: 'Attack', value: null },
						{ title: 'Action', value: 1 },
						{ title: 'No Action', value: 2 },
						{ title: 'Bonus Action', value: 3 },
						{ title: 'Reaction', value: 4 },
						{ title: 'Minute', value: 6 },
						{ title: 'Hour', value: 7 },
						{ title: 'Special', value: 8 },
						{ title: 'Legendary', value: 9 },
						{ title: 'Mythic', value: 10 },
						{ title: 'Lair', value: 11 },
					]" />
			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.defaultAttackBonus" label="Default Attack Bonus" />

			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.defaultCastingMod" label="Default Casting Modifier" />
			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.defaultDC" label="Default DC" />
			</v-col>

		</v-row>



		<v-row>

		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
