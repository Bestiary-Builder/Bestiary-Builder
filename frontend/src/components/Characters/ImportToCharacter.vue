<script setup lang="ts">
import type { AvraeCharacter } from "./utils";
import type { AttackModel } from "~/shared";
import { ref } from "vue";
import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";
import { getAvraeCharacters } from "./utils";

const { automation } = defineProps<{ automation: AttackModel | AttackModel[] | null }>();
const { addToast, updateToast } = useToast();
const AvraeToken = localStorage.getItem("AvraeToken");
const isMenuOpen = ref(false);

const characters = ref<null | AvraeCharacter[]>(null);

const loading = ref(false);
const selectedCharacter = ref<null | AvraeCharacter["upstream"]>(null);
const hasFetched = ref(false);

const fetchCharacters = async () => {
	loading.value = true;
	characters.value = await getAvraeCharacters();
	loading.value = false;
};

const handleMenuOpen = (isOpen: boolean) => {
	if (isOpen && !hasFetched.value) {
		fetchCharacters();
		hasFetched.value = true;
	}
};

const confirmImport = async () => {
	void getUmami()?.track("Import automation to Character");
	if (!selectedCharacter.value) {
		addToast("No character selected", { color: "error" });
		return;
	}
	if (!automation) {
		addToast("No automation set", { color: "error" });
		return;
	}
	const toastId = addToast("Waiting on the Avrae API", { loading: true });
	const { success, data, error } = await useFetch(`/api/character/${selectedCharacter.value}/attacks/add`, "POST", toArray(automation));

	if (error) {
		updateToast(toastId, { text: error, color: "error" });
	}
	else {
		updateToast(toastId, { color: "success", prependIcon: "mdi:check", text: "Successfully added this attack!" });
		isMenuOpen.value = false;
	}
};

const copyCommand = async () => {
	if (!automation) {
		addToast("No automation set", { color: "error" });
		return;
	}
	const toastId = addToast("Waiting on the Avrae API", { loading: true });
	const { success, data, error } = await useFetch<{ gvarId: string }>(`/api/character/makeattackgvar`, "POST", toArray(automation));

	if (error) {
		updateToast(toastId, { text: error, color: "error" });
	}
	else if (data) {
		updateToast(toastId, { color: "success", prependIcon: "mdi:check", text: "Copied Avrae Command to Discord!" });
		navigator.clipboard.writeText(`!alias importactionfrombb multiline
!a import {{get_gvar("${data.gvarId}")}}
!alias delete importactionfrombb
# NOW RUN \`!importactionfrombb\` to import your Action.`);
		isMenuOpen.value = false;
	}
};

const toArray = <T>(input: T | T[]): T[] => {
	return Array.isArray(input) ? input : [input];
};
</script>

<template>
	<v-dialog v-model="isMenuOpen" max-width="600">
		<template #activator="{ props }">
			<v-icon-btn v-tooltip="'Import to Avrae'" icon="$avrae" v-bind="props" size="24" />
		</template>

		<template #default="{ isActive }">
			<v-card
				class="text-center pa-4" title="Import this attack to your character."
				subtitle="Use to test your attack or if your character wants this action."
			>
				<v-card-text>
					<div v-if="AvraeToken">
						<v-select
							v-model="selectedCharacter" :items="characters || []" :loading="loading"
							item-title="name" item-value="upstream" label="Select a character"
							class="mt-4" hide-details @update:menu="handleMenuOpen"
						>
							<template #no-data>
								<v-list-item>
									<v-list-item-title>
										{{ loading ? 'Loading characters...' : 'No characters found' }}
									</v-list-item-title>
								</v-list-item>
							</template>
						</v-select>
						<p v-if="selectedCharacter !== null" class="py-5 text-error">
							Warning: this will override existing attacks of the same name.
						</p>
						<v-btn
							v-if="selectedCharacter !== null" class="w-100" size="large" color="success"
							prepend-icon="mdi:import" @click="confirmImport"
						>
							Confirm import
						</v-btn>
					</div>
					<div v-else class="text-primary">
						You can set up importing to your characters with just a button press!
						Set it up in <RouterLink to="/user">
							your user settings.
						</RouterLink>
					</div>
					<div class="d-flex align-center my-4 w-100">
						<v-divider class="flex-grow-1" />
						<span class="mx-4 text-medium-emphasis">OR</span>
						<v-divider class="flex-grow-1" />
					</div>
					<div>
						<v-btn prepend-icon="mdi:content-copy" size="large" class="w-100" @click="copyCommand">
							Copy
							Avrae
							Command
						</v-btn>
					</div>
				</v-card-text>
				<v-card-actions />
			</v-card>
		</template>
	</v-dialog>
</template>
