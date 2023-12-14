<template>
	<div class="content">
		<h1> <span>public bestiaries </span></h1>

		<div class="tile-container">
			<div class="content-tile create-tile search-tile"> 
				<h2> search </h2>
				<div class="search-title-content">
					<form class="settings" @submit.prevent="searchButtonClick">
						<input type="text" v-model="search" placeholder="Search by bestiary name or description"/>
						<button type="submit">Search</button>

						<div><button @click="page = Math.min(total, page+1)">+</button><button  @click="page = Math.min(0, page-1)">-</button></div>
					</form>
				</div>
			</div>
			<a v-if="bestiaries && bestiaries.length > 0" class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :href="'/bestiary-viewer/' + bestiary._id">
				<h2>{{ bestiary.name }}</h2>
				<div class="bestiary-tile-content">
					<p class="description"> {{ bestiary.description }}
					</p>
					<div class="footer">
						<UserBanner :id="bestiary.owner" />
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</div>
			</a>
			<div v-else>
				<p>No bestiaries found</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, toast} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data() {
		return {
			bestiaries: [] as Bestiary[],
			search: "" as string,
			page: 1 as number,
			total: 0 as number,
		}
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
		}
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
		},
	}
});
</script>

<style scoped lang="less">
@import url("../assets/bestiary-list.less");

.settings {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.search-tile {
	color: black;
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
</style>

