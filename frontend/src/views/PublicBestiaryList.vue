<template>
	<div class="content" :key="key">
		<form class="settings" @submit.prevent="searchButtonClick">
			<input type="text" v-model="search" />
			<input type="number" v-model="page" min="1" :max="total" />
			<button type="submit">Search</button>
		</form>
		<div class="results">
			<a v-if="bestiaries && bestiaries.length > 0" class="bestiary" v-for="bestiary in bestiaries" :href="'/bestiary-viewer/' + bestiary._id">
				<h2>{{ bestiary.name }}</h2>
				<p>Description: {{ bestiary.description }}</p>
				<p>Status: {{ bestiary.status }}</p>
				<p>Creature amount: {{ bestiary.creatures.length }}</p>
				<div class="owner">
					<p>Owner:</p>
					<UserBanner :id="bestiary.owner" />
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
	data: () =>
		({
			bestiaries: [] as Bestiary[],
			key: 0,
			search: "",
			page: 1,
			total: 0
		} as {
			bestiaries: Bestiary[];
			key: number;
			search: string;
			page: number;
			total: number;
		}),
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
			this.key++;
		}
	}
});
</script>

<style scoped lang="less">
.content-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	height: 60rem;
	gap: 2rem;
}

.content {
	background-color: rgb(46, 44, 44);
	display: flex;
	flex-direction: column;
}
.content .bestiary {
	margin-bottom: 1rem;
	text-decoration: none;
	color: var(--color-base);
}
</style>
