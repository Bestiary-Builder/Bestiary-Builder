<script setup lang="ts">
import type { CreatureMetaData, CreatureWithStats, Statblock } from "~/shared";
import { onMounted, reactive, ref, useTemplateRef, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import CreatureList from "@/components/Bestiary/CreatureList.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { defaultStatblock } from "~/shared";
import { useLazyOptions } from "@/utils/app/useLazyOptions";
import CollectionHeader from "@/components/Collections/CollectionHeader.vue";

const {
	collection,
	items,
	editors,
	isOwner,
	isEditor,
	notices,
	getCollection,
	updateCollection,
	addEditor,
	removeEditor,
	getItem,
	getAllItems,
	createItem,
	createManyItems,
	deleteItem
} = useCollection("bestiary");

const { addToast, updateToast, removeToast } = useToast();
const rules = useRules();

const fetchList = async <T>(apiPath: string): Promise<T[]> => {
	const { success, data, error } = await useFetch<T[]>(`/api/${apiPath}`);
	if (!success)
		throw new Error(error);
	return data;
};

const srdCreatures = reactive(useLazyOptions<string>(
	() => fetchList(`/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/list`),
	{
		onError: (error: unknown) =>
			addToast(error instanceof Error ? error.message : String(error), { color: "error" })
	},
));

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

async function exportHomebrewery() {
	const toastId = addToast("Exporting...", { loading: true });

	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/bestiary/${collection.value?.id.toString()}`,
			"GET"
		);

		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			updateToast(toastId, { text: "Exported this bestiary markdown to your clipboard", prependIcon: "mdi:check", timeout: 2000 });
			void getUmami()?.track("Export bestiary to homebrewery");
		}
		else {
			updateToast(toastId, { text: error, color: "error", timeout: 2000 });
		}
	}
	catch (err) {
		updateToast(toastId, { text: err as string, color: "error", timeout: 2000 });
	}
}

async function exportBestiary(asFile: boolean) {
	const creatures = await getAllFullCreatures();
	if (!creatures) {
		addToast("Failed to export bestiary: no creatures found.", { color: "error" });
		return;
	}

	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					creatures.map(obj => obj.stats),
					null,
					2
				)
			],
			`${collection.value?.name || ""} from Bestiary Builder.txt`,
			{
				type: "text/plain"
			}
		);

		// https://javascript.plainenglish.io/javascript-create-file-c36f8bccb3be
		const link = document.createElement("a");
		const url = URL.createObjectURL(file);

		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
	else {
		await navigator.clipboard.writeText(
			JSON.stringify(
				creatures.map(obj => obj.stats),
				null,
				2
			)
		);
		addToast("Exported this bestiary to your clipboard.");
		void getUmami()?.track("Export bestiary to clipboard");
	}
}

const importFields = reactive({
	critterDbId: "",
	bestiaryBuilderJson: null
});


const isImportOpen = ref(false);
async function importBestiaryFromCritterDB() {
	let link = importFields.critterDbId.trim();
	if (link.length === 0) {
		addToast("No CritterDB link given", { color: "error" });
	}

	const isPublic = link.includes("publishedbestiary");
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			addToast("Could not recognize link as a link to a CritterDB bestiary", { color: "error" });
			return;
		}
	}
	catch {
		addToast("Something went wrong...", { color: "error" });
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	const toastId = addToast("Fetching bestiary data has started. This may take a while.");

	const { success, data, error } = await useFetch<{
		data: {
			creatures: Statblock[];
			name: string;
			description: string;
		};
		failedCreatures: string[];
	}>(`/api/critterdb/${link}/${isPublic}`);
	if (success) {
		if (data.failedCreatures.length > 0)
			addToast(`Failed to parse ${data.failedCreatures.length} creatures, due to invalid data recieved.`, { color: "error" });
		for (const creature of data.failedCreatures)
			notices.value[creature] = "Failed to parse, due to unrecognized data.";
	}
	else {
		updateToast(toastId, { text: error, color: "error", timeout: 2500 });
		return;
	}
	createManyItems(data.data.creatures);
	void getUmami()?.track("Import bestiary from CritterDB");
}

async function importCreaturesFromBestiaryBuilder() {
	let creaturesToImport;
	if (!importFields.bestiaryBuilderJson) {
		addToast("No JSON given", { color: "error" });
		return;
	}
	try {
		const reader = new FileReader();
		reader.onload = async () => {
			creaturesToImport = JSON.parse(reader.result as string || "");

			if (!Array.isArray(creaturesToImport))
				creaturesToImport = [creaturesToImport];

			createManyItems(creaturesToImport);
			void getUmami()?.track("Import bestiary from Bestiary Builder");
		};
		reader.readAsText(importFields.bestiaryBuilderJson);
	}
	catch {
		addToast("Something is wrong with the format of your JSON", { color: "error" });
	}
}

async function importSrdCreature(creature: string | null) {
	if (!creature)
		return;
	const { success, data, error } = await useFetch<Statblock>(`/api/srd-creatures/${store.user?.SRDVersion === "SRD_2024" ? "2024" : "2014"}/${encodeURIComponent(creature)}`);

	if (success) {
		await createItem(data);
		void getUmami()?.track("Import SRD creature");
		return data;
	}
	else {
		addToast(error, { color: "error" });
	}
}

const copyManager = useTemplateRef("copyManager")

const copyCurrentBestiary = async () => {
	if (!items.value || !collection.value)
		return;

	const creatures = await getAllFullCreatures();
	if (!creatures) {
		addToast("Failed to copy bestiary: no creatures found.", { color: "error" });
		return;
	}

	copyManager.value?.addManyCreatures(creatures, collection.value.name)
};

// misc
const fullCreatureCache = new Map<string, CreatureWithStats>();
const getFullCreature = async (creatureId: string) => {
	const cachedCreature = fullCreatureCache.get(creatureId);
	if (cachedCreature)
		return cachedCreature;

	const creatureRequest = getItem(creatureId);
	void creatureRequest.then((creature) => {
		if (!creature)
			fullCreatureCache.delete(creatureId);
		else
			fullCreatureCache.set(creatureId, creature);
	}, () => fullCreatureCache.delete(creatureId));
	return creatureRequest;
};

const getAllFullCreatures = async () => {
	if (!items.value)
		return undefined;

	let creatures = [];
	if (fullCreatureCache.size === items.value.length) {
		for (const creature of fullCreatureCache.values())
			creatures.push(creature);
	}
	else {
		creatures = await getAllItems() ?? [];
		for (const creature of creatures)
			fullCreatureCache.set(creature.id, creature);
	}

	return creatures;
};

const lastHoveredCreature = ref<CreatureWithStats | null>(null);
const lastClickedCreature = ref<CreatureWithStats | null>(null);
const hasPinnedBefore = ref(false);
const editorToAdd = ref("");
const showWarning = ref(false);
const newCreatureIsOpen = ref(false);

watch(lastClickedCreature, (): void => {
	if (hasPinnedBefore.value)
		return;
	if (!hasPinnedBefore.value)
		hasPinnedBefore.value = true;

	addToast("Pinned creature to the view. Click unpin there to go back to hover behaviour.");
	void getUmami()?.track("Pinned creature");
});

watch(() => collection.value?.status, (newValue): void => {
	if (newValue === "private" || newValue === "public")
		showWarning.value = false;
	if (newValue === "public")
		showWarning.value = true;
});

watch(() => collection.value?.name, (): void => {
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

const pinCreature = async (id: CreatureMetaData["id"]) => {
	if (lastClickedCreature.value?.id === id) {
		lastClickedCreature.value = null;
		return;
	}

	const fullCreature = await getFullCreature(id);
	if (!fullCreature) {
		addToast("Failed to pin creature: creature not found.", { color: "error" });
		return;
	}

	lastClickedCreature.value = fullCreature;
};

const hoverCreature = async (id: CreatureMetaData["id"]) => {
	lastHoveredCreature.value = await getFullCreature(id) ?? null;
};
</script>

<template>
	<div>
		<Breadcrumbs v-if="collection" :routes="[
			{
				path: isOwner || isEditor ? '/bestiaries/personal' : '/bestiaries/public',
				text: isOwner || isEditor ? 'My Bestiaries' : 'Bestiaries',
				isCurrent: false
			},
			{
				path: '',
				text: collection?.name,
				isCurrent: true
			}
		]">
			<v-icon-btn v-tooltip="'Create creature'" text="Create creature" icon="mdi:plus" size="24" class="inverted"
				@click="newCreatureIsOpen = !newCreatureIsOpen" />

			<CopyCreature :may-import="isOwner || isEditor" :current-creatures="items || []" can-copy-current-bestiary
				@import-creature="(creature) => createItem(creature, false)"
				@import-all-creatures="createManyItems(copyManager!.copiedCreatures.map(x => x.stats))"
				@copy-current-bestiary="copyCurrentBestiary" ref="copyManager" />

			<v-dialog v-if="isOwner" max-width="950">
				<template #activator="{ props }">
					<v-icon-btn v-tooltip="'Settings'" text="Collection Settings" icon="mdi:cog" size="24"
						v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Bestiary Settings" class="pa-4">
						<v-row>
							<v-col cols="6">
								<v-text-field v-model="collection.name" label="Name"
									:maxlength="store.limits?.nameLength" :min-length="store.limits?.nameMin"
									:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 10000)]"
									class="mb-4" />
							</v-col>
							<v-col cols="6">
								<v-text-field v-model="collection.image" label="Image" class="mb-4" />
							</v-col>

							<v-col cols="12">
								<v-textarea v-model="collection.description"
									:max-length="store.limits?.descriptionLength"
									:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]"
									label="Description" class="mb-4" hint="Supports Markdown" persistent-hint counter />
							</v-col>

							<v-col cols="6">
								<v-select v-model="collection.status" label="Status"
									:items="[{ value: 'private', title: 'Private' }, { value: 'unlisted', title: 'Unlisted' }, { value: 'public', title: 'Public' }]" />
							</v-col>
							<v-col cols="6">
								<v-select v-model="collection.tags" multiple :items="store.tags || []" label="Tags"
									chips closable-chips />
							</v-col>

							<v-col cols="12" class="px-4">
								<div>
									<SectionHeader title="Editors" />
									<p>
										Editors can add, edit, and remove items. <br>
										Editors cannot edit the Collection itself. <br>
										Editors cannot add other editors. The owner can remove editors at any time.
									</p>
								</div>
							</v-col>
							<v-col v-for="editor in editors" :key="editor.id" cols="4">
								<p>
									<UserBanner :id="editor.id" />
									<v-icon-btn v-if="isOwner" icon="mdi:delete" @click="removeEditor(editor.id)" />
								</p>
							</v-col>
							<v-col cols="6">
								<v-text-field v-model="editorToAdd" inputmode="numeric" label="Discord user ID"
									:rules="[rules.integer('This must be a numeric Discord User ID.')]"
									pattern="[0-9]*" />
							</v-col>
							<v-col cols="6">
								<v-btn class="w-100" size="large" @click="addEditor(editorToAdd)">
									Add
								</v-btn>
							</v-col>

							<p v-if="showWarning" style="color: rgb(var(--v-theme-error))">
								By changing the Collection status to public I confirm that I am the copyright holder
								of the content
								within, or that I have permission from the copyright holder to share this content. I
								hereby agree to
								the <RouterLink to="../content-policy">
									Content Policy
								</RouterLink> and agree to
								be fully liable for the content within. I affirm that the content does not include
								any official
								non-free D&D content. Collections that breach these terms may have their status
								changed to private or
								be outright removed, and may result in a ban if the content breaches our content
								policy.
							</p>
						</v-row>
						<v-card-actions>
							<v-spacer />
							<v-btn text="Save changes" color="success" size="large" @click="updateCollection" />
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>


			<v-dialog v-if="isOwner" max-width="750" v-model="isImportOpen">
				<template #activator="{ props }">
					<v-icon-btn v-tooltip="'Import creatures'" text="Import creatures" icon="mdi:import" size="24"
						v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Import bestiary" max-width="800" class="pa-4">
						<v-row>
							<v-col cols="6">
								<v-text-field v-model="importFields.critterDbId" label="CritterDB Bestiary link"
									hint="Make sure the Bestiary is public or has link-sharing enabled"
									persistent-hint />
								<v-btn size="large" class="w-100 mt-4" @click="importBestiaryFromCritterDB()">
									Import CritterDB
								</v-btn>
							</v-col>
							<v-col>
								<v-file-input v-model="importFields.bestiaryBuilderJson" label="Bestiary Builder JSON"
									hint="JSON (.json/.txt) describing a bestiary gotten from clicking export elsewhere on BB"
									persistent-hint accept=".txt,.json" prepend-inner-icon="mdi:attachment" prepe
									prepend-icon="" />

								<v-btn size="large" class="w-100 mt-4" @click="importCreaturesFromBestiaryBuilder()">
									Import BB
								</v-btn>
							</v-col>
						</v-row>
						<v-card-actions class="mt-4">
							<v-btn text="Cancel" size="large" @click="isActive.value = false" />
						</v-card-actions>
						<v-sheet v-if="JSON.stringify(notices) !== '{}'">
							<p class="warning">
								<b>Please note the following for this import:</b>
							</p>
							<div v-for="(notice, creature) in notices" :key="creature">
								<h3>
									{{ creature }}
								</h3>
								<p>
									{{ notice }}
								</p>
							</div>
						</v-sheet>
					</v-card>
				</template>
			</v-dialog>

			<DropdownMenu>
				<template #activator="{ props }">
					<v-icon-btn text="Export Bestiary" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export bestiary">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="success" size="large" @click="exportBestiary(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportBestiary(true)">
							File
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportHomebrewery()">
							Homebrewery
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="collection">
				<v-row gap="72">
					<v-col cols="6">
						<CollectionHeader :collection :item-count="(items || []).length" can-edit />
						<v-divider class="my-4" />
						<v-skeleton-loader v-if="items === null" type="heading, text, text" />
						<CreatureList v-else v-model="items" @hovered-creature="id => hoverCreature(id)"
							:pinned-creature="lastClickedCreature?.id || null" @pin-creature="id => pinCreature(id)"
							:collection="collection" can-edit @delete-creature="id => deleteItem(id)" />
					</v-col>
					<v-col cols="6">
						<div v-if="items && lastHoveredCreature" class="statblock-container">
							<span v-if="lastClickedCreature" class="pin-notice">
								<v-btn class="unpin-button" variant="text" density="compact" append-icon="mdi:pin-off"
									@click="lastClickedCreature = null"><b>unpin</b></v-btn>
							</span>
							<Transition name="fade" mode="out-in">
								<StatblockRenderer
									:key="lastClickedCreature?.stats.description.name || lastHoveredCreature.stats.description.name"
									:data="lastClickedCreature?.stats || lastHoveredCreature.stats" />
							</Transition>
						</div>
						<div v-else class="statblock-container">
							<div class="no-creature-text">
								<p>Hover or click on a creature to see its statblock</p>
							</div>
						</div>
					</v-col>
				</v-row>

			</div>
		</div>
	</div>

	<v-dialog v-model="newCreatureIsOpen" max-width="500">
		<v-card min-width="400" class="text-center pa-4" title="New Creature">
			<v-card-actions>
				<v-row>
					<v-col cols="12">
						<v-btn size="x-large" class="w-100" @click="createItem(defaultStatblock)">
							From scratch
						</v-btn>
					</v-col>
					<v-col cols="12">
						<div class="d-flex align-center my-4 w-100">
							<v-divider class="flex-grow-1" />
							<span class="mx-4 text-medium-emphasis">OR</span>
							<v-divider class="flex-grow-1" />
						</div>
					</v-col>
					<v-col cols="12">
						<v-autocomplete :items="srdCreatures.items" label="Select SRD creature"
							@update:model-value="item => importSrdCreature(item)"
							@update:menu="srdCreatures.handleMenuOpen" :loading="srdCreatures.loading"
							prepend-inner-icon="mdi:database">
							<template #item="{ props, item }">
								<v-list-item v-bind="props" density="compact" style="min-height: 28px">
									{{ (item as any).title }}
								</v-list-item>
							</template>
							<template #no-data>
								<v-list-item>
									<v-list-item-title>
										{{ srdCreatures.loading ? 'Loading...' : 'No creatures found' }}
									</v-list-item-title>
								</v-list-item>
							</template>
						</v-autocomplete>
					</v-col>
				</v-row>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-fab icon="mdi:plus" location="bottom end" app color="primary" size="large" @click="newCreatureIsOpen = true" />
</template>

<style scoped>
.pin-notice {
	float: right;
	cursor: pointer;
}

.unpin-button {
	text-decoration: underline;
	cursor: pointer;
}

.warning {
	color: rgb(var(--v-theme-error));
	margin-top: 0.5rem;
}
</style>
