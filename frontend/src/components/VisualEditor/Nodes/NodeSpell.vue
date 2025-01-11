<script setup lang="ts">
import { type Ref, inject, onMounted, ref, watch } from "vue";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import { useFetch } from "@/utils/utils";
import type { Spell } from "~/shared";

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
		<LabelledComponent title="Spell" for="spell">
			<v-select v-model="currentEffect.id" :options="spells" input-id="spell" label="label" :reduce="(spell : any) => spell.id" :clearable="false" placeholder="(default level)" />
		</LabelledComponent>

		<SectionHeader title="Additional Options" />

		<div class="two-wide">
			<LabelledComponent title="Level" for="level">
				<select id="level" v-model="currentEffect.level" class="ghost">
					<option :value="null">
						(default level)
					</option>
					<option v-for="x in 10" :key="x" :value="x - 1">
						{{ x - 1 }}
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent title="Parent Effect" for="parent">
				<input id="parent" v-model="currentEffect.parent" type="text">
			</LabelledComponent>
		</div>

		<SectionHeader title="Caster Spellcasting Override" />

		<div class="two-wide">
			<LabelledComponent title="DC" for="dc">
				<div class="input-wrapper">
					<input id="dc" v-model="currentEffect.dc" type="text"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Attack Bonus" for="attackBonus">
				<div class="input-wrapper">
					<input id="attackBonus" v-model="currentEffect.attackBonus" type="text"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Casting Modifier" for="castingMod">
				<div class="input-wrapper">
					<input id="castingMod" v-model="currentEffect.castingMod" type="text"><IntExpression />
				</div>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
