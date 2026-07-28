<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref } from "vue";
import CharacterTile from "@/components/Characters/CharacterTile.vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import { getUmami } from "@/utils/app/analytics";
import { $toast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const AvraeToken = useLocalStorage("AvraeToken", "");

const characters = ref<Array<any>>([]);
const getAvraeCharacters = async () => {
	const toasterId = $toast.loading("Getting character data from Avrae...");
	const { success, data, error } = await useFetch("/api/character/list");
	if (success) {
		$toast.success("Loaded Avrae Characters", { id: toasterId });
		getUmami()?.track("Loaded Avrae Characters");
		characters.value = (data as any[]).sort((x, y) => {
			return (x.active === y.active) ? 0 : x.active ? -1 : 1;
		});
	}
	else {
		$toast.error(error);
	}
};
onMounted(async () => {
	if (AvraeToken)
		await getAvraeCharacters();
});
</script>

<template>
	<Breadcrumbs
		:routes="[
			{
				path: '',
				text: 'Characters',
				isCurrent: true
			}
		]"
	>
		<ButtonIcon icon="avrae" label="avrae" />
	</Breadcrumbs>
	<div v-if="!AvraeToken" class="content">
		<LabelledComponent title="Avrae Token">
			<div class="preview-container">
				<input v-model="AvraeToken" type="text">
			</div>
			<small> Instructions go here. </small>
		</LabelledComponent>
	</div>
	<div v-else class="content">
		<div class="tile-container">
			<CharacterTile v-for="char, idx of characters" :key="idx" :character="char" />
		</div>
	</div>
</template>

<style lang="less" scoped>
.tile-container {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	gap: 1.5em;
}

@media screen and (max-width: 1600px) {
	.tile-container {
		grid-template-columns: 1fr 1fr 1fr;
	}
}

@media screen and (max-width: 1200px) {
	.tile-container {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 800px) {
	.tile-container {
		grid-template-columns: 1fr;
	}
}
</style>
