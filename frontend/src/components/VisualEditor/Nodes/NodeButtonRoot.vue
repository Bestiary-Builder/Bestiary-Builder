<script setup lang="ts">
import type { Ref } from "vue";
import type { ButtonInteraction } from "~/shared";
import { inject, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import TypeHintedEditor from "@/components/FormInputs/TypeHintedEditor.vue";

const currentEffect = inject<Ref<ButtonInteraction>>("currentEffect");

useDataCleanup(currentEffect, ["verb", "style"]);

const isCustom = ref(false);

watch(() => currentEffect!.value?.style, () => {
	const style = currentEffect?.value.style;
	if (!style || (style && ["1", "2", "3", "4"].includes(style)))
		isCustom.value = false;
	else isCustom.value = true;
});
</script>

<template>
	<template v-if="currentEffect">
		<v-row dense>
			<v-col cols="12">
				<SectionHeader :title="`Button (${currentEffect.label.substring(0, 40).trim()})`" />
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="currentEffect.label" label="Button Label"
					:class="{ required: currentEffect.label.length === 0 }" />
			</v-col>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.verb" label="Verb" placeholder="attacks with" />


			</v-col>
			<v-col cols="6">
				<v-select v-model="currentEffect.style" label="Button Style" :items="[
					{ title: 'Blurple (default)', value: null, props: { style: 'color: #3865F2' } },
					{ title: 'Grey', value: '2', props: { style: 'color: #aaaaaa' } },
					{ title: 'Green', value: '3', props: { style: 'color: #248045' } },
					{ title: 'Red', value: '4', props: { style: 'color: #DA373C' } },
					{ title: 'Custom Expression', value: 'custom' },
				]" />
			</v-col>
			<v-col cols="6">
				<template v-if="isCustom">
					<TypeHintedEditor v-model="(currentEffect.style as string)" label="Custom Style Expression" />
				</template>
			</v-col>

			<v-col cols="12">
				<SectionHeader title="Casting Overrides" />
				<small>
					Use these options to pass casting information about the caster to the button, or arbritary number
					variables
					you can
					use for anything, such as a number of dice. Use the variables below in your button automation to
					access the
					values
					you set here.
				</small>
			</v-col>

			<v-col cols="6">
				<TypeHintedEditor v-model="(currentEffect.defaultDC as string)" label="Default DC (spell_dc)" />
			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="(currentEffect.defaultAttackBonus as string)"
					label="Default Attack Bonus (spell_attack_bonus)" />
			</v-col>
			<v-col cols="6">
				<TypeHintedEditor v-model="(currentEffect.defaultCastingMod as string)"
					label="Default Casting Modifier (spell)" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
