<script setup lang="ts">
import { onMounted } from "vue";
import { useRules } from "vuetify/labs/rules";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import Markdown from "@/components/Global/Markdown.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import AutomationList from "@/components/Automations/AutomationList.vue";
import { capitalizeFirstLetter } from "~/shared";
import { store } from "@/utils/store";
import CollectionHeader from "@/components/Collections/CollectionHeader.vue";
import { downloadFile } from "@/utils/app/export";

const {
	collection,
	items,
	isOwner,
	isEditor,
	getCollection,
	bookmarked,
	toggleBookmark
} = useCollection("automations");

const { addToast, removeToast } = useToast();

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

async function exportCollection(asFile: boolean) {
	if (asFile) {
		downloadFile(items.value || [], `${collection.value?.name} from Bestiary Builder`)
		void getUmami()?.track("Export automation collection to file view");
	}
	else {
		await navigator.clipboard.writeText(
			JSON.stringify(
				items.value,
				null,
				2
			)
		);
		addToast("Exported this collection to your clipboard.");
		void getUmami()?.track("Export automation collection to clipboard view");
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
				<CollectionHeader :collection :item-count="(items || []).length" :is-bestiary="false"
					:can-edit="isOwner || isEditor" :bookmarked="bookmarked" @toggle-bookmark="toggleBookmark" />
				<v-divider class="my-4" />
				<v-skeleton-loader v-if="items === null" type="heading, text, text" />
				<AutomationList v-else v-model="items" :can-edit="false" :collection="collection" />
			</div>
		</div>
	</div>

</template>

<style scoped>
@media screen and (width >=1200px) {
	.content {
		padding-left: 10vw;
		padding-right: 10vw;
	}
}
</style>
