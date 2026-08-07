<script setup lang="ts">
import type { Ref } from "vue";
import type { Spell } from "~/shared";
import { inject, onMounted, ref } from "vue";
import { useFetch } from "@/utils/utils";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Spell>>("currentEffect");

type Spells = { label: string; id: number }[];
const spells = ref<Spells>([]);
onMounted(async () => {
	const { success, data } = await useFetch<{ success: boolean; data: Record<string, number> }>("https://api.avrae.io/gamedata/spells");
	if (success) {
		const temp = [];
		for (const spell of Object.entries(data.data))
			temp.push({ label: spell[0], id: spell[1] });

		spells.value = temp;
	}
});

useDataCleanup(currentEffect, ["level", "attackBonus", "castingMod", "parent"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Cast Spell" />
		<v-autocomplete v-model="currentEffect.id" label="Spell" :items="spells" item-title="label" item-value="id" />

		<SectionHeader title="Additional Options" />

		<div class="two-wide">
			<v-select v-model="currentEffect.level" label="Level" :items="[
				{ title: '(default level)', value: null },
				...Array.from({ length: 10 }, (_, i) => ({ title: i.toString(), value: i })),
			]" />
			<v-text-field v-model="currentEffect.parent" label="Parent Effect" />
		</div>

		<SectionHeader title="Caster Spellcasting Override" />
		<div class="two-wide">
			<v-text-field v-model="currentEffect.dc" label="DC" hint="IntExpression" />
			<v-text-field v-model="currentEffect.attackBonus" label="Attack Bonus" hint="IntExpression" />
			<v-text-field v-model="currentEffect.castingMod" label="Casting Modifier" hint="IntExpression" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
