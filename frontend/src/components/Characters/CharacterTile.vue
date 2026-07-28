<script setup lang="ts">
import type { AvraeCharacter } from "./utils";
import { Icon } from "@iconify/vue";
import { computed } from "vue";

const { character } = defineProps<{ character: AvraeCharacter }>();

const image = computed(() => {
	if (character.overrides.image && (!character.overrides.image.includes("discordapp.com")))
		return character.overrides.image;
	else if (character.image)
		return character.image;
	return "";
});

const getUpstreamURL = (upstream: string) => {
	if (upstream.startsWith("dicecloud-")) {
		return `https://v1.dicecloud.com/character/${upstream.slice(10)}`;
	}
	else if (upstream.startsWith("google-")) {
		return `https://docs.google.com/spreadsheets/d/${upstream.slice(7)}`;
	}
	else if (upstream.startsWith("beyond-")) {
		return `https://ddb.ac/characters/${upstream.slice(7)}`;
	}
	else if (upstream.startsWith("dicecloudv2-")) {
		return `https://dicecloud.com/character/${upstream.slice(12)}`;
	}
	return "";
};
</script>

<template>
	<div class="content-tile">
		<div class="tile-header">
			<h2>{{ character.name }}</h2>
		</div>
		<div class="tile-content" :class="{ 'tile-has-image': image }">
			<img class="tile-image" :src="image">
		</div>
		<div class="tile-footer">
			<RouterLink :to="`/characters/${character.upstream}`">
				<Icon inline icon="material-symbols:swords" />Attacks
			</RouterLink>
			<a :href="getUpstreamURL(character.upstream)" target="_blank">Sheet<Icon inline icon="uil:book-open" /></a>
		</div>
	</div>
</template>

<style lang="less" scoped>
@import "../Global/tile.less";
.content-tile {
	aspect-ratio: 1 / 1.5;
}
</style>
