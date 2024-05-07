<template>
	<div class="tile-container">
		<TransitionGroup name="popin">
			<RouterLink class="content-tile bestiary-tile" v-for="(bestiary, index) in bestiaries" :to="'/bestiary-viewer/' + bestiary._id" :key="bestiary._id?.toString()" :class="{'four-tall': bestiary.owner != store.user?._id}" :aria-label="`Open Bestiary ${bestiary.name}`">
				<div class="tile-header">
					<h2>{{ bestiary.name }}</h2>
				</div>
				<span class="shared-notice" v-if="bestiary.owner != store.user?._id && personal">(shared)</span>
				<div class="tile-content" :class="{'tile-has-image': bestiaryImages[index]}">
					<img class="tile-image" v-if="bestiaryImages[index]" :src="bestiaryImages[index]" />
					<div class="tags">
						{{ bestiary.tags.join(", ") }}
					</div>
					<p class="description">{{ bestiary.description }}</p>
				</div>
				<div class="tile-footer">
					<span v-if="personal" v-tooltip.left="bestiary.status"><StatusIcon :icon="bestiary.status" /></span>
					<span role="button" @click.stop.prevent="openDeleteModal(bestiary)" class="edit-button" v-tooltip="'Delete bestiary'" v-if="personal && bestiary.owner == store.user?._id" aria-label="Delete bestiary"><font-awesome-icon :icon="['fas', 'trash']" /></span>
					<span v-else>
						<UserBanner :id="bestiary.owner" />
					</span>
					<span>{{ bestiary.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></span>
				</div>
			</RouterLink>
		</TransitionGroup>
	</div>
</template>

<script setup lang="ts">
import UserBanner from "@/components/UserBanner.vue";
import StatusIcon from "@/components/StatusIcon.vue";
import {RouterLink} from "vue-router";
import {computed} from "vue";
import type {Bestiary} from "~/shared";
import { store } from "@/utils/store";
const props = defineProps<{personal: boolean; bestiaries: Bestiary[]}>();

const emit = defineEmits<{
	(e: "deleteBestiary", bestiary: Bestiary): void;
}>();

const openDeleteModal = (bestiary: Bestiary) => {
	if (!bestiary) return;
	emit("deleteBestiary", bestiary);
};

const bestiaryImages = computed(() => {
	let bestiaryImages: string[] = [];
	for (let bestiary of props.bestiaries) {
		const match = bestiary.description.match(/\!\[.*?\]\((.*?)\)/);
		const firstImageUrl = (match || [])[1];
		if (match) bestiary.description = bestiary.description.replace(match[0], "");
		bestiaryImages.push(firstImageUrl);
	}
	return bestiaryImages;
});
</script>

<style scoped lang="less">
@import "@/assets/styles/mixins.less";
.edit-button {
	margin: auto;
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
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

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
	.tile-footer {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		font-size: 1.1rem;
		width: 100%;
		margin: auto;

		span:first-of-type {
			text-align: left;
		}

		span:nth-of-type(2) {
			text-align: center;
		}

		span:last-of-type {
			text-align: right;
		}
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
</style>
