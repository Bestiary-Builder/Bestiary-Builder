<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackModel } from "~/shared";
import { inject } from "vue";
import { useRules } from "vuetify/labs/rules";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<AttackModel>>("currentEffect");

useDataCleanup(currentEffect, ["thumb", "verb", "proper", "phrase", "criton", "extra_crit_damage", "activation_type", "list_display_override"]);

// eslint-disable-next-line ts/no-unsafe-function-type
const setName = inject<false | Function>("setActionName");

const rules = useRules();
</script>

<template>
	<template v-if="currentEffect">
		<v-row dense>
			<v-col cols="12">
				<SectionHeader title="Attack Model" />
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="currentEffect.name" label="Attack Name" :rules="[rules.required()]" />
				<small v-if="setName" style="font-size: x-small; cursor: pointer" role="button"
					@click="setName(currentEffect.name)"> <i>Click here to set the name of the statblock feature to
						this
						name.</i> </small>
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="currentEffect.thumb" label="Thumbnail URL" />

			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.verb" label="Verb" placeholder="attacks with"
					persistent-placeholder />
			</v-col>
			<v-col cols="6">
				<v-checkbox v-model="currentEffect.proper" label="Name is proper noun" hide-details />

			</v-col>
			<v-col cols="12">
				<v-textarea v-model="currentEffect.phrase" label="Flavor Text" rows="5" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.criton" label="Crit On" :items="[
					{ title: '(crit on 20)', value: null },
					...Array.from({ length: 20 }, (_, i) => ({ title: (20 - i).toString(), value: 20 - i })),
				]" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.extra_crit_damage" label="Extra Crit Damage" />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.activation_type" label="Action Type" title="Activation Type" :items="[
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
				]" placeholder="(attack)" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.list_display_override" label="List display override" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
