<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackModel } from "~/shared";
import { inject, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import { useRules } from "vuetify/labs/rules";

const currentEffect = inject<Ref<AttackModel>>("currentEffect");

useDataCleanup(currentEffect, ["thumb", "verb", "proper", "phrase", "criton", "extra_crit_damage", "activation_type", "list_display_override"]);

const setName = inject<false | Function>("setActionName");

const rules = useRules()
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Attack Model" />
		<div class="two-wide">
			<div>
				<v-text-field v-model="currentEffect.name" label="Attack Name" :rules="[rules.required()]" />
				<small v-if="setName" style="font-size: x-small; cursor: pointer" role="button"
					@click="setName(currentEffect.name)"> <i>Click here to set the name of the statblock feature to this
						name.</i> </small>
			</div>
			<div>
				<v-text-field v-model="currentEffect.thumb" label="Thumbnail URL" />
			</div>
			<v-text-field v-model="currentEffect.verb" label="Verb" placeholder="attacks with" persistent-placeholder />
			<v-checkbox v-model="currentEffect.proper" label="Name is proper noun" />
		</div>
		<v-textarea v-model="currentEffect.phrase" label="Flavor Text" rows="5" />

		<div class="two-wide">
			<v-select v-model="currentEffect.criton" label="Crit On" :items="[
				{ title: '(crit on 20)', value: null },
				...Array.from({ length: 20 }, (_, i) => ({ title: (20 - i).toString(), value: 20 - i })),
			]" />
			<v-text-field v-model="currentEffect.extra_crit_damage" label="Extra Crit Damage" />
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
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
			<v-text-field v-model="currentEffect.list_display_override" label="List display override" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
