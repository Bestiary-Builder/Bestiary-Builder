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
				<a class="creature" v-for="creature in creatures">
					<p>Creature:</p>
					<p>{{ creature.stats?.description?.name }}</p>
				</a>
			</div>
			<a :href="'/bestiary-editor/' + bestiary._id" v-if="user && user._id == bestiary.owner"><button>Edit</button></a>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import type {User, Bestiary, Creature} from "@/components/types";
import UserBanner from "@/components/UserBanner.vue";
import {handleApiResponse, user, type error, toast} from "@/main";

export default defineComponent({
	data: () => ({key: 0} as {bestiary: Bestiary | null; creatures: Creature[] | null; user: User | null; key: number}),
	components: {
		UserBanner
	},
	async beforeMount() {
		this.getBestiary();
		this.user = await user;
	},
	methods: {
		async getBestiary() {
			//Get id
			let id = this.$route.params.id;
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
							toast.error((creatureResult.data as error).error);
						}
					});
				} else {
					this.bestiary = null;
					toast.error((result.data as error).error);
				}
			});
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
}

.creature {
	display: flex;
	justify-content: space-between;
}
</style>
