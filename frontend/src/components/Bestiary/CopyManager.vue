<script lang="ts" setup>
import type { CreatureWithStats, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { $toast } from "@/utils/app/toast";
import DropdownMenu from "../Global/DropdownMenu.vue";
import ButtonIcon from "../Global/ButtonIcon.vue";

const props = withDefaults(
	defineProps<{
		noImportAll?: boolean; mayImport?: boolean; currentCreature?:
			CopiedCreature | undefined; canCopyCurrentBestiary?: boolean;
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
	$toast.success("Successfully cleared copied creatures list");
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
			<ButtonIcon icon="copy" label="Delete creature" v-bind="props" no-tooltip />
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
								<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']"
									@click="importCreature(creature)" />
							</td>
							<td> <font-awesome-icon :icon="['fas', 'trash']" @click="deleteCreature(idx)" /></td>
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
							<td style="color: grey; border: 0px">
								Start copying creatures<br>to manage them here!
							</td>
						</tr>
					</tbody>
				</table>
			</v-card-text>
			<v-card-actions class="text-center">
				<v-btn v-if="copiedCreatures.length > 0" @click="clearCreatures()" size="small">
					Clear list 
				</v-btn>
				<v-btn v-if="mayImport && copiedCreatures.length > 0 && !props.noImportAll"
					@click="importManyCreatures" size="small">
					Import all 
				</v-btn>
				<v-btn v-if="currentCreature"  @click="copiedCreatures.push(currentCreature)" size="small">
					Copy current creature 
				</v-btn>
				<v-btn v-if="canCopyCurrentBestiary" @click="emit('copyCurrentBestiary')" size="small">
					Copy current bestiary 
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
	color: orangered !important;
}

.v-popper__custom-menu.with-table {
	gap: 0;
}

.list-table {
	margin: 0 auto 0;
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
		color: grey;
		text-transform: uppercase;
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
			border: 1px solid grey;

			p {
				color: lightgray;
				font-size: smaller;
			}
		}

		td {
			text-align: center;
			border: 1px solid grey;

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
