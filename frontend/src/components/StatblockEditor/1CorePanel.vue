<script setup lang="ts">
import type { Statblock } from "~/shared";
import { ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useToast } from "@/utils/app/toast";
import { languages } from "@/utils/constants";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data } = defineProps<{ data: Statblock }>();
const { addToast } = useToast();

const newSpeed = ref<string | null>(null);
const isAddSpeedOpen = ref(false)
const addNewSpeed = (newSpeedName: string) => {
	if (!newSpeedName) {
		addToast("No speed given.");
		return;
	}
	if (data.core.speed.some(obj => obj.name.toLowerCase() === newSpeedName.toLowerCase())) {
		addToast("You already have this speed.");

		return;
	}
	data.core.speed.push({ name: newSpeedName, value: 30, unit: "ft", comment: "" });
	isAddSpeedOpen.value = false;
	newSpeed.value = null
};

const newSense = ref<string | null>(null);
const isAddSensesOpen = ref(false)
const addNewSense = (newSenseName: string) => {
	if (!newSenseName) {
		addToast("No sense given");
		return;
	}
	if (data.core.senses.some(obj => obj.name.toLowerCase() === newSenseName.toLowerCase())) {
		addToast("You already have this sense.");
		return;
	}
	data.core.senses.push({ name: newSenseName, value: 30, unit: "ft", comment: "" });
	isAddSensesOpen.value = false;
	newSense.value = null
};

const speedIcons: Record<string, string> = {
	'Walk': 'mdi:walk',
	'Swim': 'mdi:swim',
	'Fly': 'at-icons:wing',
	'Climb': 'game-icons:mountain-climbing',
	'Burrow': 'game-icons:leeching-worm'
}

const senseIcons: Record<string, string> = {
	'Darkvision': 'mdi:torch',
	'Blindsight': 'fa7-solid:user-ninja',
	'Truesight': 'game-icons:eyeball',
	'Tremorsense': 'material-symbols:earthquake',
}
</script>

