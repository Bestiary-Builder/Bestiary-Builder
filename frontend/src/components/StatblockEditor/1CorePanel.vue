<script setup lang="ts">
import type { Statblock } from "~/shared";
import Draggable from "vuedraggable";
import { $toast } from "@/utils/app/toast";
import { languages } from "@/utils/constants";
import { store } from "@/utils/store";
import LabelledComponent from "../FormInputs/LabelledComponent.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import SimpleNumberInput from "../FormInputs/SimpleNumberInput.vue";
import ButtonIcon from "../Global/ButtonIcon.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { getDraggableKey } from "./utils";

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
			<Draggable :list="data.core.speed" group="speed" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
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
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<ButtonIcon icon="ruler" label="Set unit for this speed" />

									<template #popper>
										<div class="v-popper__custom-menu">
											Set unit for this speed
											<select v-model="element.unit" class="ghost" title="Select speed unit">
												<option>ft</option>
												<option>m</option>
												<option>km</option>
												<option>mi</option>
												<option>none</option>
											</select>
										</div>
									</template>
								</VDropdown>
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<ButtonIcon icon="comment" label="Set comment for this speed" />

									<template #popper>
										<div class="v-popper__custom-menu">
											Set (comment) for this speed
											<input v-model="element.comment" type="text" placeholder="comment">
										</div>
									</template>
								</VDropdown>
								<ButtonIcon icon="eraser" label="Remove this speed" @click="data.core.speed.splice(idx, 1)" />
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
						<td class="edit-buttons">
							<div>
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<ButtonIcon icon="ruler" label="Set unit for this speed" />

									<template #popper>
										<div class="v-popper__custom-menu">
											Set unit for this speed
											<select v-model="element.unit" class="ghost" title="Select speed unit">
												<option>ft</option>
												<option>m</option>
												<option>km</option>
												<option>mi</option>
												<option>none</option>
											</select>
										</div>
									</template>
								</VDropdown>
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<ButtonIcon icon="comment" label="Set comment for this sense" />

									<template #popper>
										<div class="v-popper__custom-menu">
											Set (comment) for this sense
											<input v-model="element.comment" type="text" placeholder="comment" style="width: 100%; padding: 6px; height: unset">
										</div>
									</template>
								</VDropdown>
								<ButtonIcon icon="eraser" label="Remove this speed" @click="data.core.senses.splice(idx, 1)" />
							</div>
						</td>
					</tr>
				</template>
			</Draggable>
		</table>
		<div class="two-wide editor-field__container" style="margin-bottom: 2rem;">
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

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
