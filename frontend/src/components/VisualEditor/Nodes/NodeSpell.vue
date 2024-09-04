<script setup lang="ts">
import { type Ref, inject, onMounted, ref, watch } from "vue";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import { useFetch } from "@/utils/utils";
import type { Spell } from "~/shared";

const currentNode = inject<Ref<{ node: Spell; context: string[] }>>("currentNode");
const data = currentNode!.value.node;

type Spells = Array<{ label: string; id: number }>;
const spells = ref<Spells>([]);
onMounted(async () => {
	const { success, data } = await useFetch<Spells>("/api/gamedata/spells");
	if (success)
		spells.value = data;
});

watch(() => data?.level, () => {
	if (data?.level === null)
		delete data.level;
});

watch(() => data?.attackBonus, () => {
	if (data?.attackBonus === "")
		delete data.attackBonus;
});

watch(() => data?.castingMod, () => {
	if (data?.castingMod === "")
		delete data.castingMod;
});

watch(() => data?.parent, () => {
	if (!data?.parent)
		delete data.parent;
});
</script>

<template>
	<template v-if="data">
		<SectionHeader title="Cast Spell" />
		<LabelledComponent title="Spell" for="spell">
			<v-select v-model="data.id" :options="spells" input-id="spell" label="label" :reduce="(spell : any) => spell.id" :clearable="false" />
		</LabelledComponent>
		<SectionHeader title="Additional Options" />

		<div class="two-wide">
			<LabelledComponent title="Level" for="level">
				<select v-model="data.level" class="ghost">
					<option :value="null">
						-
					</option>
					<option v-for="x in 10" :key="x" :value="x - 1">
						{{ x - 1 }}
					</option>
				</select>
			</LabelledComponent>
			<LabelledComponent title="DC" for="dc">
				<div class="input-wrapper">
					<input id="dc" v-model="data.dc" type="text"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Attack Bonus" for="attackBonus">
				<div class="input-wrapper">
					<input id="attackBonus" v-model="data.attackBonus" type="text"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Casting Modifier" for="castingMod">
				<div class="input-wrapper">
					<input id="castingMod" v-model="data.castingMod" type="text"><IntExpression />
				</div>
			</LabelledComponent>
			<LabelledComponent title="Parent Effect" for="parent">
				<input id="parent" v-model="data.parent" type="text">
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
