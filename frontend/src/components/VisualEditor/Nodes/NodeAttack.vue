<script setup lang="ts">
import type { Ref } from "vue";
import type { Attack } from "~/shared";
import { inject, onMounted, ref } from "vue";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Attack>>("currentEffect");
const isCustom = ref(false);

onMounted(() => {
	if (currentEffect?.value.adv !== null) {
		if (!["-2", "-1", "1"].includes(currentEffect?.value.adv ?? "1")) {
			isCustom.value = true;
		}

		if (currentEffect!.value.adv === "0") {
			delete currentEffect!.value.adv;
		}
	}
});

const handleChange = () => {
	if (currentEffect?.value.adv === "custom") {
		isCustom.value = true;
		currentEffect.value.adv = "";
	}
	else {
		isCustom.value = false;
	}
};

useDataCleanup(currentEffect, ["attackBonus", "adv"]);
</script>

<template>
	<template v-if="currentEffect">
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Attack" />
			</v-col>

			<v-col cols="12">
				<TypeHintedEditor id="attackBonus" v-model="currentEffect.attackBonus" label="Attack Bonus" />
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-select
					v-model="currentEffect.adv" label="Advantage (optional)" title="Advantage" :items="[
						{ title: 'Flat', value: null },
						{ title: 'Advantage', value: '1' },
						{ title: 'Elven Advantage', value: '2' },
						{ title: 'Disadvantage', value: '-1' },
						isCustom
							? { title: 'Custom', value: currentEffect.adv }
							: { title: 'Custom', value: 'custom' },
					]" @update:model-value="handleChange"
				/>
			</v-col>

			<v-col cols="6">
				<template v-if="isCustom">
					<TypeHintedEditor v-model="currentEffect.adv" label="Custom Advantage" />
				</template>
			</v-col>
		</v-row>
	</template>
</template>
