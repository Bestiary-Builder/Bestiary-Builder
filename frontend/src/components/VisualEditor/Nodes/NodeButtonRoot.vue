<script setup lang="ts">
import { type Ref, inject, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import IntExpression from "./shared/IntExpression.vue";
import type { ButtonInteraction } from "~/shared";
import LabelledComponent from "@/components/LabelledComponent.vue";

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
		<SectionHeader title="Button" />
		<div class="two-wide">
			<LabelledComponent title="Button Label*" for="label">
				<input id="label" v-model="currentEffect.label" type="text" :class="{ required: currentEffect.label.length === 0 }">
			</LabelledComponent>
			<LabelledComponent title="Verb" for="verb">
				<input id="verb" v-model="currentEffect.verb" type="text" placeholder="attacks with">
			</LabelledComponent>
			<LabelledComponent title="Button Style" for="style">
				<select id="style" v-model="currentEffect.style" class="ghost">
					<option :value="null" style="color: #5865F2">
						Blurple (default)
					</option>
					<option value="2" style="color: #4E5058">
						Grey
					</option>
					<option value="3" style="color: #248045">
						Green
					</option>
					<option value="4" style="color: #DA373C">
						Red
					</option>
					<option value="custom">
						Custom Expression
					</option>
				</select>
			</LabelledComponent>
		</div>
		<LabelledComponent v-if="isCustom" title="Custom Style Expression">
			<div class="input-wrapper">
				<input id="slotLevel" v-model="currentEffect.style" type="text"> <IntExpression />
			</div>
		</LabelledComponent>
		<SectionHeader title="Casting Overrides" />
		<small>
			Use these options to pass casting information about the caster to the button, or arbritary number variables you can use for anything, such as a number of dice.
		</small>
		<div class="two-wide" style="margin-top: .5rem">
			<LabelledComponent title="Default DC" for="defaultDc">
				<div class="input-wrapper">
					<input id="defaultDc" v-model="currentEffect.defaultDC" type="text"> <IntExpression />
				</div>
				<code>spell_dc </code>
			</LabelledComponent>
			<LabelledComponent title="Default Attack Bonus" for="defaultAttack">
				<div class="input-wrapper">
					<input id="defaultAttack" v-model="currentEffect.defaultAttackBonus" type="text"> <IntExpression />
				</div>
				<code> spell_attack_bonus</code>
			</LabelledComponent>
			<LabelledComponent title="Default Casting Modifier" for="defaultCastingMod">
				<div class="input-wrapper">
					<input id="defaultCastingMod" v-model="currentEffect.defaultCastingMod" type="text"> <IntExpression />
				</div>
				<code> spell</code>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
