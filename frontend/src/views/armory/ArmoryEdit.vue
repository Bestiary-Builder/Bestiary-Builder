<script setup lang="ts">
import type { AttackModel, Automation } from "~/shared";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRules } from "vuetify/labs/rules";
import StatusIcon from "@/components/Bestiary/StatusIcon.vue";
import { useCollection } from "@/components/Bestiary/useCollection";
import UserBanner from "@/components/Bestiary/UserBanner.vue";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";
import Markdown from "@/components/Global/Markdown.vue";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { ACTION_TYPE_MAP, getActionTypeLabel } from "./utils";
import YAML from "yaml";
import AutomationList from "@/components/Automations/AutomationList.vue";

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
	createItem,
	deleteItem,
	createManyItems
} = useCollection("automations");

const { addToast, removeToast } = useToast();
const rules = useRules();

onMounted(async () => {
	const toastId = addToast("Loading...", { loading: true });
	await getCollection();
	removeToast(toastId);
	if (collection.value?.name)
		document.title = `${collection.value?.name.substring(0, 16)} | Bestiary Builder`;
});

async function exportCollection(asFile: boolean) {
	if (asFile) {
		const file = new File(
			[
				JSON.stringify(
					items.value?.map(obj => obj.automation),
					null,
					2
				)
			],
			"items.txt",
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
				items.value?.map(obj => obj.automation),
				null,
				2
			)
		);
		addToast("Exported this collection to your clipboard.");
		void getUmami()?.track("Export collection to clipboard");
	}
}

// misc
const editorToAdd = ref("");
const showWarning = ref(false);

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

const createNewActionOpen = ref(false);

const createOptions = reactive<{ name: string, description: string, activation_type: null | number }>({
	name: "",
	description: "",
	activation_type: null
});

const activationTypeOptions = computed(() => {
	return Object.entries(ACTION_TYPE_MAP)
		.map(([key, title]) => ({
			title,
			value: Number(key) === 0 ? null : Number(key),
		}))
		.sort((a, b) => (a.value ?? 0) - (b.value ?? 0));
});

const importFields = reactive({
	attackJson: null
});


const importIsOpen = ref(false);
async function importAutomationsFromJson() {
	let attacksToImport;
	if (!importFields.attackJson) {
		addToast("No JSON given", { color: "error" });
		return;
	}
	try {
		const reader = new FileReader();
		reader.onload = async () => {
			attacksToImport = YAML.parse(reader.result as string || "");

			if (!Array.isArray(attacksToImport))
				attacksToImport = [attacksToImport];

			await createManyItems(attacksToImport)
			importIsOpen.value = false;
		};
		reader.readAsText(importFields.attackJson);
	}
	catch {
		addToast("Something is wrong with the format of your Automations", { color: "error" });
	}
}

const createAutomation = () => {
	const data: Partial<Automation> = { name: createOptions.name, description: createOptions.description, automation: { _v: 2, name: createOptions.name, automation: [] } }
	if (createOptions.activation_type !== 0 && createOptions.activation_type !== null && !Array.isArray(data.automation))
		data.automation!.activation_type = createOptions.activation_type
	createItem(data, false)
	createNewActionOpen.value = false

}
</script>

