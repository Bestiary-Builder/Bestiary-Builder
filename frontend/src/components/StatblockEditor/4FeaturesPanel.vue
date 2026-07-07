<script setup lang="ts">
import { useRouter } from "vue-router";
import { inject } from "vue";
import Draggable from "vuedraggable";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import LabelledNumberInput from "../FormInputs/LabelledNumberInput.vue";
import { getDraggableKey } from "./utils.js";
import type { CreatureWithStats, Features, Statblock } from "~/shared";
import { newFeatureGenerator } from "@/utils/constants.js";
import { toast } from "@/utils/app/toast.js";
import { store } from "@/utils/store.js";

const { data, rawInfo } = defineProps<{ data: Statblock; rawInfo: CreatureWithStats | null }>();
const $router = useRouter();

const saveStatblock = inject<any>("saveStatblock");
const openFeature = async (path: string) => {
	const didSave = await saveStatblock(false);
	if (didSave)
		await $router.push(path);
	else
		toast.error("Cannot open action while creature cannot save.");
};

const deleteFeature = (type: keyof Features, index: number) => {
	data.features[type].splice(index, 1);
};
const createNewFeature = (type: keyof Features) => {
	data.features[type].push({
		name: `New ${type} ${data.features[type].length + 1}`,
		description: "",
		automation: null
	});
};
</script>

<template>
	<div id="tabpanel-5" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-5">
		<div v-for="(descText, fType) in newFeatureGenerator" :key="fType">
			<SectionHeader :title="`${descText.replace('New ', '').replace('Feature', 'Trait')}s`" />

			<table class="list-table features">
				<thead>
					<tr>
						<td> Order </td>
						<th>
							Action
						</th>
						<td>
							Options
						</td>
					</tr>
				</thead>
				<Draggable :list="data.features[fType]" group="features" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
					<template #item="{ element, index }">
						<tr>
							<td>
								<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
							</td>
							<th> {{ element.name }}</th>
							<td class="edit-buttons">
								<div>
									<a :to="`${rawInfo?.id}/${fType}/${index}`" @click="openFeature(`${rawInfo?.id}/${fType}/${index}`)">
										<font-awesome-icon :icon="['fas', 'edit']" />
									</a>
									<span class="delete-button" aria-label="Delete feature" @click="deleteFeature(fType, index)"><font-awesome-icon :icon="['fas', 'trash']" /></span>
								</div>
							</td>
						</tr>
					</template>
					<template #footer>
						<tr class="table-footer">
							<td />
							<th style="cursor: pointer;" @click="createNewFeature(fType)">
								Add {{ descText }}
							</th>
							<td>
								<span :id="descText" class="button-icon" @click="createNewFeature(fType)">
									<font-awesome-icon :icon="['fas', 'plus']" />
								</span>
							</td>
						</tr>
						<tr class="table-footer">
							<td />
							<th>
								Edit feature header description
							</th>
							<td class="edit-buttons">
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<button v-tooltip="'Export statblock'" aria-label="Export statblock" class="btn-icon" style="color: orangered; margin: 0px; font-size: smaller; padding: 0">
										<font-awesome-icon :icon="['fas', 'edit']" />
									</button>
									<template #popper>
										<div class="v-popper__custom-menu">
											<span style="color: lightgray"> You can set text to show at<br> the top of each section here.</span>
											<textarea :id="fType" v-model="data.misc.featureHeaderTexts[fType]" style="min-width: 300px" />
										</div>
									</template>
								</VDropdown>
							</td>
						</tr>
						<tr v-if="fType === 'legendary' && data.features[fType].length > 0" class="table-footer">
							<td />
							<th>
								Legendary actions per round
							</th>
							<td>
								<VDropdown :distance="6" :positioning-disabled="store.isMobile">
									<button v-tooltip="'Export statblock'" aria-label="Export statblock" class="btn-icon" style="color: orangered; margin: 0px; font-size: smaller; padding: 0">
										<font-awesome-icon :icon="['fas', 'edit']" />
									</button>
									<template #popper>
										<div class="v-popper__custom-menu">
											<LabelledNumberInput v-model="data.misc.legActionsPerRound" title="Legendary actions per round" :step="1" :min="0" />
										</div>
									</template>
								</VDropdown>
							</td>
						</tr>
					</template>
				</Draggable>
			</table>
		</div>
	</div>
</template>
