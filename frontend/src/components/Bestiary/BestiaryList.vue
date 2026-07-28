<script setup lang="ts">
import type { BestiaryExtended } from "~/shared";
import { computed } from "vue";
import { RouterLink } from "vue-router";
import Draggable from "vuedraggable";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import ButtonIcon from "../Global/ButtonIcon.vue";

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
	await useFetch("/api/my-bestiaries/order", "POST", orderIds);
};
</script>

<template>
	<div>
			<Draggable :key="Math.random()" :list="bestiaries" group="bestiaries" :animation="150" :item-key="getDraggableKey" class="tile-container" :handle=" store.isMobile ? '.handle' : ''" :disabled="!personal" @change="saveOrder">
				<template #item="{ element, index }">
					<RouterLink class="content-tile bestiary-tile" :to="`/bestiary/${personal ? 'edit' : 'view'}/${element.id}`" :class="{ 'four-tall': element.ownerId !== store.user?.id, 'draggable': !store.isMobile && personal }" :aria-label="`Open Bestiary ${element.name}`">
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
							<ButtonIcon v-if="personal && element.ownerId === store.user?.id" label="Delete bestiary" icon="trash" @click.stop.prevent="openDeleteModal(element)" />
							<span v-else>
								<UserBanner :id="element.ownerId" />
							</span>
							<span v-if="store.isMobile"><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" /></span>
							<span>{{ element.creatures.length }}<font-awesome-icon :icon="['fas', 'skull']" /></span>
						</div>
					</RouterLink>
				</template>
			</Draggable>
	</div>
</template>

<style scoped lang="less">
@import "@/assets/styles/mixins.less";
@import "../Global/tile.less";
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


a.content-tile,
.create-tile {
	.scale-on-hover(1.05);
}

.bestiary-tile:hover {
	background-color: #454241;
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
