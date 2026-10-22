<script setup lang="ts">
import type { AvraeCharacter } from "@/components/Characters/utils";
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref } from "vue";
import CharacterTile from "@/components/Characters/CharacterTile.vue";
import { getAvraeCharacters } from "@/components/Characters/utils";
import { sendToAvraeLogin } from "@/utils/utils";

const AvraeToken = useLocalStorage("AvraeToken", "");

const characters = ref<AvraeCharacter[] | null>(null);

onMounted(async () => {
	if (AvraeToken)
		characters.value = await getAvraeCharacters();
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
	/>
	<div v-if="!AvraeToken" class="content">
		This page allows you to edit the attacks of your Avrae characters using the BB editor.
		<br>
		<v-btn color="#9c27b0" prepend-icon="$avrae" variant="flat" class="mt-4" @click.prevent="sendToAvraeLogin($route.path)">
			Login with Avrae
		</v-btn>
	</div>
	<div class="content">
		<div class="character-container">
			<CharacterTile v-for="char, idx of characters" :key="idx" :character="char" />
		</div>
		<div v-if="characters === null">
			Loading...
		</div>
	</div>
</template>

<style lang="less" scoped>
.character-container {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
	gap: 1rem;
}
</style>
