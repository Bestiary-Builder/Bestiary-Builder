<template>
<Breadcrumbs :routes="[
{
	path: '',
	text: 'Public Bestiaries',
	isCurrent: true
}
]" 
> 
<template #right-button>
	<select v-model="viewMode">
		<option>Recent</option>
		<option>Popular</option>
		<option>Bookmarked</option>
	</select>
</template>
</Breadcrumbs> 
	<div class="content" v-if="viewMode != 'Bookmarked'">
		<div class="tile-container">
			<div class="content-tile search-tile">
				<h2 class="tile-header"><label for="searchinput">search</label></h2>
				<div class="tile-content">
					<input id="searchinput" type="text" v-model="search" placeholder="Search by bestiary name or description" v-debounce:600ms.fireonempty="searchBestiaries" />
					<div class="page-nav-container" v-if="total > 1">
						<span role="button" aria-label="Decrease page number" @click="page = Math.max(1, page - 1)">-</span>
						<span>{{ page }}/{{ total }}</span>
						<span role="button" aria-label="Increase page number" @click="page = Math.min(total, page + 1)">+</span>
					</div>
					<div class="tags">
						<label for="tagsInput">tags</label>
						<v-select placeholder="Select Tags" v-model="selectedTags" multiple :options="tags" inputId="tagsInput" />
					</div>
				</div>
			</div>

			<TransitionGroup name="popin">
				<RouterLink v-if="bestiaries && bestiaries.length > 0" class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id">
					<h2 class="tile-header">{{ bestiary.name }}</h2>
					<div class="tile-content">
						<div class="tags">
							<span class="tag" v-for="tag in bestiary.tags">{{ tag }}</span>
						</div>
						<p class="description">{{ bestiary.description }}</p>
					</div>
					<div class="tile-footer">
						<UserBanner :id="bestiary.owner" />
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</RouterLink>
			</TransitionGroup>
		</div>
	</div>
	<BookmarkedBestiaryList v-else/>
</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/generic/types";
import UserBanner from "@/components/UserBanner.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {handleApiResponse, toast, tags, type error} from "@/main";
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
			viewMode: 'Popular'
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
		viewMode(newValue, oldValue) {
			if (newValue != "Bookmarked") {
				console.log("yayayy!")
				this.searchBestiaries()
			}
		}
	},
	methods: {
		async searchBestiaries() {
			//Request bestiary info
			await fetch(`/api/search/${this.viewMode.toLowerCase()}`, {
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
						mode: "popular"
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
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/bestiary-list.less");
.search-tile {
	background-color: orangered;

	& .tile-header {
		border-bottom-color: white;
	}

	& .tile-content input {
		width: 100%;
		margin-top: 0.5rem;
	}
}

.settings {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

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

.page-nav-container {
	display: flex;
	justify-content: center;
	gap: 1rem;
	align-items: center;
	margin-top: 1rem;
	font-size: 1.3rem;
	color: white;

	& span[role="button"] {
		cursor: pointer;
	}
}
</style>
