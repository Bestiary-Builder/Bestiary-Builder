<template>
	<div class="content">
		<h1><span>bookmarked bestiaries</span></h1>
		<div class="tile-container">
			<a class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :href="'/bestiary-viewer/' + bestiary._id" v-if="bestiaries">
				<h2>{{ bestiary.name }}</h2>
				<div class="bestiary-tile-content">
					<p class="description">{{ bestiary.description }}</p>
					<div class="footer">
						<span>{{ statusEmoji(bestiary.status) }}{{ bestiary.status }}</span>
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
			user: null as User | null
		};
	},
	async beforeMount() {
		this.user = await user;
		this.getBestiaries();
	},
	methods: {
		async getBestiaries() {
			//Request bestiary info
			await fetch(`/api/user/bookmarks`).then(async (response) => {
				let result = await handleApiResponse<Bestiary[]>(response);
				if (result.success) this.bestiaries = result.data as Bestiary[];
				else {
					this.bestiaries = [];
					toast.error((result.data as error).error);
				}
			});
			console.log(this.bestiaries);
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
