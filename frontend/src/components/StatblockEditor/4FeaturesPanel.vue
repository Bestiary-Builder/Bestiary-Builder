<script setup lang="ts">
import type { CreatureWithStats, Features, Statblock } from "~/shared";
import { computed, inject } from "vue";
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

const allFeatureTypes = computed(() =>
	Object.keys(newFeatureGenerator).filter((fType) => data.features[fType as keyof Features]?.length > 0)
)
</script>

<template>
	<v-list :opened="allFeatureTypes" density="compact">
		<v-list-group v-for="(descText, fType) in newFeatureGenerator" :key="fType" :value="fType">
			<template #activator="{ props }">
				<v-list-item v-bind="props" :title="`${descText.replace('New ', '').replace('Feature', 'Trait')}s`"
					class="group-header">
				</v-list-item>
				<v-divider />
			</template>

			<VueDraggable v-model="data.features[fType]" group="features" :animation="150" handle=".handle">
				<div v-for="element, index in data.features[fType]" :key="index">
					<v-list-item slim :title="element.name" :subtitle="element.description">
						<template #prepend>
							<v-icon icon="$drag" size="24" class="handle" />
						</template>

						<template #append>
							<v-icon icon="mdi:pencil" text="Edit this feature" size="22"
								@click="openFeature(`${rawInfo?.id}/${fType}/${index}`)" color="primary" />
							<DropdownMenu>
								<template #activator="{ props }">
									<v-icon icon="mdi:trash" text="Delete this feature" v-bind="props" size="22"
										color="primary" />
								</template>
								<v-card min-width="300" class="text-center pb-2">
									<v-card-text>
										Are you sure you want to delete <br><b>{{ element.name }}</b>?
									</v-card-text>
									<v-card-actions>
										<v-btn size="large" color="error" class="mx-auto w-100"
											@click="deleteFeature(fType, index)">
											Delete
										</v-btn>
									</v-card-actions>
								</v-card>
							</DropdownMenu>
						</template>
					</v-list-item>
					<v-divider />
				</div>
			</VueDraggable>

			<v-list-item style="cursor: pointer;" @click="createNewFeature(fType)" slim class="text-medium-emphasis">
				<template #prepend>
					<v-icon icon="mdi:plus" color="primary" />
				</template>

				<v-list-item-title>Add {{ descText }}</v-list-item-title>
			</v-list-item>
			<v-divider />


			<DropdownMenu v-if="data.features[fType].length > 0">
				<template #activator="{ props }">
					<v-list-item slim class="text-medium-emphasis" v-bind="props">
						<v-list-item-title>Edit feature header description</v-list-item-title>
						<template #prepend>
							<v-icon icon="mdi:text" text="Set custom header for this feature section" v-bind="props"
								color="primary" />
						</template>
					</v-list-item>
					<v-divider />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4"
					subtitle="Set custom header for this feature section">
					<v-card-actions>
						<v-textarea v-model="data.misc.featureHeaderTexts[fType]" />
					</v-card-actions>
				</v-card>
			</DropdownMenu>
			<v-divider />

			<DropdownMenu v-if="fType === 'legendary' && data.features[fType].length > 0">
				<template #activator="{ props }">
					<v-list-item v-bind="props" slim class="text-medium-emphasis">
						<v-list-item-title>Legendary actions per round</v-list-item-title>
						<template #prepend>
							<v-icon icon="material-symbols:numbers" text="Legendary actions per round"
								color="primary" />
						</template>
					</v-list-item>
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" subtitle="Set legendary actions per round">
					<v-card-actions>
						<v-number-input v-model="data.misc.legActionsPerRound" :min="0" />
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</v-list-group>
	</v-list>
</template>


<style scoped lang="less">
:deep(.v-list-group__items) {
	--indent-padding: 8px;
}
</style>