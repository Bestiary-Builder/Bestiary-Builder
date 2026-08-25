<script setup lang="ts">
import type { Ref } from "vue";
import type { PassiveEffectDef } from "./passiveEffect";
import type { IEffect } from "~/shared";
import { computed, inject } from "vue";
import AnnotatedString from "../shared/AnnotatedString.vue";
import SectionHeader from "../shared/SectionHeader.vue";
import { useDataCleanup } from "../shared/utils";
import { PASSIVE_EFFECTS } from "./passiveEffect";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useRules } from "vuetify/labs/rules";

const currentEffect = inject<Ref<IEffect>>("currentEffect");

const filteredPassiveEffects = computed(() => {
	if (!currentEffect?.value?.effects)
		return PASSIVE_EFFECTS;
	return PASSIVE_EFFECTS.filter(x => !Object.keys(currentEffect.value.effects as any).includes(x.value));
});

const addNewPassiveEffect = (effect: PassiveEffectDef | null) => {
	if (effect === null) return
	if (!currentEffect!.value.effects)
		currentEffect!.value.effects = {};
	if (effect.isList)
		// @ts-expect-error stupid
		currentEffect!.value.effects[effect.value] = [];

	else if (effect.type === "intexpression" || effect.type === "annotatedstring")
		// @ts-expect-error already checked for lists..
		currentEffect!.value.effects[effect.value] = "1";
};

const getEffectData = (value: string) => {
	for (const e of PASSIVE_EFFECTS) {
		if (e.value === value)
			return e;
	}
};

const getInputType = (value: string) => {
	const effect = getEffectData(value);
	if (!effect)
		return;
	if (effect.defaultOptions)
		return "list";
	if (effect.type === "annotatedstring")
		return "annotatedstring";
	if (effect.type === "intexpression")
		return "intexpression";
	return "list";
};
if (!currentEffect?.value.effects)
	currentEffect!.value.effects = {};

const addButton = () => {
	if (!currentEffect?.value?.buttons)
		currentEffect!.value.buttons = [];
	currentEffect!.value.buttons.push({ automation: [], label: "New Button" });
};

const addAttack = () => {
	if (!currentEffect?.value?.attacks)
		currentEffect!.value.attacks = [];
	currentEffect!.value.attacks.push({ attack: { name: "New Attack", automation: [], _v: 2 } });
};

useDataCleanup(currentEffect, ["end", "tick_on_caster", "conc", "desc", "save_as", "parent", "target_self", "stacking", "hidden"], { effects: PASSIVE_EFFECTS.map(x => x.value) });

const rules = useRules()

interface EffectOption {
	label: string
	value: string
}

const effectValueFor = (key: string) => computed<EffectOption | EffectOption[] | null>({
	get: () => {
		const raw = (currentEffect!.value as any).effects[key]
		const options: EffectOption[] = getEffectData(key)?.defaultOptions ?? []

		if (getEffectData(key)?.isList) {
			const values: string[] = Array.isArray(raw) ? raw : []
			return values.map(v => options.find(o => o.value === v) ?? { label: v, value: v })
		}

		return options.find(o => o.value === raw) ?? (raw ? { label: raw, value: raw } : null)
	},
	set: (val) => {
		if (getEffectData(key)?.isList) {
			const arr = Array.isArray(val) ? val : []
				; (currentEffect!.value as any).effects[key] = arr.map(item =>
					typeof item === "string" ? item : item.value,
				)
		}

		else {
			//@ts-ignore
			(currentEffect!.value as any).effects[key] = typeof val === "string" ? val : val?.value ?? null
		}
	},
})

