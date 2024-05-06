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
					<v-select placeholder="Select Tags" v-model="selectedTags" multiple :options="tags" inputId="tagsInput" />
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
	<div class="content" v-if="viewMode != 'Bookmarked'">
		<div class="tile-container" v-if="bestiaries && bestiaries.length > 0">
			<TransitionGroup name="popin">
				<RouterLink class="content-tile bestiary-tile" v-for="(bestiary, index) in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id?.toString()" :aria-label="`Open ${bestiary.name}`">
					<h2 class="tile-header">{{ bestiary.name }}</h2>
					<div class="tile-content" :class="{'tile-has-image': bestiaryImages[index]}">
						<img class="tile-image" v-if="bestiaryImages[index]" :src="bestiaryImages[index]" />
						<div class="tags">
							{{ bestiary.tags.join(", ") }}
						</div>
						<p class="description">{{ bestiary.description }}</p>
					</div>
					<div class="tile-footer">
						<UserBanner :id="bestiary.owner" />
						<span>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></span>
					</div>
				</RouterLink>
			</TransitionGroup>
		</div>
		<div v-else class="zero-found">
			<span> Did not find any Bestiaries with that name or tags.</span>
		</div>
		<div class="page-nav__container" v-if="totalPages > 1">
			<button aria-label="Decrease page number" @click="selectedPage = Math.max(1, selectedPage - 1)" v-tooltip="'Decrease page number'">-</button>
			<span>{{ selectedPage }}/{{ totalPages }}</span>
			<button aria-label="Increase page number" @click="selectedPage = Math.min(totalPages, selectedPage + 1)" v-tooltip="'Increase page number'">+</button>
		</div>
	</div>
	<BookmarkedBestiaryList v-else />
</template>

<script setup lang="ts">
import {RouterLink} from "vue-router";
import {ref, onMounted, computed, watch} from "vue";
import type {Bestiary} from "~/shared";
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {handleApiResponse, tags as getTags, type error} from "@/utils/functions";
import {toast, isMobile} from "@/main";
// @ts-ignore
import {vue3Debounce as vDebounce} from "vue-debounce";
import BookmarkedBestiaryList from "../components/BookmarkedBestiaryList.vue";
import {useLoading} from "vue-loading-overlay";
import {loadingOptions} from "@/main";

const tags = ref<string[] | null>([]);

const $loading = useLoading(loadingOptions);
onMounted(async () => {
	const loader = $loading.show();
	tags.value = await getTags;
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
	await fetch(`/api/search`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			options: {
				search: search.value,
				page: selectedPage.value - 1,
				tags: selectedTags.value,
				mode: viewMode.value.toLowerCase()
			}
		})
	}).then(async (response) => {
		let result = await handleApiResponse<{results: Bestiary[]; pageAmount: number}>(response);
		if (result.success) {
			let data = result.data as {results: Bestiary[]; pageAmount: number};
			bestiaries.value = data.results;
			totalPages.value = data.pageAmount;
		} else {
			bestiaries.value = [];
			totalPages.value = 1;
			toast.error((result.data as error).error);
		}
	});
};

watch(selectedPage, () => searchBestiaries());
watch(selectedTags, () => searchBestiaries());
watch(viewMode, (newValue) => {
	if (newValue != "Bookmarked") {
		const loader = $loading.show();
		searchBestiaries();
		loader.hide();
	}
});

const bestiaryImages = computed(() => {
	let bestiaryImages: string[] = [];
	for (let bestiary of bestiaries.value) {
		const match = bestiary.description.match(/\!\[.*?\]\((.*?)\)/);
		const firstImageUrl = (match || [])[1];
		if (match) bestiary.description = bestiary.description.replace(match[0], "");
		bestiaryImages.push(firstImageUrl);
	}
	return bestiaryImages;
});
</script>

<style scoped lang="less">
@import url("@/assets/styles/bestiary-list.less");

.content-tile .tile-footer {
	display: grid;
	grid-template-columns: 1fr 1fr;

	span:first-of-type {
		text-align: left;
	}
	span:last-of-type {
		text-align: right;
	}
}

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
