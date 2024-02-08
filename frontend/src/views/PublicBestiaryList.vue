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
			<RouterLink class="content-tile bestiary-tile" v-for="bestiary, index in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id" :aria-label="`Open ${bestiary.name}`">
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
	<div class="page-nav__container" v-if="total > 1">
		<button aria-label="Decrease page number" @click="page = Math.max(1, page - 1)" v-tooltip="'Decrease page number'">-</button>
		<span>{{ page }}/{{ total }}</span>
		<button aria-label="Increase page number" @click="page = Math.min(total, page + 1)" v-tooltip="'Increase page number'">+</button>
	</div>
</div>
<BookmarkedBestiaryList v-else />

</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import type {Bestiary} from "@/utils/types";
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {handleApiResponse, toast, tags, type error, isMobile} from "@/main";
// @ts-ignore
import {vue3Debounce} from "vue-debounce";
import BookmarkedBestiaryList from "./BookmarkedBestiaryList.vue";
export default defineComponent({
	directives: {
		debounce: vue3Debounce({lock: true})
	},
	data() {
		return {
			bestiaries: [] as Bestiary[],
			page: 1 as number,
			total: 1 as number,
			search: "" as string,
			selectedTags: [] as string[],
			tags: [] as string[],
			lastInput: 0,
			viewMode: "Popular",
			isMobile
		};
	},
	components: {
		UserBanner,
		Breadcrumbs,
		BookmarkedBestiaryList
	},
	async beforeMount() {
		const loader = this.$loading.show();
		this.tags = (await tags) ?? ([] as string[]);
		this.searchBestiaries();
		loader.hide();
	},
	watch: {
		page() {
			this.searchBestiaries();
		},
		selectedTags() {
			this.searchBestiaries();
		},
		async viewMode(newValue) {
			if (newValue != "Bookmarked") {
				const loader = this.$loading.show();
				await this.searchBestiaries();
				loader.hide();
			}
		}
	},
	methods: {
		async searchBestiaries() {
			//Request bestiary info
			await fetch(`/api/search`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					options: {
						search: this.search,
						page: this.page - 1,
						tags: this.selectedTags,
						mode: this.viewMode.toLowerCase()
					}
				})
			}).then(async (response) => {
				let result = await handleApiResponse<{results: Bestiary[]; pageAmount: number}>(response);
				if (result.success) {
					let data = result.data as {results: Bestiary[]; pageAmount: number};
					this.bestiaries = data.results;
					//this.page = 1;
					this.total = data.pageAmount;
				} else {
					this.bestiaries = [];
					this.total = 1;
					toast.error((result.data as error).error);
				}
			});
			///console.log(this.bestiaries);
		}
	},
	computed: {
		bestiaryImages() : string[] {
			let bestiaryImages : string[] = []
			for (let bestiary of this.bestiaries) {
				const match = bestiary.description.match(/\!\[.*?\]\((.*?)\)/);
				const firstImageUrl = (match || [])[1];
				if (match) bestiary.description =  bestiary.description.replace(match[0], '')
				bestiaryImages.push(firstImageUrl)
			}
			return bestiaryImages
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/bestiary-list.less");

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
