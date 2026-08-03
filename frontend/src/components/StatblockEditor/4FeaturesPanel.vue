<script setup lang="ts">
import type { CreatureWithStats, Features, Statblock } from "~/shared";
import { inject } from "vue";
import { useRouter } from "vue-router";
import Draggable from "vuedraggable";
import { $toast } from "@/utils/app/toast";
import { newFeatureGenerator } from "@/utils/constants";
import ButtonIcon from "../Global/ButtonIcon.vue";
import DropdownMenu from "../Global/DropdownMenu.vue";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";
import { getDraggableKey } from "./utils";

const { data, rawInfo } = defineProps<{ data: Statblock; rawInfo: CreatureWithStats | null }>();
const $router = useRouter();

const saveStatblock = inject<any>("saveStatblock");
const openFeature = async (path: string) => {
	const didSave = await saveStatblock(false);
	if (didSave)
		await $router.push(path);
	else
		$toast.error("Cannot open action while creature cannot save.");
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
	<div
		id="tabpanel-5" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0"
		aria-labelledby="tab-5"
	>
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
				<Draggable
					:list="data.features[fType]" group="features" :item-key="getDraggableKey" :animation="150"
					tag="tbody" class=".handle"
				>
					<template #item="{ element, index }">
						<tr>
							<td>
								<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
							</td>
							<th> {{ element.name }}</th>
							<td class="edit-buttons">
								<div>
									<ButtonIcon
										icon="edit" label="Edit this feature"
										@click="openFeature(`${rawInfo?.id}/${fType}/${index}`)"
									/>
									<ButtonIcon
										icon="eraser" label="Delete this feature"
										@click="deleteFeature(fType, index)"
									/>
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
								<DropdownMenu>
									<template #activator="{ props }">
										<ButtonIcon icon="edit" label="Set custom header for this feature section" v-bind="props" />
									</template>
									<v-card
										min-width="300" class="text-center pb-2 pa-4"
										subtitle="Set custom header for this feature section"
									>
										<v-card-actions>
											<v-textarea v-model="data.misc.featureHeaderTexts[fType]" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
							</td>
						</tr>
						<tr v-if="fType === 'legendary' && data.features[fType].length > 0" class="table-footer">
							<td />
							<th>
								Legendary actions per round
							</th>
							<td>
								<DropdownMenu>
									<template #activator="{ props }">
										<ButtonIcon icon="edit" label="Legendary actions per round" v-bind="props" />
									</template>
									<v-card
										min-width="300" class="text-center pb-2 pa-4"
										subtitle="Set legendary actions per round"
									>
										<v-card-actions>
											<v-number-input v-model="data.misc.legActionsPerRound" :min="0" />
										</v-card-actions>
									</v-card>
								</DropdownMenu>
							</td>
						</tr>
					</template>
				</Draggable>
			</table>
		</div>
	</div>
</template>

<style lang="less">
@import url("@/components/StatblockEditor/styles/tabpane.less");
</style>
