<script setup lang="ts">
import type { Statblock } from "~/shared";
import { store } from "@/utils/store";
import { crAsString } from "~/shared";

const { data, canEdit, id } = defineProps<{ data: Statblock; canEdit: boolean; id: string }>();
const emit = defineEmits<{
	(e: "deleteCreature", id: string): void;
	(e: "pinCreature"): void;
	(e: "copyCreature"): void;
}>();
</script>

<template>
	<div class="content-tile creature-tile" data-shimmer-no-children>
		<div class="left-side">
			<h2 style="color: orangered">
				{{ data.description?.name }} <span>				CR {{ crAsString(data.description.cr) }}
				</span>
			</h2>

			<p>{{ data?.core?.size }} {{ data?.core?.race }}</p>
			<p v-if="data.description.alignment">
				{{ data?.description?.alignment }}
			</p>
		</div>
		<div class="right-side">
			<button v-tooltip="'Copy creature'" :aria-label="`Copy ${data.description.name}`" @click="emit('copyCreature')">
				<font-awesome-icon :icon="['fas', 'copy']" />
			</button>
			<!-- <button v-tooltip="'Pin creature'" @click="emit('pinCreature')">
				<font-awesome-icon :icon="['fas', 'thumbtack']" />
			</button> -->
			<VDropdown v-if="canEdit" :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Delete creature'" :aria-label="`Delete ${data.description.name}`" @click.stop.prevent="">
					<font-awesome-icon :icon="['fas', 'trash']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<span> Are you sure you want to delete this creature? </span>
						<button v-close-popper class="btn danger" @click.stop="emit('deleteCreature', id)">
							Confirm
						</button>
					</div>
				</template>
			</VDropdown>
			<button v-tooltip="`${canEdit ? 'Edit' : 'View'} creature`" :aria-label="`${canEdit ? 'Edit' : 'View'} ${data.description.name}`" class="edit-creature" @click.stop="() => {}">
				<RouterLink class="creature" :to="`/statblock-editor/${id}`" :aria-label="`${canEdit ? 'Edit' : 'View'} creature`">
					<font-awesome-icon v-if="canEdit" :icon="['fas', 'pen-to-square']" />
					<font-awesome-icon v-else :icon="['fas', 'eye']" />
				</RouterLink>
			</button>
		</div>
	</div>
</template>
