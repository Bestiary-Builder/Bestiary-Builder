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
		<SectionHeader title="Saving Throw" />
		<div class="two-wide">
			<v-select v-model="currentEffect.stat" label="Save Stat" title="Saving throw stat"
				:items="Object.entries(fullStatNames).map(([value, label]) => ({ title: label, value }))" />
		</div>
		<SectionHeader title="Additional Options" />
		<div>
			<TypeHintedEditor v-model="currentEffect.dc" label="DC (optional)" />
		</div>
		<div class="two-wide">
			<v-select v-model="currentEffect.adv" label="Advantage (optional)" :items="[
				{ title: 'Flat', value: 0 },
				{ title: 'Advantage', value: 1 },
				{ title: 'Disadvantage', value: -1 },
			]" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
