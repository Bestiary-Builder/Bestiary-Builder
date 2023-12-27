<template>
	<div class="content">
		<h1><span>Bookmarked Bestiaries</span></h1>
		<div class="tile-container">
			<TransitionGroup name="popin">
				<RouterLink class="content-tile bestiary-tile" v-for="bestiary in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" v-if="bestiaries">
					<h2 class="tile-header">{{ bestiary.name }}</h2>
					<div class="tile-content">
						<div class="tags">
							<span class="tag" v-for="tag in bestiary.tags">{{ tag }}</span>
						</div>
						<p class="description">{{ bestiary.description }}</p>
					</div>
					<div class="tile-footer">
						<UserBanner :id="bestiary.owner" />
						<span>{{ bestiary.creatures.length }}🐉</span>
					</div>
				</RouterLink>
			</TransitionGroup>
		</div>
	</div>
</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import UserBanner from "@/components/UserBanner.vue";
import type {User, Bestiary} from "@/generic/types";
import {handleApiResponse, toast, user} from "@/main";
import type {error} from "@/main";
export default defineComponent({
	data() {
		return {
			bestiaries: [] as Bestiary[],
			user: null as User | null
		};
	},
	components: {
		UserBanner,
		RouterLink
	},
	async beforeMount() {
		const loader = this.$loading.show();

		this.user = await user;
		this.getBestiaries();
		loader.hide();
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
			///console.log(this.bestiaries);
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/bestiary-list.less");
.content-tile .tile-footer {
	display: grid;
	grid-template-columns: 1fr 1fr;

	span:first-of-type {
		text-align: left;
	}
	span:last-of-type {
		text-align: right;
	}
}
</style>
