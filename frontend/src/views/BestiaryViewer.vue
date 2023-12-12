<template>
	<div class="content" :key="key">
		<div class="bestiary" v-if="bestiary">
			<h2>{{ bestiary.name }}</h2>
			<p>Description: {{ bestiary.description }}</p>
			<p>Status: {{ bestiary.status }}</p>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
			<div class="owner">
				<p>Owner:</p>
				<UserBanner :id="bestiary.owner" />
			</div>
			<div class="creatures">
				<button @click.prevent="createCreature">Create new creature</button>
				<div class="creature" v-for="creature in creatures">
					<p>Creature:</p>
					<p>{{ creature.stats?.description?.name }}</p>
				</div>
			</div>
		</div>
		<div class="error" v-if="error">
			<h2>Error: {{ error }}</h2>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({key: 0} as {bestiary: Bestiary | null; creatures: Creature[] | null; error: string | null; key: number}),
	components: {
		UserBanner
	},
	beforeMount() {
		this.getBestiary();
	},
	methods: {
		async createCreature() {
			console.log("Create");
			//Replace for actual creation data:
			let data = {
				stats: {
					description: {
						name: "Example",
						description: "Example creature"
					}
				},
				bestiary: this.bestiary?._id
			} as Creature;
			console.log(data);
			//Send data to server
			await fetch("/api/update/creature", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: data})
			}).then(async (response) => {
				let result = await handleApiResponse(response);
				if (result.success) {
					console.log("Created");
				} else {
					this.error = (result.data as error).error;
				}
			});
			await this.getBestiary();
			this.key++;
		},
		async getBestiary() {
			//Get id
			let params = new URLSearchParams(document.location.search);
			let id = params.get("id");
			//Request bestiary info
			await fetch("/api/bestiary/" + id).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					this.bestiary = result.data as Bestiary;
					//Fetch creatures
					await fetch("/api/bestiary/" + this.bestiary._id + "/creatures").then(async (creatureResponse) => {
						let creatureResult = await handleApiResponse<Creature[]>(creatureResponse);
						if (creatureResult.success) {
							this.creatures = creatureResult.data as Creature[];
						} else {
							this.creatures = null;
							this.error = (creatureResult.data as error).error;
						}
					});
				} else {
					this.bestiary = null;
					this.error = (result.data as error).error;
				}
			});
			this.key++;
			console.log(this.bestiary);
			console.log(this.creatures);
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
}

.creature {
	display: flex;
	justify-content: space-between;
}
</style>
