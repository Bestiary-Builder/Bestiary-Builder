<script setup lang="ts">
import type { AttackModel, Automation } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Markdown from "@/components/Global/Markdown.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { creatureTypes } from "@/utils/constants";
import { ACTION_TYPE_MAP, getActionTypeLabel } from "./utils";
import AutomationList from "@/components/Automations/AutomationList.vue";

const {
	collection,
	items,
	isOwner,
	isEditor,
	getCollection,

} = useCollection("automations");

const { addToast, removeToast } = useToast();
const rules = useRules();

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

async function exportCollection(asFile: boolean) {
	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					items.value?.map(obj => obj.automation),
					null,
					2
				)
			],
			"items.txt",
			{
				type: "text/plain"
			}
		);

		// https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
		const link = document.createElement("a");
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
	else {
		await navigator.clipboard.writeText(
			JSON.stringify(
				items.value?.map(obj => obj.automation),
				null,
				2
			)
		);
		addToast("Exported this collection to your clipboard.");
		void getUmami()?.track("Export collection to clipboard");
	}
}
</script>

<template>
	<div>
		<Breadcrumbs v-if="collection" :routes="[
			{
				path: isOwner || isEditor ? '/armories/personal' : '/armories/public',
				text: isOwner || isEditor ? 'My Automations' : 'Automations',
				isCurrent: false
			},
			{
				path: '',
				text: collection?.name,
				isCurrent: true
			}
		]">

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Export collection" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export collection">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(true)">
							File
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="collection">
				<v-card class="pa-2" color="surface" elevation="0">
					<v-card-title class="pb-0">
						{{ collection.name }}
					</v-card-title>
					<v-card-text>
						<v-row density="compact">
							<v-col cols="4">
								<v-row>
									<v-col class="d-flex justify-start align-center">
										<UserBanner :id="collection.ownerId" class="mt-2 mb-4" />
									</v-col>
									<v-col class="d-flex justify-center align-center">
										<div>
											{{ items?.length }}
											<v-icon icon="material-symbols:automation" size="20" />
										</div>
									</v-col>
									<v-col class="d-flex justify-end align-center">
										<StatusIcon :icon="collection.status" />
									</v-col>
								</v-row>

								<v-col cols="12">
									<v-chip-group v-if="collection.tags.length">
										<v-chip v-for="tag in [...collection.tags].sort()" :key="tag" size="small"
											variant="tonal">
											{{ tag }}
										</v-chip>
									</v-chip-group>
								</v-col>

								<v-col cols="12">
									<Markdown class="description "
										:text="collection.description || 'No description set.'" tag="p" />
								</v-col>
							</v-col>
							<v-col cols="8">
								<v-img :src="collection.image" max-height="200" />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<v-divider class="my-4" />
				<v-skeleton-loader v-if="items === null" type="heading, text, text" />
				<AutomationList v-else v-model="items" :can-edit="true" :collection="collection"/>
			</div>
		</div>
	</div>

</template>

<style lang="less" scoped>
@media screen and (width >=1200px) {
	.content {
		padding-left: 10vw;
		padding-right: 10vw;
	}
}
</style>
