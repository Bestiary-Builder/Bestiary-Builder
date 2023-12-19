<template>
	<div class="content">
		<h1><span>public bestiaries </span></h1>

		<div class="tile-container">
			<div class="content-tile create-tile search-tile">
				<h2><label for="searchinput">search</label> </h2>
				<div class="search-tile-content">
					<input 
						id="searchinput" 
						type="text" 
						v-model="search" 
						placeholder="Search by bestiary name or description" 
						v-debounce:600ms.fireonempty="searchBestiaries" 
					/>
					<div class="page-nav-container" v-if="true || total > 1">
						<span role="button" aria-label="Decrease page number" @click="page = Math.max(1, page - 1)">-</span>
						<span>{{ page }}/{{ total }}</span>
						<span role="button" aria-label="Increase page number" @click="page = Math.min(total, page + 1)">+</span>
					</div>
				</div>
			</div>
			<RouterLink v-if="bestiaries && bestiaries.length > 0" class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id">
				<h2>{{ bestiary.name }}</h2>
				<div class="bestiary-tile-content">
					<p class="description">{{ bestiary.description }}</p>
					<div class="footer">
						<UserBanner :id="bestiary.owner" />
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</div>
			</RouterLink>
			<div v-else>
				<p>No bestiaries found</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, toast} from "@/main";
import type {error} from "@/main";
// @ts-ignore
import { vue3Debounce } from 'vue-debounce'
export default defineComponent({
	directives: {
		debounce: vue3Debounce({ lock: true})
	},
	data() {
		return {
			bestiaries: [] as Bestiary[],
			page: 1 as number,
			total: 1 as number,
			search: "" as string,
			lastInput: 0
		};
	},
	components: {
		UserBanner
	},
	beforeMount() {
		this.searchBestiaries();
	},
	watch: {
		page() {
			this.searchBestiaries();
		},
	},
	methods: {
		searchButtonClick() {
			if (this.page == 1) this.searchBestiaries();
			else this.page = 1;
		},
		async searchBestiaries() {
			//Request bestiary info
			await fetch(`/api/search/${this.page - 1}/${this.search}`).then(async (response) => {
				let result = await handleApiResponse<{results: Bestiary[]; totalAmount: number}>(response);
				if (result.success) {
					let data = result.data as {results: Bestiary[]; totalAmount: number};
					console.log(data);
					this.bestiaries = data.results;
					this.total = data.totalAmount;
				} else {
					this.bestiaries = [];
					this.total = 0;
					toast.error((result.data as error).error);
				}
			});
			console.log(this.bestiaries);
		}
	},
});
</script>

<style scoped lang="less">
@import url("../assets/bestiary-list.less");
.content-tile.search-tile {
	cursor: unset;
}

.settings {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.search-tile-content {
	margin-top: .5rem;
	& input {
		width: 100%
	}
}

.content-tile.bestiary-tile .bestiary-tile-content .footer.footer {
	display: grid;
	grid-template-columns: 1fr 1fr;
	font-size: 1.2rem;

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

	& span[role=button] {
		cursor: pointer;
	}
}
</style>
