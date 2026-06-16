<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import Draggable from "vuedraggable";
import UserBanner from "@/components/UserBanner.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import type { BestiaryExtended } from "~/shared";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const props = defineProps<{ personal: boolean; bestiaries: BestiaryExtended[] }>();

const emit = defineEmits<{
	(e: "deleteBestiary", bestiary: BestiaryExtended): void;
}>();

const openDeleteModal = (bestiary: BestiaryExtended) => {
	if (!bestiary)
		return;
	emit("deleteBestiary", bestiary);
};

const bestiaryImages = computed(() => {
	const bestiaryImages: string[] = [];
	for (const bestiary of props.bestiaries) {
		const match = bestiary.description.match(/!\[.*?\]\((.*?)\)/);
		const firstImageUrl = (match || [])[1];
		if (match)
			bestiary.description = bestiary.description.replace(match[0], "");
		bestiaryImages.push(firstImageUrl);
	}
	return bestiaryImages;
});

const getDraggableKey = (item: any) => {
	return item;
};

const saveOrder = async () => {
	const orderIds = props.bestiaries.map(bestiary => bestiary.id);

	const { success, data, error } = await useFetch("/api/my-bestiaries/order", "POST", orderIds);
	console.log(success, data, error);
};
</script>

<template>
	<div>
		<TransitionGroup name="popin">
			<Draggable :key="Math.random()" :list="bestiaries" group="bestiaries" :animation="150" :item-key="getDraggableKey" class="tile-container" :handle=" store.isMobile ? '.handle' : ''" :disabled="!personal" @change="saveOrder">
				<template #item="{ element, index }">
					<RouterLink class="content-tile bestiary-tile" :to="`/bestiary-viewer/${element.id}`" :class="{ 'four-tall': element.ownerId !== store.user?.id, 'draggable': !store.isMobile && personal }" :aria-label="`Open Bestiary ${element.name}`">
						<div class="tile-header">
							<h2>{{ element.name }}</h2>
						</div>
						<span v-if="element.ownerId !== store.user?.id && personal" class="shared-notice">(shared)</span>
						<div class="tile-content" :class="{ 'tile-has-image': bestiaryImages[index] }">
							<img v-if="bestiaryImages[index]" class="tile-image" :src="bestiaryImages[index]">
							<div class="tags">
								{{ element.tags.join(", ") }}
							</div>
							<p class="description">
								{{ element.description }}
							</p>
						</div>
						<div class="tile-footer">
							<span v-if="personal" v-tooltip.left="element.status"><StatusIcon :icon="element.status" /></span>
							<span v-if="personal && element.ownerId === store.user?.id" v-tooltip="'Delete bestiary'" role="button" class="edit-button" aria-label="Delete bestiary" @click.stop.prevent="openDeleteModal(element)"><font-awesome-icon :icon="['fas', 'trash']" /></span>
							<span v-else>
								<UserBanner :id="element.ownerId" />
							</span>
							<span v-if="store.isMobile"><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" /></span>
							<span>{{ element.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></span>
						</div>
					</RouterLink>
				</template>
			</Draggable>
		</TransitionGroup>
	</div>
</template>

<style scoped lang="less">
@import "@/assets/styles/mixins.less";
.edit-button {
	color: orangered;
	.scale-on-hover(1.2);
}

.four-tall {
	grid-template-rows: 1fr 0.1fr 6fr 1fr;
}

.shared-notice {
	margin: auto;
	color: orangered;
	translate: 0 -4px;
}

.tile-container {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 1.5em;
}

@media screen and (max-width: 1600px) {
	.tile-container {
		grid-template-columns: 1fr 1fr 1fr;
	}
}

@media screen and (max-width: 1200px) {
	.tile-container {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 800px) {
	.tile-container {
		grid-template-columns: 1fr;
	}
}

.content-tile {
	aspect-ratio: 1 / 1;
	background: var(--color-surface-1);
	color: #cbcbcb;
	padding: 1rem;
	box-shadow:
		rgba(0, 0, 0, 0.19) 0px 10px 20px,
		rgba(0, 0, 0, 0.23) 0px 6px 6px;

	display: grid;
	grid-template-rows: 1fr 6fr 1fr;
	gap: 0.3rem;

	text-decoration: unset;

	.tile-header {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		color: white;
	}

	.tile-content {
		overflow-y: auto;

		.tags {
			font-style: italic;
		}

		&.tile-has-image {
			position: relative;
			overflow-y: hidden;
			.description,
			.tags {
				position: absolute;
				width: 90%;
				height: 100%;
				left: 5%;
				top: 500px;
				display: inline;
				z-index: 1;
				transition: top 300ms ease-out;
			}

			.tags {
				overflow: hidden;
				text-wrap: nowrap;
				text-overflow: ellipsis;
			}

			.tile-image {
				width: 100%;
				height: 100%;
				object-fit: cover;
				filter: brightness(75%);
				transition: filter 300ms ease-out;
			}
		}
	}
	&:hover:has(.tile-has-image) {
		.tags {
			top: 0;
		}

		.description {
			top: 18px;
			overflow-y: scroll;
			padding-bottom: 20px;
		}
		.tile-image {
			filter: brightness(25%);
		}
	}

	&.draggable {
		cursor: grab;
	}
	.tile-footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: 1.1rem;
		width: 100%;
		margin: auto;
	}
}

a.content-tile,
.create-tile {
	.scale-on-hover(1.05);
}

.bestiary-tile:hover {
	background-color: #454241;
}

.popin-enter-active {
	animation: bounce-in 0.7s ease;
}
.popin-leave-active {
	animation: bounce-in 0.7s ease reverse;
}

.popin-enter-from,
.popin-leave-to {
	scale: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */

.popin-leave-active {
	position: absolute;
}

@keyframes bounce-in {
	0% {
		opacity: 0;
		transform: scale(0.3);
	}
	50% {
		opacity: 1;
		transform: scale(1.05);
	}
	70% {
		transform: scale(0.9);
	}
	100% {
		transform: scale(1);
	}
}

.zero-found {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	gap: 1rem;
}

.handle {
	padding-top: 0px;
	cursor: grab;
	color: orangered;

	&:active {
		cursor: grabbing;
	}
}
</style>
