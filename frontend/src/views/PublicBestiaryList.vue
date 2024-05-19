<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import BestiaryList from "@/components/BestiaryList.vue";
import type { Bestiary } from "~/shared";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import { toast } from "@/utils/app/toast";
import { $loading } from "@/utils/app/loading";

onMounted(async () => {
	const loader = $loading.show();
	await searchBestiaries();
	loader.hide();
});

const bestiaries = ref<Bestiary[]>([]);

const selectedPage = ref(1);
const selectedTags = ref<string[]>([]);
const viewMode = ref("Popular");
const search = ref("");
const debouncedSearch = refDebounced(search, 600);
const totalPages = ref(1);

const searchBestiaries = async () => {
	// Request bestiary info
	const { success, data, error } = await useFetch<{ results: Bestiary[]; pageAmount: number }>(`/api/search`, "POST", {
		search: search.value,
		page: selectedPage.value - 1,
		tags: selectedTags.value,
		mode: viewMode.value.toLowerCase()
	});
	if (success) {
		bestiaries.value = data.results;
		totalPages.value = data.pageAmount;
	}
	else {
		bestiaries.value = [];
		totalPages.value = 1;
		toast.error(error);
	}
};

const getBookmarkedBestiaries = async () => {
	// Request bestiary info
	const { success, data, error } = await useFetch<Bestiary[]>(`/api/user/bookmarks`);
	if (success) {
		bestiaries.value = data;
	}
	else {
		bestiaries.value = [];
		toast.error(error);
	}
};

watch(selectedPage, () => searchBestiaries());
watch(selectedTags, () => searchBestiaries());
watch(viewMode, async (newValue) => {
	if (newValue !== "Bookmarked") {
		const loader = $loading.show();
		await searchBestiaries();
		loader.hide();
	}
	else {
		const loader = $loading.show();
		await getBookmarkedBestiaries();
		loader.hide();
	}
});
watch(debouncedSearch, () => searchBestiaries());
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Public Bestiaries',
				isCurrent: true
			}
		]"
	>
		<select v-model="viewMode" aria-label="Select public bestiary list mode" name="Select public bestiary list mode">
			<option>Recent</option>
			<option>Popular</option>
			<option>Bookmarked</option>
		</select>

		<VDropdown :distance="6" :positioning-disabled="false">
			<button v-tooltip="'Filter bestiaries'" aria-label="Filter bestiaries">
				<font-awesome-icon :icon="['fas', 'tag']" />
			</button>
			<template #popper>
				<div class="v-popper__custom-menu">
					<span><label for="tagsInput">Filter by tags</label></span>
					<v-select v-model="selectedTags" placeholder="Select Tags" multiple :options="store.tags" input-id="tagsInput" />
				</div>
			</template>
		</VDropdown>

		<VDropdown :distance="6" :positioning-disabled="store.isMobile">
			<button v-tooltip="'Search bestiaries'" aria-label="Search bestiaries">
				<font-awesome-icon :icon="['fas', 'magnifying-glass']" />
			</button>
			<template #popper>
				<div class="v-popper__custom-menu">
					<span><label for="searchinput"> Search bestiaries by name or description</label></span>
					<input id="searchinput" v-model="search" type="text" placeholder="Search by bestiary name or description">
				</div>
			</template>
		</VDropdown>
	</Breadcrumbs>
	<div class="content">
		<BestiaryList v-if="bestiaries && bestiaries.length > 0" :personal="false" :bestiaries />
		<div v-else class="zero-found">
			<span v-if="viewMode !== 'Bookmarked'"> Did not find any Bestiaries with that name or tags.</span>
			<span v-else>You do not have any bookmarked bestiaries. View a Bestiary and click on the ⭐ icon to bookmark it.</span>
		</div>
	</div>
	<div v-if="totalPages > 1" class="page-nav__container">
		<button v-tooltip="'Decrease page number'" aria-label="Decrease page number" @click="selectedPage = Math.max(1, selectedPage - 1)">
			-
		</button>
		<span>{{ selectedPage }}/{{ totalPages }}</span>
		<button v-tooltip="'Increase page number'" aria-label="Increase page number" @click="selectedPage = Math.min(totalPages, selectedPage + 1)">
			+
		</button>
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

	button {
		background-color: unset;
		border: unset;
		color: white;
		cursor: pointer;
	}
}
</style>