<template>
	<div>
		<Breadcrumbs v-if="collection" :routes="[
			{
				path: isOwner || isEditor ? '/armory/personal' : '/armory/public',
				text: isOwner || isEditor ? 'My Automations' : 'Automations',
				isCurrent: false
			},
			{
				path: '',
				text: collection?.name,
				isCurrent: true
			}
		]">
			<v-icon-btn v-tooltip="'Create creature'" text="Create creature" icon="mdi:plus" size="24" class="inverted"
				@click="createNewActionOpen = !createNewActionOpen" />

			<v-dialog v-if="isOwner" max-width="950">
				<template #activator="{ props }">
					<v-icon-btn v-tooltip="'Settings'" text="Collection Settings" icon="mdi:cog" size="24"
						v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Collection Settings" class="pa-4">
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


			<v-dialog v-if="isOwner" max-width="750" v-model="importIsOpen">
				<template #activator="{ props }">
					<v-icon-btn v-tooltip="'Import actions'" text="Import actions" icon="mdi:import" size="24"
						v-bind="props" />
				</template>

				<template #default="{ isActive }">
					<v-card title="Import bestiary" max-width="800" class="pa-4">
						<v-card-text>
							<v-row>
								<v-col>
									<v-file-input v-model="importFields.attackJson" label="Attack JSON"
										hint="JSON (.json/.txt) or YAML (.yaml, .txt) formatted as a list of automated actions"
										persistent-hint accept=".txt,.json,.yaml" />
								</v-col>
							</v-row>
						</v-card-text>

						<v-card-actions>
							<v-btn size="large" @click="importAutomationsFromJson"
								:color="importFields.attackJson ? 'success' : undefined" prepend-icon="mdi:import">
								Import
							</v-btn>
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
					<v-icon-btn text="Export collection" icon="mdi:export" size="24" v-bind="props" />
				</template>
				<v-card min-width="300" class="text-center pb-2 pa-4" title="Export collection">
					<v-card-actions class="d-flex flex-column align-center justify-center" min-width="200">
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(false)">
							Clipboard
						</v-btn>
						<v-btn class="w-100" color="success" size="large" @click="exportCollection(true)">
							File
						</v-btn>
					</v-card-actions>
				</v-card>
			</DropdownMenu>
		</Breadcrumbs>
		<div class="content">
			<div v-if="collection">
				<v-card class="pa-2" color="surface" elevation="0">
					<v-card-title class="pb-0">
						{{ collection.name }}
					</v-card-title>
					<v-card-text>
						<v-row density="compact">
							<v-col cols="4">
								<v-row>
									<v-col class="d-flex justify-start align-center">
										<UserBanner :id="collection.ownerId" class="mt-2 mb-4" />
									</v-col>
									<v-col class="d-flex justify-center align-center">
										<div>
											{{ items?.length }}
											<v-icon icon="material-symbols:automation" size="20" />
										</div>
									</v-col>
									<v-col class="d-flex justify-end align-center">
										<StatusIcon :icon="collection.status" />
									</v-col>
								</v-row>

								<v-col cols="12">
									<v-chip-group v-if="collection.tags.length">
										<v-chip v-for="tag in [...collection.tags].sort()" :key="tag" size="small"
											variant="tonal">
											{{ tag }}
										</v-chip>
									</v-chip-group>
								</v-col>

								<v-col cols="12">
									<Markdown class="description "
										:text="collection.description || 'No description set.'" tag="p" />
								</v-col>
							</v-col>
							<v-col cols="8">
								<v-img :src="collection.image" max-height="200" />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<v-divider class="my-4" />
				<v-skeleton-loader v-if="items === null" type="heading, text, text" />
				<AutomationList v-else v-model="items" :can-edit="true" :collection="collection" @delete-item="(id) => deleteItem(id)"/>
			</div>
		</div>
	</div>

	<v-dialog v-model="createNewActionOpen" max-width="750">
		<v-card title="New Action" class="pa-4">
			<v-card-text>
				<v-row>
					<v-col>
						<v-text-field v-model="createOptions.name" label="Name"
							:rules="[rules.required(), rules.minLength(store.limits?.nameMin || 3), rules.maxLength(store.limits?.nameLength || 3)]" />
					</v-col>
					<v-col>
						<v-select v-model="createOptions.activation_type" label="Type" :items="activationTypeOptions" />
					</v-col>
					<v-col cols="12">
						<v-textarea v-model="createOptions.description" label="Description"
							:rules="[rules.maxLength(store.limits?.descriptionLength || 10000)]" counter />
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text="Create" color="success" size="large" @click="createAutomation" />
				<v-btn text="Cancel" size="large" @click="createNewActionOpen = false" />
			</v-card-actions>
		</v-card>
	</v-dialog>
	<v-fab icon="mdi:plus" location="bottom end" app color="primary" size="large" @click="createNewActionOpen = true" />
</template>

<style lang="less" scoped>
@media screen and (width >=1200px) {
	.content {
		padding-left: 10vw;
		padding-right: 10vw;
	}
}
</style>
