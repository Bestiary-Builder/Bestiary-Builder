<script setup lang="ts">
import type { Statblock } from "~/shared";
import { crAsString } from "~/shared";
import DropdownMenu from "../Global/DropdownMenu.vue";
import ButtonIcon from "../Global/ButtonIcon.vue";

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
				{{ data.description?.name }} <span> CR {{ crAsString(data.description.cr) }}
				</span>
			</h2>

			<p>{{ data?.core?.size }} {{ data?.core?.race }}</p>
			<p v-if="data.description.alignment">
				{{ data?.description?.alignment }}
			</p>
		</div>
		<div class="right-side">
			<button v-tooltip="'Copy creature'" :aria-label="`Copy ${data.description.name}`"
				@click="emit('copyCreature')">
				<font-awesome-icon :icon="['fas', 'copy']" />
			</button>
			<!-- <button v-tooltip="'Pin creature'" @click="emit('pinCreature')">
				<font-awesome-icon :icon="['fas', 'thumbtack']" />
			</button> -->
			<DropdownMenu v-if="canEdit">
				<template #activator="{ props }">
					<ButtonIcon icon="trash" label="Delete creature" v-bind="props" no-tooltip/>
				</template>
				<v-card min-width="300" class="text-center pb-2" >
					<v-card-text>
						Are you sure you want to<br> delete this creature?
					</v-card-text>
					<v-card-actions>
						<v-btn @click.stop="emit('deleteCreature', id)" size="large" color="red" class="mx-auto">
							Confirm
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
			<button v-tooltip="`${canEdit ? 'Edit' : 'View'} creature`"
				:aria-label="`${canEdit ? 'Edit' : 'View'} ${data.description.name}`" class="edit-creature"
				@click.stop="() => { }">
				<RouterLink class="creature" :to="`/creature/${canEdit ? 'edit' : 'view'}/${id}`"
					:aria-label="`${canEdit ? 'Edit' : 'View'} creature`">
					<font-awesome-icon v-if="canEdit" :icon="['fas', 'pen-to-square']" />
					<font-awesome-icon v-else :icon="['fas', 'eye']" />
				</RouterLink>
			</button>
		</div>
	</div>
</template>
