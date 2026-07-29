<script setup lang="ts">
import type { AvraeCharacter } from "./utils";
import { Icon } from "@iconify/vue";
import { computed } from "vue";

const { character } = defineProps<{ character: AvraeCharacter }>();

const characterImage = computed(() => {
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

const characterClasses = computed(() => {
	const classes = character.levels.classes
	let output = ""
	for (const [cls, level] of Object.entries(classes)) {
		output += `Level ${level} ${cls}, `
	}
	return output.slice(0, -2)
})

const firstLetters = computed(() => {
	const firstLetters = character.name
		.replace(/[^a-zA-Z0-9\s]/g, '')
		.split(' ')
		.map(word => word.charAt(0))
		.join('')
		.toUpperCase();
	return firstLetters
})
</script>

<template>
	<div>
		<div class="character">
			<div class="image-container">
				<img :src="characterImage" v-if="characterImage" class="image" />
				<div v-else class="image">
					{{ firstLetters }}
				</div>
			</div>
			<hr />
			<div class="meta">
				<h2> {{ character.name }} </h2>
				<i> {{ characterClasses }} </i>
				<div class="collection-footer">
					<RouterLink :to="`/characters/${character.upstream}`">
						<Icon inline icon="material-symbols:swords" />Edit attacks
					</RouterLink>
					<a :href="getUpstreamURL(character.upstream)" target="_blank">View sheet
						<Icon inline icon="uil:book-open" />
					</a>
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="less">
@font-face {
	font-family: "Scala Sans Offc";
	src: url("../Statblock/styles/ScalaSans.woff2") format("woff2");
}
.character {
	border-radius: .5rem;
	background-color: var(--color-surface-0);
	transition: scale ease-in-out .2s;

	&:hover {
		scale: 1.02
	}

	.image-container {
		padding-top: 120%;
		position: relative;

		.image {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
			border-radius: 4px;
			object-fit: cover;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: xx-large;
		}
	}

	hr {
		margin-top: .25rem;
		margin-bottom: .25rem;
	}

	.meta {
		padding: 0 .5rem 1rem;
		font-family: "Scala Sans Offc", Roboto, Helvetica, sans-serif;

		h2 {
			font-size: 20px;
		}

		.description {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 3;
			line-clamp: 3;
			overflow: hidden;
			margin: .5rem 0;
			font-size: smaller;
		}

		.collection-footer {
			display: flex;
			justify-content: space-between;
			font-size: smaller;

			svg {
				translate: 0 3px;
			}
		}
	}
}
</style>
