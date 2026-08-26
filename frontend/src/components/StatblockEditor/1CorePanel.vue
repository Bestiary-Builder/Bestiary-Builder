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
const addNewSpeed = (newSpeedName: string) => {
	if (!newSpeedName) {
		addToast("No speed given.");
		return;
	}
	if (data.core.speed.some(obj => obj.name === newSpeedName)) {
		addToast("You already have this speed.");

		return;
	}
	data.core.speed.push({ name: newSpeedName, value: 30, unit: "ft", comment: "" });
};

const newSense = ref("");
const addNewSense = (newSenseName: string) => {
	if (!newSenseName) {
		addToast("No sense given");
		return;
	}
	if (data.core.senses.some(obj => obj.name === newSenseName)) {
		addToast("You already have this sense.");
		return;
	}
	data.core.senses.push({ name: newSenseName, value: 30, unit: "ft", comment: "" });
};
</script>

<template>
	<div>
		<SectionHeader title="Speed" />
		<table v-if="data.core.speed.length > 0" class="list-table quiet">
			<thead>
				<tr>
					<td> Order </td>
					<th>
						Speed
					</th>
					<td>
						Value
					</td>
					<td>
						Options
					</td>
				</tr>
			</thead>
			<VueDraggable v-model="data.core.speed" :animation="150" tag="tbody" handle=".handle">
				<tr v-for="element, idx in data.core.speed">
					<td>
						<v-icon icon="material-symbols:drag-indicator" class="handle" size="24" />
					</td>
					<th> {{ element.name }}</th>
					<td>
						<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
					</td>
					<td class="edit-buttons">
						<div>
							<DropdownMenu>
								<template #activator="{ props }">
									<v-icon-btn
										icon="mdi:ruler" text="Set unit for this speed" size="20" v-bind="props"
										color="primary"
									/>
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
									<v-icon-btn
										icon="mdi:comment" text="Set comment for this speed" size="20"
										v-bind="props" color="primary"
									/>
								</template>
								<v-card
									min-width="300" class="text-center pb-2"
									subtitle="Set (comment) for this speed"
								>
									<v-card-actions>
										<v-text-field v-model="element.comment" type="text" label="comment" />
									</v-card-actions>
								</v-card>
							</DropdownMenu>
							<v-icon-btn
								icon="mdi:delete" text="Remove this speed" size="20"
								color="primary" @click="data.core.speed.splice(idx, 1)"
							/>
						</div>
					</td>
				</tr>
			</VueDraggable>
		</table>
		<v-row class="my-8">
			<v-col>
				<v-combobox
					v-model="newSpeed" :items="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']"
					label="Select speed to add" hint="Supports custom speeds" persistent-hint density="compact"
				/>
			</v-col>
			<v-col>
				<v-btn size="large" class="w-100" @click="addNewSpeed(newSpeed)">
					Add Speed
				</v-btn>
			</v-col>
		</v-row>

		<SectionHeader title="Senses" />
		<table v-if="data.core.senses.length > 0" class="list-table quiet">
			<thead>
				<tr>
					<td> Order </td>
					<th>
						Sense
					</th>
					<td>
						Value
					</td>
					<td>
						Options
					</td>
				</tr>
			</thead>
			<VueDraggable v-model="data.core.senses" :animation="150" tag="tbody" handle=".handle">
				<tr v-for="element, idx in data.core.senses">
					<td>
						<v-icon icon="material-symbols:drag-indicator" class="handle" size="24" />
					</td>
					<th> {{ element.name }}</th>
					<td>
						<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
					</td>
					<td class="edit-buttons">
						<div>
							<DropdownMenu>
								<template #activator="{ props }">
									<v-icon-btn
										icon="mdi:ruler" text="Set unit for this speed" size="20" v-bind="props"
										color="primary"
									/>
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
									<v-icon-btn
										icon="mdi:comment" text="Set comment for this sense" size="20"
										v-bind="props" color="primary"
									/>
								</template>
								<v-card
									min-width="300" class="text-center pb-2"
									subtitle="Set (comment) for this sense"
								>
									<v-card-actions>
										<v-text-field v-model="element.comment" type="text" label="comment" />
									</v-card-actions>
								</v-card>
							</DropdownMenu>
							<v-icon-btn
								icon="mdi:delete" text="Remove this sense" size="20"
								color="primary" @click="data.core.senses.splice(idx, 1)"
							/>
						</div>
					</td>
				</tr>
			</VueDraggable>
		</table>

		<v-row class="my-8">
			<v-col>
				<v-combobox
					v-model="newSense"
					:items="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" label="Select sense to add" hint="Supports custom senses" persistent-hint
					density="compact"
				/>
			</v-col>
			<v-col>
				<v-btn size="large" class="w-100" @click="addNewSense(newSense)">
					Add Sense
				</v-btn>
			</v-col>
		</v-row>

		<SectionHeader title="Miscellaneous" />
		<v-row class="my-4">
			<v-col cols="6">
				<v-combobox
					v-model="data.core.languages" multiple chips closable-chips label="Languages"
					:items="languages" hint="Supports custom languages" persistent-hint
				/>
			</v-col>
			<v-col cols="6">
				<v-number-input v-model="data.misc.telepathy" label="Telepathy" :min="0" :step="5" />
			</v-col>
			<v-col cols="6">
				<v-number-input
					v-model="data.misc.passivePerceptionOverride" label="Passive perception override"
					clearable
				/>
			</v-col>
		</v-row>
	</div>
</template>
