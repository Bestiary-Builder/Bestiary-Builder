<script setup lang="ts">
import type { Statblock } from "~/shared";
import { ref } from "vue";
import Draggable from "vuedraggable";
import { $toast } from "@/utils/app/toast";
import { languages } from "@/utils/constants";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { getDraggableKey } from "./utils";

const { data } = defineProps<{ data: Statblock }>();

const newSpeed = ref("");
const addNewSpeed = (newSpeedName: string) => {
	console.log(true);
	if (!newSpeedName) {
		$toast.error("No speed chosen.");
		return;
	}
	if (data.core.speed.some(obj => obj.name === newSpeedName)) {
		$toast.error("You already have this speed.");
		return;
	}
	data.core.speed.push({ name: newSpeedName, value: 30, unit: "ft", comment: "" });
};
const addNewSense = (newSenseName: string) => {
	if (!newSenseName) {
		$toast.error("No sense chosen.");
		return;
	}
	if (data.core.senses.some(obj => obj.name === newSenseName)) {
		$toast.error("You already have this sense.");
		return;
	}
	data.core.senses.push({ name: newSenseName, value: 30, unit: "ft", comment: "" });
};
</script>

<template>
	<div id="tabpanel-2" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-2">
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
			<Draggable :list="data.core.speed" group="speed" :item-key="getDraggableKey" :animation="150" tag="tbody"
				class=".handle">
				<template #item="{ element, idx }">
					<tr>
						<td>
							<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" />
						</td>
						<th> {{ element.name }}</th>
						<td>
							<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
						</td>
						<td class="edit-buttons">
							<div>
								<DropdownMenu>
									<template #activator="{ props }">
										<v-icon-btn icon="mdi:ruler" text="Set unit for this speed" size="20"
											v-bind="props" />
									</template>
									<v-card min-width="300" class="text-center pb-2" title="Set unit for this speed">
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
										<v-icon-btn icon="mdi:comment" text="Set comment for this speed" size="20"
											v-bind="props" />
									</template>
									<v-card min-width="300" class="text-center pb-2"
										title="Set (comment) for this speed">
										<v-card-actions>
											<v-text-field v-model="element.comment" type="text" label="comment" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
								<v-icon-btn icon="mdi:delete" text="Remove this speed" size="20"
									@click="data.core.speed.splice(idx, 1)" />
							</div>
						</td>
					</tr>
				</template>
			</Draggable>
		</table>
		<div class="two-wide mt-4">
			<v-combobox v-model="newSpeed" :items="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']"
				label="Select speed to add" @submit="addNewSpeed(newSpeed)" />
		</div>

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
			<Draggable :list="data.core.senses" group="senses" :item-key="getDraggableKey" :animation="150" tag="tbody"
				class=".handle">
				<template #item="{ element, idx }">
					<tr>
						<td>
							<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
						</td>
						<th> {{ element.name }}</th>
						<td>
							<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
						</td>
						<td class="edit-buttons">
							<div>
								<DropdownMenu>
									<template #activator="{ props }">
										<v-icon-btn icon="mdi:ruler" text="Set unit for this speed" size="20"
											v-bind="props" />
									</template>
									<v-card min-width="300" class="text-center pb-2" title="Set unit for this sense">
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
										<v-icon-btn icon="mdi:comment" text="Set comment for this sense" size="20"
											v-bind="props" />
									</template>
									<v-card min-width="300" class="text-center pb-2"
										title="Set (comment) for this sense">
										<v-card-actions>
											<v-text-field v-model="element.comment" type="text" label="comment" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
								<v-icon-btn icon="mdi:delete" text="Remove this sense" size="20"
									@click="data.core.senses.splice(idx, 1)" />
							</div>
						</td>
					</tr>
				</template>
			</Draggable>
		</table>
		<div class=" grid-two mt-4">
			<div>
				<v-combobox :items="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']"
					label="Select sense to add" @submit="(selected: string) => (addNewSense(selected))" />
			</div>
			<div>
				<v-number-input v-model="data.misc.passivePerceptionOverride" label="Passive perception override"
					clearable />
			</div>
		</div>

		<SectionHeader title="Miscellaneous" />
		<div class="grid-two">
			<div>
				<v-combobox v-model="data.core.languages" multiple chips closable-chips label="Languages"
					:items="languages" />
			</div>
			<div>
				<v-number-input v-model="data.misc.telepathy" label="Telepathy" :min="0" :step="5" />
			</div>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