</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Initiative Effect" />
		<v-row>
			<v-col cols="6">
				<v-text-field v-model="currentEffect.name" label="Name" :rules="[rules.required()]"
					hint="AnnotatedString" />
			</v-col>
		</v-row>

		<SectionHeader title="Duration Options" />
		<div class="grid-two">
			<div>
				<v-text-field v-model="currentEffect.duration" label="Duration" hint="IntExpression" hide-details />
			</div>
			<v-checkbox v-model="currentEffect.end" label="Ticks on end of turn." hide-details />
			<v-checkbox v-model="currentEffect.tick_on_caster" label="Ticks on Caster rather than the Target."
				hide-details />
			<v-checkbox v-model="currentEffect.conc" label="Requires concentration." hide-details />
		</div>
		<SectionHeader title="Passive Effects" />
		<div class="grid-two mt-4">
			<div v-for="effect, key in currentEffect.effects" :key="key">
				<div v-if="getInputType(key) !== 'list'">
					<v-text-field :id="key" v-model="(currentEffect as any).effects[key]"
						:label="getEffectData(key)?.label || ''"
						:hint="getInputType(key) === 'annotatedstring' ? 'AnnotatedString' : 'IntExpression'">
						<template #append>
							<DropdownMenu>
								<template #activator="{ props }">
									<v-icon-btn icon="mdi:delete" label="Delete passive effect" v-bind="props" />
								</template>
								<v-card min-width="300" class="text-center pb-2">
									<v-card-text>
										Are you sure you want to delete<br> <b>{{ getEffectData(key)?.label }}</b>?
									</v-card-text>
									<v-card-actions>
										<v-btn size="large" color="red" class="w-100"
											@click="delete currentEffect.effects![key]">
											Delete
										</v-btn>
									</v-card-actions>
								</v-card>
							</DropdownMenu>
						</template>
					</v-text-field>
				</div>
				<div v-else>
					<v-combobox v-model="effectValueFor(key).value" :label="getEffectData(key)?.label || ''"
						:items="getEffectData(key)?.defaultOptions" item-title="label" item-value="value"
						:multiple="getEffectData(key)?.isList" :chips="getEffectData(key)?.isList"
						:closable-chips="getEffectData(key)?.isList" variant="solo-filled">
						<template #append>
							<DropdownMenu>
								<template #activator="{ props }">
									<v-icon-btn icon="mdi:delete" label="Delete passive effect" v-bind="props" />
								</template>
								<v-card min-width="300" class="text-center pb-2">
									<v-card-text>
										Are you sure you want to delete<br> <b>{{ getEffectData(key)?.label }}</b>?
									</v-card-text>
									<v-card-actions>
										<v-btn size="large" color="red" class="w-100"
											@click="delete currentEffect.effects![key]">
											Delete
										</v-btn>
									</v-card-actions>
								</v-card>
							</DropdownMenu>
						</template>
					</v-combobox>
				</div>
			</div>
		</div>

		<div class="grid-two">
			<v-autocomplete :items="filteredPassiveEffects" item-title="label" label="New Passive Effect" return-object
				@update:model-value="(e: PassiveEffectDef | null) => addNewPassiveEffect(e)" prepend-icon="mdi:plus"
				icon-color="primary" item-color="primary" />
		</div>
		<div class="my-4">
			<SectionHeader title="Buttons & Attacks" />
			<div class="two-wide mt-4">
				<v-btn @click="addButton">
					Add a button
				</v-btn>
				<v-btn @click="addAttack">
					Add an attack
				</v-btn>
			</div>
			<p class="pt-3">
				<small>
					Manage individual buttons and attacks by selecting them in the Effect Tree.
				</small>
			</p>
		</div>
		<SectionHeader title="Additional Options" />
		<div class="my-4">
			<Editor v-model="currentEffect.desc" />
		</div>
		<div class="two-wide">
			<v-text-field v-model="currentEffect.save_as" label="Save As" hide-details />
			<v-text-field v-model="currentEffect.parent" label="Parent" hide-details />
			<v-checkbox v-model="currentEffect.stacking" label="Ticks on end of turn." hide-details density="compact" />
			<v-checkbox v-model="currentEffect.target_self" label="Target Self" hide-details density="compact" />
			<v-checkbox v-model="currentEffect.hidden" label="Hidden effect" hide-details density="compact" />
			<v-checkbox label="Stacking" v-model="currentEffect.stacking" hide-details density="compact" />

		</div>
	</template>
</template>

<style scoped>
@import url("../styles/automation-editor.less");

.standout {
	border-left: 2px solid rgb(var(--v-theme-primary));
	padding-left: 1rem;
}

textarea {
	min-height: 5rem;
}
</style>
