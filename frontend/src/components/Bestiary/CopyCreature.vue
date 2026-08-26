<script lang="ts" setup>
import type { CreatureWithStats, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";

const props = withDefaults(
	defineProps<{
		noImportAll?: boolean;
		mayImport?: boolean;
		currentCreature?:
		CopiedCreature | undefined;
		canCopyCurrentBestiary?: boolean;
	}>(),
	{ noImportAll: false, mayImport: false, currentCreature: undefined, canCopyCurrentBestiary: false }
);

const emit = defineEmits<{
	(e: "importCreature", data: Statblock): void;
	(e: "importAllCreatures"): void;
	(e: "copyCurrentBestiary"): void;
}>();

const copiedCreatures = useLocalStorage<CopiedCreature[]>("copiedCreatures", []);

const clearCreatures = () => {
	copiedCreatures.value = [];
};

const deleteCreature = (idx: number) => {
	copiedCreatures.value.splice(idx, 1);
};

type CopiedCreature = CreatureWithStats & { bestiaryName: string };
const importCreature = (creature: CopiedCreature) => {
	emit("importCreature", creature.stats);
};

const importManyCreatures = () => {
	emit("importAllCreatures");
};
</script>

<template>
	<DropdownMenu>
		<template #activator="{ props }">
			<v-icon-btn
				v-tooltip="'Manage copies'" icon="mdi:content-copy" v-bind="props" text="Manage copies"
				size="24"
			/>
		</template>
		<v-card min-width="500" class="text-center pa-4 d-flex justify-center flex-column">
			<v-card-text>
				<table v-if="copiedCreatures.length > 0" class="list-table mx-auto">
					<thead>
						<tr>
							<th> Creature </th>
							<td v-if="mayImport">
								Import
							</td>
							<td> Delete</td>
						</tr>
					</thead>
					<tbody>
						<tr v-for="creature, idx in copiedCreatures" :key="idx">
							<th scope="row">
								{{ creature.stats.description.name }}
								<p> {{ creature.bestiaryName }} (CR {{ creature.stats.description.cr }})</p>
							</th>
							<td v-if="mayImport">
								<v-icon-btn
									icon="mdi:import" size="20" text="Import creature"
									@click="importCreature(creature)"
								/>
							</td>
							<td>
								<v-icon-btn
									icon="mdi:delete" size="20" text="Delete creature from list"
									@click="deleteCreature(idx)"
								/>
							</td>
						</tr>
					</tbody>
					<caption align="top">
						Copied creatures list
					</caption>
				</table>
				<table v-else class="list-table">
					<caption align="top">
						No creatures copied.
					</caption>
					<tbody>
						<tr>
							<td style="border: 0">
								Start copying creatures<br>to manage them here!
							</td>
						</tr>
					</tbody>
				</table>
			</v-card-text>
			<v-card-actions class="d-flex justify-center items-center">
				<v-btn
					v-if="mayImport && copiedCreatures.length > 0 && !props.noImportAll" prepend-icon="mdi:import"
					color="success" @click="importManyCreatures"
				>
					Import all
				</v-btn>
				<v-btn
					v-if="currentCreature" prepend-icon="mdi:content-copy"
					@click="copiedCreatures.push(currentCreature)"
				>
					Copy current creature
				</v-btn>
				<v-btn
					v-if="canCopyCurrentBestiary" prepend-icon="mdi:content-copy"
					@click="emit('copyCurrentBestiary')"
				>
					Copy current bestiary
				</v-btn>
				<v-btn
					v-if="copiedCreatures.length > 0" color="error" prepend-icon="mdi:trash"
					@click="clearCreatures()"
				>
					Clear list
				</v-btn>
			</v-card-actions>
		</v-card>
	</DropdownMenu>
</template>

<style lang="less" scoped>
.notice-dot {
	position: absolute;
	width: 12px;
	height: 12px;
	bottom: -20%;
	background: none;
	right: -20%;
	font-weight: bold;
	font-size: 0.7em;
	color: rgb(var(--v-theme-primary)) !important;
}

.v-popper__custom-menu.with-table {
	gap: 0;
}

.list-table {
	margin: 0 auto;
	padding: 0.5rem 0.5rem 0;
	padding-bottom: 0;
	border-collapse: collapse;
	max-height: 50vh;
	overflow: scroll;
	align-self: center;

	td,
	th {
		padding: 2px 1rem;
		border-radius: 1px;
	}

	thead {
		color: rgb(var(--v-theme-surface-bright));
		font-weight: 400;
		padding: 0.3125rem 0.125rem 0;
		text-transform: uppercase;
		font-family: Roboto, Helvetica, sans-serif;
		font-size: 0.6875rem;
		text-align: center;
	}

	tbody {
		th {
			font-weight: normal;
			text-align: left;
			border: 1px solid rgb(var(--v-theme-surface-bright));

			p {
				color: rgb(var(--v-theme-surface-bright));
				font-size: smaller;
			}
		}

		td {
			text-align: center;
			border: 1px solid rgb(var(--v-theme-surface-bright));

			svg {
				cursor: pointer;
			}
		}
	}

	caption {
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}
}

.copy-manager-buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;
}
</style>
