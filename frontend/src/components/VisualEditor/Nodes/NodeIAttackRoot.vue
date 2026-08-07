<script setup lang="ts">
import type { Ref } from "vue";
import type { AttackInteraction } from "~/shared";
import { inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<AttackInteraction>>("currentEffect");
useDataCleanup(currentEffect, ["defaultAttackBonus", "defaultCastingMod", "defaultDC"], { attack: ["activation_type", "criton", "extra_crit_damage", "phrase", "proper", "thumb", "verb"] });
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader :title="`Attack (${currentEffect.attack.name})`" />
		<div class="two-wide">
			<v-text-field v-model="currentEffect.attack.name" label="Attack Name*"
				:class="{ required: currentEffect.attack.name.length === 0 }" />
			<v-text-field v-model="currentEffect.attack.thumb" label="Thumbnail URL" />
			<v-text-field v-model="currentEffect.attack.verb" label="Verb" placeholder="attacks with"
				persistent-placeholder />
			<v-checkbox v-model="currentEffect.attack.proper" label="Name is proper noun" />
		</div>
		<v-textarea v-model="currentEffect.attack.phrase" label="Flavor Text" rows="5" />

		<div class="two-wide">
			<v-select v-model="currentEffect.attack.criton" label="Crit On" :items="[
				{ title: '(crit on 20)', value: null },
				...Array.from({ length: 20 }, (_, i) => ({ title: (20 - i).toString(), value: 20 - i })),
			]" />
			<v-text-field v-model="currentEffect.attack.extra_crit_damage" label="Extra Crit Damage" />
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-select v-model="currentEffect.attack.activation_type" label="Action Type" title="Activation Type" :items="[
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
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
