<template>
	<div class="content" :value="getBestiary" :key="key">
		<div class="bestiary" v-if="bestiary">
			<h2>{{ bestiary.name }}</h2>
			<p>Description: {{ bestiary.description }}</p>
			<p>Status: {{ bestiary.status }}</p>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
			<div class="owner">
				<p>Owner:</p>
				<UserBanner :id="bestiary.owner" />
			</div>
		</div>
		<div class="error" v-else>
			<h2>Error: {{ error }}</h2>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/constantComponents/UserBanner.vue";
import {handleApiResponse} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({key: 0} as {bestiary: Bestiary | null; error: string | null; key: number}),
	components: {
		UserBanner
	},
	computed: {
		async getBestiary() {
			//Get id
			let params = new URLSearchParams(document.location.search);
			let id = params.get("id");
			//Request bestiary info
			await fetch("/api/bestiary/" + id).then(async (response) => {
				let result = await handleApiResponse<Bestiary>(response);
				if (result.success) this.bestiary = result.data as Bestiary;
				else {
					this.bestiary = null;
					this.error = (result.data as error).error;
				}
			});
			this.key++;
			console.log(this.bestiary);
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
</style>
