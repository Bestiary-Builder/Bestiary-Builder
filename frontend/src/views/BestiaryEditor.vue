<template>
	<div class="content">
		<div class="bestiary" v-if="bestiary">
			<div>
				<label>Name: </label>
				<input type="text" v-model="bestiary.name" />
			</div>
			<div>
				<label>Description: </label>
				<input type="text" v-model="bestiary.description" />
			</div>
			<div>
				<label>Status: </label>
				<select v-model="bestiary.status">
					<option value="public">Public</option>
					<option value="unlisted">Unlisted</option>
					<option value="private">Private</option>
				</select>
			</div>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
			<div class="creatures">
				<button @click.prevent="createCreature">Create new creature</button>
				<a class="creature" @click="openCreature" v-for="creature in creatures" :href="'/statblock-editor/' + creature._id">
					<p>Creature:</p>
					<p>{{ creature.stats?.description?.name }}</p>
				</a>
			</div>
			<button @click.prevent="updateBestiary">Save bestiary</button>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, toast, user} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({key: 0} as {bestiary: Bestiary | null; savedBestiary: Bestiary | null; creatures: Creature[] | null; user: User | null; saved: boolean; key: number}),
	components: {
		UserBanner
	},
	async beforeMount() {
		this.user = await user;
		this.getBestiary();
	},
	methods: {
		async openCreature(e: Event) {
			let confirmation = window.confirm("Do you want to save bestiary info before leaving?");
			if (confirmation) await this.updateBestiary();
		},
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
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiary();
		},
		async getBestiary() {
			//Get id
			let id = this.$route.params.id;
			//Request bestiary info
			await fetch("/api/bestiary/" + id).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					this.bestiary = result.data as Bestiary;
					this.savedBestiary = this.bestiary;
					if (this.bestiary.owner != this.user?._id) {
						window.location.href = "/bestiary-viewer/" + id;
						return;
					}
					//Fetch creatures
					await fetch("/api/bestiary/" + this.bestiary._id + "/creatures").then(async (creatureResponse) => {
						let creatureResult = await handleApiResponse<Creature[]>(creatureResponse);
						if (creatureResult.success) {
							this.creatures = creatureResult.data as Creature[];
						} else {
							this.creatures = null;
							toast.error((creatureResult.data as error).error);
						}
					});
				} else {
					this.bestiary = null;
					toast.error((result.data as error).error);
				}
			});
			console.log(this.bestiary);
			console.log(this.creatures);
		},
		async updateBestiary() {
			console.log("Pressed save statblock!");
			if (!this.bestiary) return;
			//Send to backend
			fetch(`/api/update/bestiary/${this.bestiary._id}`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({data: this.bestiary})
			}).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) {
					toast.success("Saved bestiary");
					this.savedBestiary = this.bestiary;
				} else {
					toast.error((result.data as error).error);
				}
			});
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
