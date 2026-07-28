<script setup lang="ts">
import type { AutomationCollectionExtended } from "~/shared";
import ButtonIcon from "../Global/ButtonIcon.vue";
import { store } from "@/utils/store";
import StatusIcon from "../Bestiary/StatusIcon.vue";

const { collection } = defineProps<{ collection: AutomationCollectionExtended }>();

const emit = defineEmits<{
	(e: "deleteCollection", id: string): void;
}>();
</script>

<template>
	<RouterLink :to="`/automations/edit/${collection.id}`">
		<div class="content-tile">
			<div class="tile-header">
				<h2>{{ collection.name }}</h2>
			</div>
			<div class="tile-content">
				<img class="tile-image">
			</div>
			<div class="tile-footer">
				<StatusIcon :icon="collection.status" />
				<span> {{ collection.automations.length }} <font-awesome-icon :icon="['fa', 'circle-nodes']" fill="orangered"/></span>
				<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<ButtonIcon icon="trash"  label="Delete collection"/>
					<template #popper>
						<div class="v-popper__custom-menu">
							<span> Are you sure you want to delete <br>{{ collection.name}}? </span>
							<button v-close-popper class="btn danger" @click="emit('deleteCollection', collection.id)">
								Confirm
							</button>
						</div>
					</template>
				</VDropdown>
			</div>
		</div>
	</RouterLink>
</template>

<style lang="less" scoped>
@import "../Global/tile.less";
.content-tile {
	aspect-ratio: 1.5 / 1;
}
</style>
