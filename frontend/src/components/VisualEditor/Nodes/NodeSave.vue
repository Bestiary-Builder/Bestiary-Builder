<script setup lang="ts">
import type { Ref } from "vue";
import type { Save } from "~/shared";
import { inject, watch } from "vue";
import { fullStatNames } from "@/utils/constants";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

const currentEffect = inject<Ref<Save>>("currentEffect");

if (!Object.hasOwn(currentEffect!.value, "adv"))
	currentEffect!.value.adv = 0;

watch(() => currentEffect!.value?.adv, () => {
	if (currentEffect!.value?.adv === 0)
		delete currentEffect!.value.adv;
});

useDataCleanup(currentEffect, ["dc"]);
</script>

<template>
	<template v-if="currentEffect">
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Saving Throw" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.stat" label="Save Stat" title="Saving throw stat"
					:items="Object.entries(fullStatNames).map(([value, label]) => ({ title: label, value }))" />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<TypeHintedEditor v-model="currentEffect.dc" label="DC (optional)" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.adv" label="Advantage (optional)" :items="[
					{ title: 'Flat', value: 0 },
					{ title: 'Advantage', value: 1 },
					{ title: 'Disadvantage', value: -1 },
				]" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
