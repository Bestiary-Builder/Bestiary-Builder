<script setup lang="ts">
import type { BestiaryExtended, BestiaryWithCount } from "~/shared";
import { refDebounced } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import CollectionTile from "@/components/Collections/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await searchBestiaries();
	removeToast(toastId);
});

const { addToast, removeToast } = useToast();
const bestiaries = ref<(BestiaryWithCount & BestiaryExtended)[]>([]);

const selectedPage = ref(1);
const selectedTags = ref<string[]>([]);
const viewMode = ref("Popular");
const search = ref("");
const debouncedSearch = refDebounced(search, 600);
const totalPages = ref(1);

const searchBestiaries = async () => {
	const searchData = {
		search: search.value,
		page: selectedPage.value - 1,
		tags: selectedTags.value,
		mode: viewMode.value.toLowerCase()
	};
	// Request bestiary info
	const { success, data, error } = await useFetch<{ results: BestiaryWithCount[]; pageAmount: number }>(`/api/search`, "POST", searchData);
	if (success) {
		bestiaries.value = data.results.map(bestiary => ({ ...bestiary, editors: [] }));
		totalPages.value = data.pageAmount;
		void getUmami()?.track("Search bestiary", searchData);
	}
	else {
		bestiaries.value = [];
		totalPages.value = 1;
		addToast(error, { color: "error" });
	}
};

const getBookmarkedBestiaries = async () => {
	// Request bestiary info
	const { success, data, error } = await useFetch<(BestiaryWithCount)[]>(`/api/user/bookmarks`);
	if (success) {
		bestiaries.value = data.map(bestiary => ({ ...bestiary, editors: [] }));
		void getUmami()?.track("View bookmarked bestiaries");
	}
	else {
		bestiaries.value = [];
		addToast(error, { color: "error" });
	}
};

watch(selectedPage, async () => searchBestiaries());
watch(selectedTags, async () => searchBestiaries());
watch(viewMode, async (newValue) => {
	if (newValue !== "Bookmarked") {
		const toastId = addToast("Loading...", { loading: true });
		await searchBestiaries();
		removeToast(toastId);
	}
	else {
		const toastId = addToast("Loading...", { loading: true });
		await getBookmarkedBestiaries();
		removeToast(toastId);
	}
});
watch(debouncedSearch, async () => searchBestiaries());
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'Public Bestiaries',
			isCurrent: true
		}
	]">
		<select v-model="viewMode" aria-label="Select public bestiary list mode"
			name="Select public bestiary list mode">
			<option>Recent</option>
			<option>Popular</option>
			<option>Bookmarked</option>
		</select>

		<DropdownMenu>
			<template #activator="{ props }">
				<v-icon-btn v-tooltip="'Search bestiaries'" icon="mdi:magnify" v-bind="props" text="Search bestiaries"
					size="24" />
			</template>
			<v-card min-width="300" class="text-center pb-2" title="Search bestiaries">
				<v-spacer />
				<v-card-text>
					<v-text-field v-model="search" label="Search text" />
					<v-select v-model="selectedTags" label="Select Tags" multiple :items="store.tags || []" chips
						closable-chips />
				</v-card-text>
			</v-card>
		</DropdownMenu>
	</Breadcrumbs>
	<div class="content">
		<div v-if="bestiaries.length > 0" class="tile-container">
			<RouterLink v-for="bestiary, idx of bestiaries" :key="idx" :to="`/bestiary/view/${bestiary.id}`">
				<CollectionTile :data="bestiary" />
			</RouterLink>
		</div>
		<div v-else class="zero-found text-center">
			<span v-if="viewMode !== 'Bookmarked'"> No bestiaries found. </span>
			<span v-else>You do not have any bookmarked bestiaries. View a Bestiary and click on the ⭐ icon to bookmark
				it.</span>
		</div>
	</div>
	<v-pagination v-model="selectedPage" :length="totalPages" class="mb-4" :total-visible="5" />
</template>