<template>
	<div>
		<SectionHeader title="Speed" class="pb-2" />
		<v-table hover gridlines density="compact" v-if="data.core.speed.length > 0" class="rounded">
			<thead>
				<tr>
					<th class="text-left font-weight-bold">
						Type
					</th>
					<th class="text-center font-weight-bold">
						Value
					</th>
					<th class="text-center font-weight-bold">
						Options
					</th>
				</tr>
			</thead>
			<VueDraggable v-model="data.core.speed" tag="tbody" :animation="150">
				<tr v-for="sp, idx in data.core.speed" class="cursor-grab">
					<td class="font-weight-bold text-left text-no-wrap">
						<v-icon :icon="speedIcons[sp.name] ?? ''" size="24" />
						{{ sp.name }}
					</td>
					<td class="text-center">
						<SimpleNumberInput v-model="sp.value" :min="0" :step="5" :label="sp.name" />
					</td>
					<td class="text-center">
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon icon="mdi:ruler" text="Set unit for this speed" size="20" v-bind="props"
									color="primary" />
							</template>
							<v-card min-width="300" class="text-center pb-2" subtitle="Set unit for this speed">
								<select v-model="sp.unit" class="ghost" title="Select speed unit">
									<option>ft</option>
									<option>m</option>
									<option>km</option>
									<option>mi</option>
									<option>none</option>
								</select>
							</v-card>
						</DropdownMenu>
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon icon="mdi:comment" text="Set comment for this speed" size="20" v-bind="props"
									color="primary" />
							</template>
							<v-card min-width="300" class="text-center pb-2" subtitle="Set (comment) for this speed">
								<v-card-actions>
									<v-text-field v-model="sp.comment" type="text" label="comment" />
								</v-card-actions>
							</v-card>
						</DropdownMenu>
						<v-icon icon="mdi:delete" text="Remove this speed" size="20" color="primary"
							@click="data.core.speed.splice(idx, 1)" />
					</td>
				</tr>
			</VueDraggable>

		</v-table>

		<v-row>
			<v-col cols="6">
				<v-combobox label="Choose or type a speed" class="mt-4"
					:items="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" v-model="newSpeed"
					@keydown.enter="addNewSpeed(newSpeed || '')" hide-details>
					<template #item="{ item, props }">
						<v-list-item :prepend-icon="speedIcons[item] ?? null" v-bind="props" :title="item" />
					</template>
					<template #append>
						<v-icon-btn @click.stop="addNewSpeed(newSpeed || '')" icon="mdi:plus"
							:color="newSpeed ? 'primary' : 'grey'" />
					</template>
				</v-combobox>
			</v-col>
		</v-row>

		<SectionHeader title="Senses" class="pt-4 pb-2" />

		<v-table hover gridlines density="compact" v-if="data.core.senses.length > 0" class="rounded">
			<thead>
				<tr>
					<th class="text-left font-weight-bold">
						Type
					</th>
					<th class="text-center font-weight-bold">
						Value
					</th>
					<th class="text-center font-weight-bold">
						Options
					</th>
				</tr>
			</thead>
			<VueDraggable v-model="data.core.senses" tag="tbody" :animation="150">
				<tr v-for="se, idx in data.core.senses" class="cursor-grab">
					<td class="font-weight-bold text-left text-no-wrap">
						<v-icon :icon="senseIcons[se.name] ?? ''" size="24" />
						{{ se.name }}
					</td>
					<td class="text-center">
						<SimpleNumberInput v-model="se.value" :min="0" :step="5" :label="se.name" />
					</td>
					<td class="text-center">
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon icon="mdi:ruler" text="Set unit for this sense" size="20" v-bind="props"
									color="primary" />
							</template>
							<v-card min-width="300" class="text-center pb-2" subtitle="Set unit for this sense">
								<select v-model="se.unit" class="ghost" title="Select sense unit">
									<option>ft</option>
									<option>m</option>
									<option>km</option>
									<option>mi</option>
									<option>none</option>
								</select>
							</v-card>
						</DropdownMenu>
						<DropdownMenu>
							<template #activator="{ props }">
								<v-icon icon="mdi:comment" text="Set comment for this sense" size="20" v-bind="props"
									color="primary" />
							</template>
							<v-card min-width="300" class="text-center pb-2" subtitle="Set (comment) for this sense">
								<v-card-actions>
									<v-text-field v-model="se.comment" type="text" label="comment" />
								</v-card-actions>
							</v-card>
						</DropdownMenu>
						<v-icon icon="mdi:delete" text="Remove this sense" size="20" color="primary"
							@click="data.core.senses.splice(idx, 1)" />
					</td>
				</tr>
			</VueDraggable>

		</v-table>

		<v-row>
			<v-col cols="6">
				<v-combobox label="Choose or type a sense" class="mt-4"
					:items="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" v-model="newSense"
					v-model:menu="isAddSensesOpen" @keydown.enter="addNewSense(newSense || '')" hide-details>
					<template #item="{ item, props }">
						<v-list-item :prepend-icon="senseIcons[item] ?? ''" v-bind="props" :title="item" />
					</template>
					<template #append>
						<v-icon-btn @click.stop="addNewSense(newSense || '')" icon="mdi:plus"
							:color="newSense ? 'primary' : 'grey'" />
					</template>
				</v-combobox>
			</v-col>
		</v-row>

		<SectionHeader title="Miscellaneous" class="pt-4 pb-2" />
		<v-row class="my-4">
			<v-col cols="6">
				<v-combobox v-model="data.core.languages" multiple chips closable-chips label="Languages"
					:items="languages" hint="Supports custom languages" persistent-hint />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.misc.telepathy" label="Telepathy" :min="0" :step="5" />
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.misc.passivePerceptionOverride" label="Passive perception override"
					clearable />
			</v-col>
		</v-row>
	</div>
</template>

<style scoped>
.v-table :deep(td),
.v-table :deep(th) {
	padding: 2px 8px !important;
}
</style>
