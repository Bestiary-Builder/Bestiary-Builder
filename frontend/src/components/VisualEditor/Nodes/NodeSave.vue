<script setup lang="ts">
import { type Ref, inject, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import IntExpression from "./shared/IntExpression.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import { fullStatNames } from "@/utils/constants";
import type { Save } from "~/shared";

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
			<LabelledComponent title="Save Stat" for="saveStat">
				<select id="saveStat" v-model="currentEffect.stat" title="Saving throw stat" class="ghost">
					<option v-for="(label, value) in fullStatNames" :key="value" :value="value">
						{{ label }}
					</option>
				</select>
			</LabelledComponent>
		</div>
		<SectionHeader title="Additional Options" />
		<LabelledComponent title="DC" for="dc">
			<div class="input-wrapper">
				<input id="dc" v-model="currentEffect.dc" type="text" placeholder="DC (Optional)"><IntExpression />
			</div>
		</LabelledComponent>
		<div class="two-wide">
			<LabelledComponent title="Advantage" for="advantage">
				<select id="sortTargetBy" v-model="currentEffect.adv" placeholder="Advantage (optional)" title="Advantage" class="ghost">
					<option :value="0">
						Flat
					</option>
					<option :value="1">
						Advantage
					</option>
					<option :value="-1">
						Disadvantage
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
