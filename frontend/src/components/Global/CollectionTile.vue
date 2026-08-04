<script setup lang="ts">
import type { AutomationCollectionExtended, BestiaryExtended } from "~/shared";
import { computed } from "vue";
import { store } from "@/utils/store.js";
import StatusIcon from "../Bestiary/StatusIcon.vue";
import UserBanner from "../Bestiary/UserBanner.vue";

const { data } = defineProps<{ data: AutomationCollectionExtended | BestiaryExtended }>();

defineEmits<{
	(e: "deleteCollectionItem", collectionId: string): void;
}>();

const firstLetters = computed(() => {
	const firstLetters = data.name
		.replace(/[^a-z0-9\s]/gi, "")
		.split(" ")
		.map(word => word.charAt(0))
		.join("")
		.toUpperCase();
	return firstLetters;
});

const lastUpdated = computed(() => {
	const seconds = Math.floor((Date.now() - new Date(data.lastUpdated).getTime()) / 1000);

	if (seconds < 60)
		return `${seconds}s`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60)
		return `${minutes}m`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24)
		return `${hours}h`;

	const days = Math.floor(hours / 24);
	if (days < 7)
		return `${days}d`;

	const weeks = Math.floor(days / 7);
	if (days < 30)
		return `${weeks}w`;

	const months = Math.floor(days / 30);
	if (days < 365)
		return `${months}mo`;

	const years = Math.floor(days / 365);
	return `${years}y`;
});
</script>

<template>
	<div class="collection-container">
		<div class="collection">
			<div class="image-container">
				<img v-if="data.image" :src="data.image" class="image">
				<div v-else class="image">
					{{ firstLetters }}
				</div>
			</div>
			<hr>
			<div class="meta">
				<h2> {{ data.name }} </h2>
				<span>
					<UserBanner :id="data.ownerId" /> • {{ lastUpdated }}
				</span>
				<v-chip-group v-if="data.tags.length">
					<v-chip v-for="tag in [...data.tags].sort()" :key="tag" size="small" variant="tonal">
						{{ tag }}
					</v-chip>
				</v-chip-group>

				<p v-if="data.description" class="description mt-1 mb-1">
					{{ data.description }}
				</p>
				<div class="collection-footer">
					<div class="d-flex justify-content align-items">
						<b>{{ data.viewCount }} views </b>
					</div>
					<span v-if="'automations' in data" class="d-flex justify-content align-items">
						<b>{{ data.automations.length }}</b>
						<v-icon icon="mdi:sword-cross" size="20" />
					</span>
					<span v-if="'creatures' in data" class="d-flex justify-content align-items">
						<b>{{ data.creatures.length }} </b>
						<v-icon icon="mdi:paw" size="20" />
					</span>
					<div class="info-buttons">
						<v-icon icon="mdi:drag" v-if="store.isMobile" class="handle" size="20" />
						<StatusIcon :icon="data.status" />

						<DropdownMenu v-if="store.user?.id === data.ownerId">
							<template #activator="{ props }">
								<v-icon-btn text="Delete Collection" size="20" color="currentColor" v-bind="props"
									@click.stop.prevent="props.onClick?.($event)" icon="mdi:delete">
								</v-icon-btn>
							</template>
							<v-card min-width="300" class="text-center pb-2">
								<v-card-text>
									Are you sure you want to delete <b>{{ data.name }}</b>?
									<br> This action cannot be undone.
								</v-card-text>
								<v-card-actions>
									<v-btn size="large" class="w-100" color="red"
										@click.stop.prevent="$emit('deleteCollectionItem', data.id)">
										Confirm
									</v-btn>
								</v-card-actions>
							</v-card>
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
@font-face {
	font-family: "Scala Sans Offc";
	src: url("../Statblock/styles/ScalaSans.woff2") format("woff2");
}

.collection-container {
	transition: scale ease-in-out 0.2s;

	&:hover {
		scale: 1.02;
	}
}

.collection {
	border-radius: 0.5rem;
	background-color: var(--color-surface-0);

	.image-container {
		padding-top: 56%;
		position: relative;

		.image {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			object-fit: cover;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: xx-large;
		}
	}

	hr {
		margin-top: 0.25rem;
		margin-bottom: 0.25rem;
	}

	.meta {
		padding: 0 0.5rem 1rem;
		font-family: "Scala Sans Offc", Roboto, Helvetica, sans-serif;

		h2 {
			font-size: 20px;
		}

		.description {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			line-clamp: 3;
			overflow: hidden;
			font-size: smaller;
		}

		.collection-footer {
			display: flex;
			justify-content: space-between;
			margin-top: .5rem;

			.info-buttons {
				grid-auto-flow: column;
				grid-auto-columns: 1fr;
				display: grid;
				gap: 0.25rem;
			}
		}
	}
}
</style>