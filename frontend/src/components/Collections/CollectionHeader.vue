<script setup lang="ts">
import type { AutomationCollectionExtended, BestiaryExtended } from "~/shared";
import MarkdownIt from "markdown-it";
import { ref } from "vue";
import { capitalizeFirstLetter } from "~/shared";
import StatusIcon from "../Bestiary/StatusIcon.vue";
import UserBanner from "../Bestiary/UserBanner.vue";
import { lastUpdated } from "./utils";

const { collection, canEdit, isBestiary = true, itemCount, bookmarked = false } = defineProps<{ collection: BestiaryExtended | AutomationCollectionExtended; canEdit: boolean; isBestiary?: boolean; itemCount: number; bookmarked?: boolean }>();

const emit = defineEmits<{
	(e: "toggleBookmark",): void;
}>();

const imageDialog = ref(false);
const expanded = ref(false);

const md = new MarkdownIt({
	html: false,
	linkify: false,
	typographer: false,
});
</script>

<template>
	<v-card class="pa-2" variant="elevated" elevation="3" color="surface-light">
		<template #title>
			<v-card-title>
				{{ collection.name }}
			</v-card-title>
		</template>

		<template #subtitle>
			<v-card-subtitle opacity="1" class="mt-1">
				<UserBanner :id="collection.ownerId" />
				▪
				{{ itemCount }} <v-icon :icon="isBestiary ? '$creature' : '$automation'" size="20" />
				▪
				<v-tooltip :text="capitalizeFirstLetter(collection.status)">
					<template #activator="{ props }">
						<StatusIcon :icon="collection.status" v-bind="props" />
					</template>
				</v-tooltip>
				▪
				{{ collection.viewCount }} Views
				▪
				{{ lastUpdated(collection.lastUpdated) }} ago
				<v-col cols="12">
					<v-chip-group v-if="collection.tags.length">
						<v-chip v-for="tag in [...collection.tags].sort()" :key="tag" size="small" variant="tonal">
							{{ tag }}
						</v-chip>
					</v-chip-group>
				</v-col>
			</v-card-subtitle>
		</template>
		<template #prepend>
			<v-avatar
				rounded="lg" size="56" color="primary-lighten-4"
				:style="{ cursor: collection.image ? 'pointer' : 'default' }"
				@click="collection.image && (imageDialog = true)"
			>
				<v-img v-if="collection.image" :src="collection.image" cover />
				<v-icon v-else icon="mdi-image-outline" color="primary" />
			</v-avatar>
		</template>
		<template #text>
			<span class="text-medium-emphasis" :class="{ 'description-clamp': !expanded }">
				<v-icon-btn
					v-if="collection.description" :icon="expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'"
					size="18" color="unset" class="mr-1" @click="expanded = !expanded"
				/>
				<span class="description" v-html="md.renderInline(collection.description || 'No description set.')" />
			</span>
		</template>

		<template v-if="!canEdit" #append>
			<v-btn min-width="150" variant="text" class="text-right" @click="emit('toggleBookmark')">
				Bookmark{{ bookmarked ? 'ed' : '' }}
				<template #append>
					<v-icon icon="mdi:star" :color="bookmarked ? 'primary' : 'grey'" />
				</template>
			</v-btn>
		</template>
	</v-card>

	<v-dialog v-model="imageDialog" max-width="999">
		<v-card rounded="lg">
			<v-img :src="collection.image" />
		</v-card>
	</v-dialog>
</template>

<style scoped>
.description-clamp {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.description :deep(a) {
	color: rgb(var(--v-theme-primary))
}
</style>
