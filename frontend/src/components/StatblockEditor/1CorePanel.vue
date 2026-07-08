<script setup lang="ts">
import Draggable from "vuedraggable";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { getDraggableKey } from "./utils";
import type { Statblock } from "~/shared";
import { languages } from "@/utils/constants";
import { $toast } from "@/utils/app/toast";

const { data } = defineProps<{ data: Statblock }>();
const addNewSpeed = (newSpeedName: string) => {
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
	<div id="tabpanel-2" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-2">
		<SectionHeader title="Speed" />
		<table class="list-table speed-senses">
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
						Unit
					</td>
					<td>
						Comment
					</td>
					<td>
						Delete
					</td>
				</tr>
			</thead>
			<Draggable :list="data.core.speed" group="speed" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
				<template #item="{ element, idx }">
					<tr>
						<td>
							<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
						</td>
						<th> {{ element.name }}</th>
						<td>
							<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
						</td>
						<td>
							<select v-model="element.unit" class="ghost" title="Select speed unit">
								<option>ft</option>
								<option>m</option>
								<option>km</option>
								<option>mi</option>
								<option>none</option>
							</select>
						</td>
						<td>
							<input v-model="element.comment" type="text" placeholder="comment" style="width: 100%; padding: 6px; height: unset">
						</td>
						<td class="edit-buttons">
							<div>
								<font-awesome-icon :icon="['fas', 'eraser']" @click="data.core.speed.splice(idx, 1)" />
							</div>
						</td>
					</tr>
				</template>
			</Draggable>
		</table>
		<div class="two-wide">
			<LabelledComponent title="Add speed" takes-custom-text-input for="addspeed">
				<v-select :options="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" :taggable="true" :push-tags="true" input-id="addspeed" placeholder="Select speed" @option:selected="(selected : string) => (addNewSpeed(selected))" />
			</LabelledComponent>
			<div />
		</div>

		<SectionHeader title="Senses" />
		<table class="list-table speed-senses">
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
						Unit
					</td>
					<td>
						Comment
					</td>
					<td>
						Delete
					</td>
				</tr>
			</thead>
			<Draggable :list="data.core.senses" group="senses" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
				<template #item="{ element, idx }">
					<tr>
						<td>
							<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
						</td>
						<th> {{ element.name }}</th>
						<td>
							<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
						</td>
						<td>
							<select v-model="element.unit" class="ghost" title="Select speed unit">
								<option>ft</option>
								<option>m</option>
								<option>km</option>
								<option>mi</option>
								<option>none</option>
							</select>
						</td>
						<td>
							<input v-model="element.comment" type="text" placeholder="comment" style="width: 100%; padding: 6px; height: unset">
						</td>
						<td class="edit-buttons">
							<div>
								<font-awesome-icon :icon="['fas', 'eraser']" @click="data.core.speed.splice(idx, 1)" />
							</div>
						</td>
					</tr>
				</template>
			</Draggable>
		</table>
		<div class="two-wide" style="margin-bottom: 2rem;">
			<LabelledComponent title="Add sense" takes-custom-text-input for="addsense">
				<v-select :options="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" :taggable="true" :push-tags="true" input-id="addsense" placeholder="Select sense" @option:selected="(selected : string) => (addNewSense(selected))" />
			</LabelledComponent>
			<LabelledNumberInput v-model="data.misc.passivePerceptionOverride" title="Passive perception override" :step="1" :is-clearable="true" label-id="passivePercOverride" />
		</div>

		<SectionHeader title="Miscellaneous" />
		<div class="editor-field__container two-wide">
			<LabelledComponent title="Languages" takes-custom-text-input for="languages">
				<v-select v-model="data.core.languages" placeholder="Select a Language or type one" multiple :deselect-from-dropdown="true" :close-on-select="false" :options="languages" :taggable="true" :push-tags="true" input-id="languages" />
			</LabelledComponent>
			<LabelledNumberInput v-model="data.misc.telepathy" title="Telepathy" label-id="telepathy" />
		</div>
	</div>
</template>
