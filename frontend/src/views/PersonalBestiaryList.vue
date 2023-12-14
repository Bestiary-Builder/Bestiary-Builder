<template>
	<div class="content">
		<h1><span>my bestiaries </span></h1>

		<div class="tile-container">
			<div class="content-tile create-tile" @click.prevent="createBestiary"> 
				<button class="create-button" >+</button>
			</div>

			<a class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :href="'/bestiary-viewer/' + bestiary._id" v-if="bestiaries">
				<h2>{{ bestiary.name }}</h2>
				<div class="bestiary-tile-content">
					<p class="description">{{ bestiary.description }}</p>
					<div class="footer">
						<span>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</span>
						<span class="fake-edit-button"> <a :href="'/bestiary-editor/' + bestiary._id" v-if="user">edit</a></span>
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</div>
			</a>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import {handleApiResponse, toast, user} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data() {
		return {
			bestiaries: [] as Bestiary[],
			user: null as User | null,
		}
	},
	async beforeMount() {
		this.user = await user;
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
					toast.success("Created bestiary");
					// @ts-ignore
					window.location.href = "/bestiary-viewer/" + result.data._id;
				} else {
					toast.error((result.data as error).error);
				}
			});
			await this.getBestiaries();
		},
		async getBestiaries() {
			//Get user
			let userId = this.user?._id;
			if (userId) {
				//Request bestiary info
				await fetch(`/api/user/${userId}/bestiaries`).then(async (response) => {
					let result = await handleApiResponse<Bestiary[]>(response);
					if (result.success) this.bestiaries = result.data as Bestiary[];
					else {
						this.bestiaries = [];
						toast.error((result.data as error).error);
					}
				});
				console.log(this.bestiaries);
			}
		},
		statusEmoji(status: "public" | "private" | "unlisted"): string {
			return status == "public" ? "🌍" : status == "private" ? "🔒" : "🔗";
		}
	}
});
</script>

<style scoped lang="less">
@import url("../assets/bestiary-list.less");
</style>
