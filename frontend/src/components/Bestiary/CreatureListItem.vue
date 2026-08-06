<script setup lang="ts">
import type { Statblock } from "~/shared";
import { crAsString } from "~/shared";

const { data, canEdit, id } = defineProps<{ data: Statblock; canEdit: boolean; id: string }>();
const emit = defineEmits<{
	(e: "deleteCreature", id: string): void;
	(e: "pinCreature"): void;
	(e: "copyCreature"): void;
}>();
</script>

<template>
	<div class="content-tile creature-tile">
		<div class="left-side">
			<h3 style="color: orangered" class="font-weight">
				{{ data.description?.name }} <span> CR {{ crAsString(data.description.cr) }}
				</span>
			</h3>

			<p>{{ data?.core?.size }} {{ data?.core?.race }}</p>
			<p v-if="data.description.alignment">
				{{ data?.description?.alignment }}
			</p>
		</div>
		<div class="right-side">
			<v-icon-btn :text="`Copy ${data.description.name}`" icon="mdi:content-copy" @click="emit('copyCreature')"
				size="24" />
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

			<RouterLink class="creature" :to="`/creature/${canEdit ? 'edit' : 'view'}/${id}`"
				:aria-label="`${canEdit ? 'Edit' : 'View'} creature`" size="24">
				<v-icon-btn icon="mdi:pencil" v-if="canEdit" size="24" />
				<v-icon-btn icon="mdi:eye" v-else />
			</RouterLink>
		</div>
	</div>
</template>
