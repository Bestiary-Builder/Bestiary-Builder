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

const newSpeed = ref("");
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
};

const newSense = ref("");
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
};


</script>

<template>
	<div>
		<v-list :opened="['speed']">
			<v-list-group value="speed">
				<template #activator="{ props }">
					<v-list-item v-bind="props" title="Speed" class="group-header" />
					<v-divider />
				</template>

				<VueDraggable v-model="data.core.speed" :animation="150" handle=".handle">
					<div v-for="element, idx in data.core.speed" :key="idx">
						<v-list-item slim>
							<template #prepend>
								<v-icon icon="$drag" class="handle" size="24" />
							</template>

							<template #title>
								<div class="d-flex align-center justify-space-between">
									<span>{{ element.name }}</span>
									<SimpleNumberInput v-model="element.value" :min="0" :step="5"
										:label="element.name" />
								</div>
							</template>

							<template #append>
								<DropdownMenu>
									<template #activator="{ props }">
										<v-icon icon="mdi:ruler" text="Set unit for this speed" size="20" v-bind="props"
											color="primary" />
									</template>
									<v-card min-width="300" class="text-center pb-2" subtitle="Set unit for this speed">
										<select v-model="element.unit" class="ghost" title="Select speed unit">
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
										<v-icon icon="mdi:comment" text="Set comment for this speed" size="20"
											v-bind="props" color="primary" />
									</template>
									<v-card min-width="300" class="text-center pb-2"
										subtitle="Set (comment) for this speed">
										<v-card-actions>
											<v-text-field v-model="element.comment" type="text" label="comment" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
								<v-icon icon="mdi:delete" text="Remove this speed" size="20" color="primary"
									@click="data.core.speed.splice(idx, 1)" />
							</template>
						</v-list-item>
						<v-divider />
					</div>
				</VueDraggable>


				<DropdownMenu v-model="isAddSpeedOpen">
					<template #activator="{ props }">
						<v-list-item slim class="text-medium-emphasis" v-bind="props">
							<v-list-item-title>Add speed</v-list-item-title>
							<template #prepend>
								<v-icon icon="mdi:plus" text="Add speed" color="primary" />
							</template>
						</v-list-item>
						<v-divider />
					</template>
					<v-card min-width="300" class="text-center pa-4">
						<v-card-actions>
							<v-combobox v-model="newSpeed" :items="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']"
								hint="Supports custom speeds" persistent-hint density="compact"
								@keydown.enter="addNewSpeed(newSpeed)">
								<template #append>
									<v-icon-btn @click="addNewSpeed(newSpeed)" icon="mdi:check"
										:color="newSpeed ? 'primary' : 'grey'" />
								</template>
							</v-combobox>
						</v-card-actions>
					</v-card>
				</DropdownMenu>
			</v-list-group>
		</v-list>



		<v-list :opened="['senses']" class="mt-4">
			<v-list-group value="senses">
				<template #activator="{ props }">
					<v-list-item v-bind="props" title="Senses" class="group-header" />
					<v-divider />
				</template>

				<VueDraggable v-model="data.core.senses" :animation="150" handle=".handle">
					<div v-for="element, idx in data.core.senses" :key="idx">
						<v-list-item slim>
							<template #prepend>
								<v-icon icon="$drag" class="handle" size="24" />
							</template>

							<template #title>
								<div class="d-flex align-center justify-space-between">
									<span>{{ element.name }}</span>
									<SimpleNumberInput v-model="element.value" :min="0" :step="5"
										:label="element.name" />
								</div>
							</template>

							<template #append>
								<DropdownMenu>
									<template #activator="{ props }">
										<v-icon icon="mdi:ruler" text="Set unit for this sense" size="20" v-bind="props"
											color="primary" />
									</template>
									<v-card min-width="300" class="text-center pb-2" subtitle="Set unit for this sense">
										<select v-model="element.unit" class="ghost" title="Select sense unit">
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
										<v-icon icon="mdi:comment" text="Set comment for this sense" size="20"
											v-bind="props" color="primary" />
									</template>
									<v-card min-width="300" class="text-center pb-2"
										subtitle="Set (comment) for this sense">
										<v-card-actions>
											<v-text-field v-model="element.comment" type="text" label="comment" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
								<v-icon icon="mdi:delete" text="Remove this sense" size="20" color="primary"
									@click="data.core.senses.splice(idx, 1)" />
							</template>
						</v-list-item>
						<v-divider />
					</div>
				</VueDraggable>


				<DropdownMenu v-model="isAddSensesOpen">
					<template #activator="{ props }">
						<v-list-item slim class="text-medium-emphasis" v-bind="props">
							<v-list-item-title>Add sense</v-list-item-title>
							<template #prepend>
								<v-icon icon="mdi:plus" text="Add sense" color="primary" />
							</template>
						</v-list-item>
						<v-divider />
					</template>
					<v-card min-width="300" class="text-center pa-4">
						<v-card-actions>
							<v-combobox v-model="newSense"
								:items="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']"
								hint="Supports custom senses" persistent-hint density="compact"
								@keydown.enter="addNewSense(newSense)">
								<template #append>
									<v-icon-btn @click="addNewSense(newSense)" icon="mdi:check"
										:color="newSense ? 'primary' : 'grey'" />
								</template>
							</v-combobox>
						</v-card-actions>
					</v-card>
				</DropdownMenu>
			</v-list-group>
		</v-list>


		<SectionHeader title="Miscellaneous" class="pt-3" />
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
:deep(.v-list-group__items) {
	--indent-padding: 8px;
}
</style>