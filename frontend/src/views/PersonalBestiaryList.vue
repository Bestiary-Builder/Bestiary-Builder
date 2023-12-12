<template>
	<div class="content" :key="key">
		<button @click.prevent="createBestiary">Create new</button>
		<div class="error" v-if="error">
			<h2>Error: {{ error }}</h2>
		</div>
		<a class="bestiary" v-for="bestiary in bestiaries" :href="'/bestiary-viewer?id=' + bestiary._id" v-if="bestiaries">
			<h2>{{ bestiary.name }}</h2>
			<p>Description: {{ bestiary.description }}</p>
			<p>Status: {{ bestiary.status }}</p>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
		</a>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import {handleApiResponse, user} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({bestiaries: [] as Bestiary[], key: 0} as {bestiaries: Bestiary[]; error: string | null; key: number}),
	beforeMount() {
		this.getBestiaries();
	},
	methods: {
		async createBestiary() {
			console.log("Create");
			//Replace for actual creation data:
			let data = {
				name: "Example name",
				description: "Example description of bestiary",
				status: "public",
				creatures: [] as string[]
			} as Bestiary;
			//Send data to server
			await fetch("/api/update/bestiary", {
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
			await this.getBestiaries();
			this.key++;
		},
		async getBestiaries() {
			//Get user
			let userId = (await user)?._id;
			if (userId) {
				//Request bestiary info
				await fetch(`/api/user/${userId}/bestiaries`).then(async (response) => {
					let result = await handleApiResponse<Bestiary[]>(response);
					if (result.success) this.bestiaries = result.data as Bestiary[];
					else {
						this.bestiaries = [];
						this.error = (result.data as error).error;
					}
				});
				console.log(this.bestiaries);
			}
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
