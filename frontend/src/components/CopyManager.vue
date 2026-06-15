<script lang="ts" setup>
import { useLocalStorage } from "@vueuse/core";
import { store } from "@/utils/store";
import type { CreatureWithStats, Statblock } from "~/shared";
import { toast } from "@/utils/app/toast";

const props = withDefaults(
	defineProps<{ noImportAll?: boolean; mayImport: boolean; currentCreature?:
		CopiedCreature | undefined; canCopyCurrentBestiary?: boolean; }>(),
	{ noImportAll: false, mayImport: false, currentCreature: undefined, canCopyCurrentBestiary: false	}
);

const emit = defineEmits<{
	(e: "importCreature", data: Statblock): void;
	(e: "importAllCreatures"): void;
	(e: "copyCurrentBestiary"): void;
}>();

const copiedCreatures = useLocalStorage<CopiedCreature[]>("copiedCreatures", []);

const clearCreatures = () => {
	copiedCreatures.value = [];
	toast.success("Successfully cleared copied creatures list");
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
	<VDropdown :distance="6" placement="bottom" :positioning-disabled="store.isMobile">
		<button v-tooltip="'Copy creatures'" aria-label="Copy creatures" @click.stop.prevent>
			<font-awesome-icon :icon="['fa', 'copy']" />
			<div class="notice-dot">
				{{ copiedCreatures.length }}
			</div>
		</button>
		<template #popper>
			<div class="v-popper__custom-menu with-table">
				<table v-if="copiedCreatures.length > 0" class="list-table">
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
								<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" @click="importCreature(creature)" />
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
						Copied creatures list empty
					</caption>
					<tbody>
						<td style="color: grey; border: 0px">
							Start copying creatures to manage them here!
						</td>
					</tbody>
				</table>

				<div class="buttons">
					<button v-if="copiedCreatures.length > 0" class="btn danger-hover" @click="clearCreatures()">
						Clear list <font-awesome-icon :icon="['fas', 'trash']" />
					</button>
					<button v-if="mayImport && copiedCreatures.length > 0 && !props.noImportAll" class="btn" @click="importManyCreatures">
						Import all <font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
					</button>
					<button v-if="currentCreature" class="btn" @click="copiedCreatures.push(currentCreature)">
						Copy current creature <font-awesome-icon :icon="['fas', 'copy']" />
					</button>
					<button v-if="canCopyCurrentBestiary" class="btn" @click="emit('copyCurrentBestiary')">
						Copy current bestiary <font-awesome-icon :icon="['fas', 'copy']" />
					</button>
				</div>
			</div>
		</template>
	</VDropdown>
</template>

<style lang="less">
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
	margin: 1rem auto 0;
	padding: 0.5rem 0.5rem 0;
	padding-bottom: 0;
	min-width: 300px;
	border-collapse: collapse;
	max-height: 50vh;
	overflow: scroll;
	display: block;
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
		font-size: 1.3rem;
		min-width: 300px;
	}
}

.buttons {
	display: flex;
	gap: 1rem;
	justify-content: center;
}
</style>
