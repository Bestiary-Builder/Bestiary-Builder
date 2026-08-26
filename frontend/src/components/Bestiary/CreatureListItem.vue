<script setup lang="ts">
import type { CreatureMetaData } from "~/shared";
import { crAsString } from "~/shared";

const { data, canEdit, id, isPinned } = defineProps<{ data: CreatureMetaData; canEdit: boolean; id: string; isPinned: boolean }>();
const emit = defineEmits<{
	(e: "deleteCreature", id: string): void;
	(e: "pinCreature"): void;
	(e: "copyCreature"): void;
}>();
</script>

<template>
	<div class="content-tile creature-tile">
		<div class="left-side">
			<h3 style="color: rgb(var(--v-theme-primary))" class="font-weight">
				{{ data.name }} <span> CR {{ crAsString(data.cr) }}
				</span>
			</h3>

			<p>{{ data.size }} {{ data.race }}</p>
			<p v-if="data.alignment">
				{{ data.alignment }}
			</p>
		</div>
		<div class="right-side">
			<v-icon-btn
				text="Pin creature" :icon="isPinned ? 'mdi:pin-off' : 'mdi:pin'" size="24"
				@click="emit('pinCreature')"
			/>
			<v-icon-btn
				:text="`Copy ${data.name}`" icon="mdi:content-copy" size="24"
				@click="emit('copyCreature')"
			/>
			<DropdownMenu v-if="canEdit">
				<template #activator="{ props }">
					<v-icon-btn text="Delete creature" icon="mdi:delete" v-bind="props" size="24" />
				</template>
				<v-card min-width="300" class="text-center pb-2">
					<v-card-text>
						Are you sure you want to<br> delete this creature?
					</v-card-text>
					<v-card-actions>
						<v-btn size="large" color="red" class="mx-auto" @click.stop="emit('deleteCreature', id)">
							Confirm
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>

			<RouterLink
				class="creature" :to="`/creature/${canEdit ? 'edit' : 'view'}/${id}`"
				:aria-label="`${canEdit ? 'Edit' : 'View'} creature`" size="24"
			>
				<v-icon-btn v-if="canEdit" icon="mdi:pencil" size="24" />
				<v-icon-btn v-else icon="mdi:eye" size="24" />
			</RouterLink>
		</div>
	</div>
</template>
