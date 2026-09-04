<script lang="ts" setup>
import type { CreatureWithStats, Statblock } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { useToast } from "@/utils/app/toast";
import { getUmami } from "@/utils/app/analytics";
import { onMounted } from "vue";

const {
	noImportAll = false,
	mayImport = false,
	currentCreature = undefined,
	canCopyCurrentBestiary = false,
} = defineProps<{
	noImportAll?: boolean
	mayImport?: boolean
	currentCreature?: CopiedCreature | undefined
	canCopyCurrentBestiary?: boolean
}>()

const emit = defineEmits<{
	(e: "importCreature", data: Statblock): void;
	(e: "importAllCreatures"): void;
	(e: "copyCurrentBestiary"): void;
}>();

const { addToast } = useToast()

type CopiedCreature = CreatureWithStats & { bestiaryName: string };
let lastGoodValue: CopiedCreature[] = [];


const isQuotaExceededError = (err: DOMException) => {
	return (
		err instanceof DOMException &&
		(err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
	);
};

const copiedCreatures = useLocalStorage<CopiedCreature[]>('copiedCreatures', [], {
	onError: (err: any) => {
		if (isQuotaExceededError(err)) {
			console.error('Storage quota exceeded — reverting unsaved change.', err);
			copiedCreatures.value = lastGoodValue;
			addToast("Copied too many creatures - exceeded storage size.", { color: "error" })
		} else {
			console.error(err);
		}
	},
}
);

const addCreature = (creature: CopiedCreature) => {
	lastGoodValue = copiedCreatures.value
	copiedCreatures.value.push(creature)
}

const clearCreatures = () => {
	copiedCreatures.value = [];
};

const deleteCreature = (idx: number) => {
	copiedCreatures.value.splice(idx, 1);
};

const addManyCreatures = (creatures: CreatureWithStats[], bestiaryName: string) => {
	lastGoodValue = copiedCreatures.value
	const toAdd: CopiedCreature[] = [];
	for (const creature of creatures)
		toAdd.push({ ...creature, bestiaryName: bestiaryName });

	copiedCreatures.value = copiedCreatures.value.concat(toAdd);
	addToast("Copied current Bestiary");
	void getUmami()?.track("Copy bestiary");
}


const importCreature = (creature: CopiedCreature) => {
	emit("importCreature", creature.stats);
};

const importManyCreatures = () => {
	try {
		emit("importAllCreatures");

	} catch {
		console.log('aaaa')
	}
};

defineExpose({
	copiedCreatures,
	addManyCreatures,
	addCreature,
})

onMounted(() => {
	lastGoodValue = copiedCreatures.value
})
</script>

<template>
	<DropdownMenu>
		<template #activator="{ props }">
			<v-badge color="primary" :content="copiedCreatures.length" location="bottom right">
				<v-icon-btn v-tooltip="'Manage copies'" icon="mdi:content-copy" v-bind="props" text="Manage copies"
					size="24">
				</v-icon-btn>
			</v-badge>

		</template>
		<v-card min-width="500" class=" pa-4 d-flex justify-center flex-column">
			<v-card-text>
				<v-container>
					<v-list v-if="copiedCreatures.length > 0">
						<v-virtual-scroll :items="copiedCreatures" :item-height="72" max-height="700">
							<template #default="{ item: creature, index: idx }">
								<v-list-item :key="idx" border>
									<v-list-item-title>
										{{ creature.stats.description.name }}
									</v-list-item-title>
									<v-list-item-subtitle>
										{{ creature.bestiaryName }} (CR {{ creature.stats.description.cr }})
									</v-list-item-subtitle>

									<template #append>
										<v-icon-btn v-if="mayImport" icon="mdi:import" size="20" text="Import creature"
											@click="importCreature(creature)" />
										<v-icon-btn icon="mdi:delete" size="20" text="Delete creature from list"
											@click="deleteCreature(idx)" />
									</template>
								</v-list-item>
							</template>
						</v-virtual-scroll>
					</v-list>

					<v-list v-else>
						<v-list-item>
							<v-list-item-title>No creatures copied.</v-list-item-title>
							<v-list-item-subtitle>
								Start copying creatures to manage them here!
							</v-list-item-subtitle>
						</v-list-item>
					</v-list>
				</v-container>
			</v-card-text>
			<div class="d-flex justify-center items-center ga-4">
				<v-btn v-if="mayImport && copiedCreatures.length > 0 && !noImportAll" prepend-icon="mdi:import"
					color="success" @click="importManyCreatures">
					Import all
				</v-btn>
				<v-btn v-if="currentCreature" prepend-icon="mdi:content-copy"
					@click="lastGoodValue = copiedCreatures; copiedCreatures.push(currentCreature)">
					Copy current creature
				</v-btn>
				<v-btn v-if="canCopyCurrentBestiary" prepend-icon="mdi:content-copy"
					@click="emit('copyCurrentBestiary')">
					Copy current bestiary
				</v-btn>
				<v-btn v-if="copiedCreatures.length > 0" color="error" prepend-icon="mdi:trash"
					@click="clearCreatures()">
					Clear list
				</v-btn>
			</div>
		</v-card>
	</DropdownMenu>
</template>

<style lang="less" scoped>
.list-table {
	margin: 0 auto;
	padding: 0.5rem 0.5rem 0;
	padding-bottom: 0;
	border-collapse: collapse;
	align-self: center;
	overflow-y: scroll;
	max-height: 500px;

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

.v-badge :deep(.v-badge__badge) {
	pointer-events: none;
}
</style>
