<script setup lang="ts">
import type { BestiaryExtended, BestiaryWithCount } from "~/shared";
import { refDebounced } from "@vueuse/core";
import { onMounted, ref, watch } from "vue";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { getUmami } from "@/utils/app/analytics";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { useToast } from "../utils/app/toast";

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true })
	await searchBestiaries();
	removeToast(toastId)
});

const { addToast, removeToast } = useToast()
const bestiaries = ref<BestiaryExtended[]>([]);

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
		bestiaries.value = data.results.map(bestiary => ({ ...bestiary, creatures: Array(bestiary.creatureCount), editors: [] }));
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
	const { success, data, error } = await useFetch<BestiaryExtended[]>(`/api/user/bookmarks`);
	if (success) {
		bestiaries.value = data;
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
		const toastId = addToast("Loading...", { loading: true })
		await searchBestiaries();
		removeToast(toastId)
	}
	else {
		const toastId = addToast("Loading...", { loading: true })
		await getBookmarkedBestiaries();
		removeToast(toastId)
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
				<v-icon-btn icon="mdi:magnify" v-bind="props" text="Search bestiaries" size="24" />
			</template>
			<v-card min-width="300" class="text-center pb-2" title="Search bestiaries">
				<v-spacer />
				<v-card-text>
					<v-text-field label="Search text" v-model="search" />
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
	<div v-if="totalPages > 0" class="page-nav__container">
		<v-btn v-tooltip="'Decrease page number'" aria-label="Decrease page number"
			@click="selectedPage = Math.max(1, selectedPage - 1)" variant="text">
			-
		</v-btn>
		<span>{{ selectedPage }}/{{ totalPages }}</span>
		<v-btn v-tooltip="'Increase page number'" aria-label="Increase page number"
			@click="selectedPage = Math.min(totalPages, selectedPage + 1)" variant="text">
			+
		</v-btn>
	</div>
</template>

<style scoped lang="less">
.page-nav__container {
	display: flex;
	justify-content: center;
	gap: 1rem;
	align-items: center;
	font-size: 1.3rem;
	padding-top: 1rem;
}
</style>
