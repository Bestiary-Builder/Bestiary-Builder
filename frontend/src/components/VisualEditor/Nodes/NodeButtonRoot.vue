<script setup lang="ts">
import type { Ref } from "vue";
import type { ButtonInteraction } from "~/shared";
import { inject, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

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
		<SectionHeader :title="`Button (${currentEffect.label.substring(0, 40).trim()})`" />
		<div class="two-wide">
			<v-text-field
				v-model="currentEffect.label" label="Button Label"
				:class="{ required: currentEffect.label.length === 0 }"
			/>
			<v-text-field v-model="currentEffect.verb" label="Verb" placeholder="attacks with" />
			<v-select
				v-model="currentEffect.style" label="Button Style" :items="[
					{ title: 'Blurple (default)', value: null, props: { style: 'color: #5865F2' } },
					{ title: 'rgb(var(--v-theme-surface-bright))', value: '2', props: { style: 'color: #4E5058' } },
					{ title: 'Green', value: '3', props: { style: 'color: #248045' } },
					{ title: 'Red', value: '4', props: { style: 'color: #DA373C' } },
					{ title: 'Custom Expression', value: 'custom' },
				]"
			/>
			<template v-if="isCustom">
				<v-text-field v-model="currentEffect.style" label="Custom Style Expression" hint="IntExpression" />
			</template>
		</div>

		<SectionHeader title="Casting Overrides" />
		<small>
			Use these options to pass casting information about the caster to the button, or arbritary number variables
			you can
			use for anything, such as a number of dice. Use the variables below in your button automation to access the
			values
			you set here.
		</small>
		<div class="two-wide mt-2">
			<div>
				<v-text-field
					v-model="currentEffect.defaultDC" label=" Default DC" hint="spell_dc IntExpression"
					persistent-hint
				/>
			</div>
			<div>
				<v-text-field
					v-model="currentEffect.defaultAttackBonus" label="Default Attack Bonus"
					hint="spell_attack_bonus IntExpression" persistent-hint
				/>
			</div>
			<div>
				<v-text-field
					v-model="currentEffect.defaultCastingMod" label="Default Casting Modifier IntExpression"
					hint="spell" persistent-hint
				/>
			</div>
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
