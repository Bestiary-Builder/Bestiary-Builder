<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";
import type { AvraeCharacter } from "./utils";

const { character } = defineProps<{ character: AvraeCharacter }>();

const image = computed(() => {
	if (character.overrides.image && (!character.overrides.image.includes("discordapp.com")))
		return character.overrides.image;
	else if (character.image)
		return character.image;
	return "";
});

const getUpstreamURL = (upstream: string) => {
    if (upstream.startsWith('dicecloud-')) {
      return `https://v1.dicecloud.com/character/${upstream.slice(10)}`;
    } else if (upstream.startsWith('google-')) {
      return `https://docs.google.com/spreadsheets/d/${upstream.slice(7)}`;
    } else if (upstream.startsWith('beyond-')) {
      return `https://ddb.ac/characters/${upstream.slice(7)}`;
    } else if (upstream.startsWith('dicecloudv2-')) {
      return `https://dicecloud.com/character/${upstream.slice(12)}`;
    }
    return '';
  }
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
				<Icon inline icon="material-symbols:swords"/>Attacks 
			</RouterLink>
			<a :href="getUpstreamURL(character.upstream)" target="_blank">Sheet<Icon inline icon="uil:book-open"/></a>
		</div>
	</div>
</template>

<style lang="less" scoped>
.content-tile {
	aspect-ratio: 1 / 1.5;
	background: var(--color-surface-1);
	color: #cbcbcb;
	padding: 1rem;
	box-shadow:
		rgba(0, 0, 0, 0.19) 0px 10px 20px,
		rgba(0, 0, 0, 0.23) 0px 6px 6px;

	display: grid;
	grid-template-rows: 1fr 7fr 1fr;
	gap: 0.3rem;

	text-decoration: unset;

	.tile-header {
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		color: white;
		font-size: 0.75rem;
	}

	.tile-content {
		overflow-y: auto;

		.tags {
			font-style: italic;
		}

		&.tile-has-image {
			position: relative;
			overflow-y: hidden;
			.tile-image {
				width: 100%;
				height: 100%;
				object-fit: cover;
				filter: brightness(75%);
				transition: filter 300ms ease-out;
			}
		}
	}

	.tile-footer {
		display: grid;
		grid-template-columns: 1fr 1fr;

		font-size: 1rem;

		& a:first-of-type {
			text-align: left;
		}

		& a:last-of-type {
			text-align: right;
		}
		a > svg {
			translate: 0 3px;
		}
	}
}

.content-tile:hover {
	background-color: #454241;
}
</style>
