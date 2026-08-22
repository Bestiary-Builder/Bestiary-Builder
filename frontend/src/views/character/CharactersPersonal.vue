<script setup lang="ts">
import type { AvraeCharacter } from "@/components/Characters/utils";
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref } from "vue";
import CharacterTile from "@/components/Characters/CharacterTile.vue";
import { getAvraeCharacters } from "@/components/Characters/utils";

const AvraeToken = useLocalStorage("AvraeToken", "");

const characters = ref<AvraeCharacter[] | null>(null);

onMounted(async () => {
	if (AvraeToken)
		characters.value = await getAvraeCharacters();
});
</script>

<template>
	<Breadcrumbs :routes="[
		{
			path: '',
			text: 'Characters',
			isCurrent: true
		}
	]" />
	<div v-if="!AvraeToken" class="content">
		This page allows you to edit the attacks of your Avrae characters using the BB editor.
		<br><br>
		No Avrae Token Set. Please see <RouterLink to="/user#avrae-token" style="color: orangered">
			your user settings
		</RouterLink> for how to enable this.
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
	grid-gap: 1rem;

	&>a {
		text-decoration: none;
	}
}
</style>
