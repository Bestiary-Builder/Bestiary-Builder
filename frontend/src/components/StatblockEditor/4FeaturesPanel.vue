<script setup lang="ts">
import type { CreatureWithStats, Features, Statblock } from "~/shared";
import { inject } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { useRouter } from "vue-router";
import { useToast } from "@/utils/app/toast";
import { newFeatureGenerator } from "@/utils/constants";
import SectionHeader from "../VisualEditor/Nodes/shared/SectionHeader.vue";

const { data, rawInfo } = defineProps<{ data: Statblock; rawInfo: CreatureWithStats | null }>();
const $router = useRouter();
const { addToast } = useToast();
const saveStatblock = inject<any>("saveStatblock");
const openFeature = async (path: string) => {
	const didSave = await saveStatblock(false);
	if (didSave)
		await $router.push(path);
	else
		addToast("Cannot open action while creature cannot save.");
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
	<div>
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
				<VueDraggable
					v-model="data.features[fType]" group="features" :animation="150" tag="tbody"
					handle=".handle"
				>
					<tr v-for="element, index in data.features[fType]">
						<td>
							<v-icon icon="material-symbols:drag-indicator" class="handle" size="24" />
						</td>
						<th> {{ element.name }}</th>
						<td class="edit-buttons">
							<div>
								<v-icon-btn
									icon="mdi:pencil" text="Edit this feature"
									size="20" @click="openFeature(`${rawInfo?.id}/${fType}/${index}`)"
								/>
								<DropdownMenu>
									<template #activator="{ props }">
										<v-icon-btn
											icon="mdi:trash" text="Delete this feature" v-bind="props"
											size="20"
										/>
									</template>
									<v-card min-width="300" class="text-center pb-2">
										<v-card-text>
											Are you sure you want to delete <br><b>{{ element.name }}</b>?
										</v-card-text>
										<v-card-actions>
											<v-btn
												size="large" color="red" class="mx-auto w-100"
												@click="deleteFeature(fType, index)"
											>
												Delete
											</v-btn>
										</v-card-actions>
									</v-card>
								</DropdownMenu>
							</div>
						</td>
					</tr>
					<tr class="table-footer">
						<td>
							<v-icon icon="" class="handle invisible" size="24" />
						</td>
						<th style="cursor: pointer;" @click="createNewFeature(fType)">
							Add {{ descText }}
						</th>
						<td>
							<v-icon-btn
								size="20" text="Create new feature" icon="mdi:plus"
								@click="createNewFeature(fType)"
							/>
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
									<v-icon-btn
										icon="fluent:text-description-16-filled"
										text="Set custom header for this feature section" v-bind="props" size="20"
									/>
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
									<v-icon-btn
										icon="material-symbols:numbers" text="Legendary actions per round"
										size="20" v-bind="props"
									/>
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
				</VueDraggable>
			</table>
		</div>
	</div>
</template>
