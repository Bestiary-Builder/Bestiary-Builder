<template>
	<div class="content" :value="getBestiaries" :key="key">
		<div class="error" v-if="error">
			<h2>Error: {{ error }}</h2>
		</div>
		<a class="bestiary" v-for="bestiary in bestiaries" :href="'/bestiary-viewer?id=' + bestiary._id" v-else>
			<h2>{{ bestiary.name }}</h2>
			<p>Description: {{ bestiary.description }}</p>
			<p>Status: {{ bestiary.status }}</p>
			<p>Creature amount: {{ bestiary.creatures.length }}</p>
			<div class="owner">
				<p>Owner:</p>
				<UserBanner :id="bestiary.owner" />
			</div>
		</a>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/constantComponents/UserBanner.vue";
import {handleApiResponse} from "@/main";
import type {error} from "@/main";

export default defineComponent({
	data: () => ({bestiaries: [] as Bestiary[], key: 0} as {bestiaries: Bestiary[]; error: string | null; key: number}),
	components: {
		UserBanner
	},
	computed: {
		async getBestiaries() {
			//Request bestiary info
			await fetch(`/api/bestiaries`).then(async (response) => {
				let result = await handleApiResponse<Bestiary[]>(response);
				if (result.success) this.bestiaries = result.data as Bestiary[];
				else {
					this.bestiaries = [];
					this.error = (result.data as error).error;
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
