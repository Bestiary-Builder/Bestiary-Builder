<template>
	<div class="content">
		<div class="tile-container" v-if="bestiaries.length > 0">
			<TransitionGroup name="popin">
				<RouterLink class="content-tile bestiary-tile" v-for="(bestiary, index) in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" v-if="bestiaries">
					<h2 class="tile-header">{{ bestiary.name }}</h2>
					<div class="tile-content" :class="{'tile-has-image': bestiaryImages[index]}">
						<img class="tile-image" v-if="bestiaryImages[index]" :src="bestiaryImages[index]" />
						<div class="tags">
							{{ bestiary.tags.join(", ") }}
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
		<div v-else class="no-bookmarks-notice">
			<p>You do not have any bookmarked bestiaries. View a Bestiary and click on the ⭐ icon to bookmark it.</p>
		</div>
	</div>
</template>

<script lang="ts">
import {RouterLink} from "vue-router";
import {defineComponent} from "vue";
import UserBanner from "@/components/UserBanner.vue";
import type {User, Bestiary} from "~/shared";
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
		await this.getBestiaries();
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
	},
	computed: {
		bestiaryImages(): string[] {
			let bestiaryImages: string[] = [];
			for (let bestiary of this.bestiaries) {
				const match = bestiary.description.match(/\!\[.*?\]\((.*?)\)/);
				const firstImageUrl = (match || [])[1];
				if (match) bestiary.description = bestiary.description.replace(match[0], "");
				bestiaryImages.push(firstImageUrl);
			}
			return bestiaryImages;
		}
	}
});
</script>

<style scoped lang="less">
@import url("@/assets/styles/bestiary-list.less");
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

.no-bookmarks-notice {
	display: flex;
	justify-content: center;
}
</style>
