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
					<v-select placeholder="Select Tags" v-model="selectedTags" multiple :options="store.tags" inputId="tagsInput" />
				</div>
			</template>
		</VDropdown>

		<VDropdown :distance="6" :positioning-disabled="isMobile">
			<button v-tooltip="'Search bestiaries'" aria-label="Search bestiaries">
				<font-awesome-icon :icon="['fas', 'magnifying-glass']" />
			</button>
			<template #popper>
				<div class="v-popper__custom-menu">
					<span> Search bestiaries by name or description</span>
					<input id="searchinput" type="text" v-model="search" placeholder="Search by bestiary name or description" v-debounce:600ms.fireonempty="searchBestiaries" />
				</div>
			</template>
		</VDropdown>
	</Breadcrumbs>
	<div class="content">
		<BestiaryList :personal="false" :bestiaries v-if="bestiaries && bestiaries.length > 0"></BestiaryList>
		<div v-else class="zero-found">
			<span v-if="viewMode != 'Bookmarked'"> Did not find any Bestiaries with that name or tags.</span>
			<span v-else>You do not have any bookmarked bestiaries. View a Bestiary and click on the ⭐ icon to bookmark it.</span>
		</div>
	</div>
	<div class="page-nav__container" v-if="totalPages > 1">
		<button aria-label="Decrease page number" @click="selectedPage = Math.max(1, selectedPage - 1)" v-tooltip="'Decrease page number'">-</button>
		<span>{{ selectedPage }}/{{ totalPages }}</span>
		<button aria-label="Increase page number" @click="selectedPage = Math.min(totalPages, selectedPage + 1)" v-tooltip="'Increase page number'">+</button>
	</div>
</template>

<script setup lang="ts">
import BestiaryList from "@/components/BestiaryList.vue";

import {ref, onMounted, watch} from "vue";
import type {Bestiary} from "~/shared";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import {useFetch} from "@/utils/utils";
import {store} from "@/utils/store";
import {toast, isMobile} from "@/main";
// @ts-ignore
import {vue3Debounce as vDebounce} from "vue-debounce";
import {useLoading} from "vue-loading-overlay";
import {loadingOptions} from "@/main";

const $loading = useLoading(loadingOptions);
onMounted(async () => {
	const loader = $loading.show();
	searchBestiaries();
	loader.hide();
});

const bestiaries = ref<Bestiary[]>([]);

const selectedPage = ref(1);
const selectedTags = ref<string[]>([]);
const viewMode = ref("Popular");
const search = ref("");

const totalPages = ref(1);

const searchBestiaries = async () => {
	//Request bestiary info
	const {success, data, error} = await useFetch<{results: Bestiary[]; pageAmount: number}>(`/api/search`, "POST", {
		search: search.value,
		page: selectedPage.value - 1,
		tags: selectedTags.value,
		mode: viewMode.value.toLowerCase()
	});
	if (success) {
		bestiaries.value = data.results;
		totalPages.value = data.pageAmount;
	} else {
		bestiaries.value = [];
		totalPages.value = 1;
		toast.error(error);
	}
};

const getBookmarkedBestiaries = async () => {
	//Request bestiary info
	const {success, data, error} = await useFetch<Bestiary[]>(`/api/user/bookmarks`);
	if (success) bestiaries.value = data;
	else {
		bestiaries.value = [];
		toast.error(error);
	}
};

watch(selectedPage, () => searchBestiaries());
watch(selectedTags, () => searchBestiaries());
watch(viewMode, async (newValue) => {
	if (newValue != "Bookmarked") {
		const loader = $loading.show();
		await searchBestiaries();
		loader.hide();
	} else {
		const loader = $loading.show();
		await getBookmarkedBestiaries();
		loader.hide();
	}
});
</script>

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
