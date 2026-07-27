<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed } from "vue";

const { character } = defineProps<{ character: any }>();
console.log(character);

const image = computed(() => {
	if (character.overrides.image && (!character.overrides.image.includes("discordapp.com")))
		return character.overrides.image;
	else if (character.image)
		return character.image;
	return "";
});
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
			<span> LVL {{ character.levels.total_level }} </span>
			<RouterLink :to="`/characters/${character.upstream}`">
				edit attacks
			</RouterLink>
			<span> {{ character.overrides.attacks.length }}
				<Icon icon="material-symbols:swords" color="orangered" inline width="1em" />
			</span>
		</div>
	</div>
</template>

<style lang="less" scoped>
@import "@/assets/styles/mixins.less";

.content-tile {
	aspect-ratio: 1 / 1;
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
	}

	.tile-content {
		overflow-y: auto;

		.tags {
			font-style: italic;
		}

		&.tile-has-image {
			position: relative;
			overflow-y: hidden;
			.description,
			.tags {
				position: absolute;
				width: 90%;
				height: 100%;
				left: 5%;
				top: 500px;
				display: inline;
				z-index: 1;
				transition: top 300ms ease-out;
			}

			.tags {
				overflow: hidden;
				text-wrap: nowrap;
				text-overflow: ellipsis;
			}

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
		grid-template-columns: 1fr 1fr 1fr;
		text-align: center;

		& span:first-of-type {
			text-align: left;
		}

		& span:last-of-type {
			text-align: right;
		}
	}
}

.content-tile {
	.scale-on-hover(1.05);
}

.content-tile:hover {
	background-color: #454241;
}
</style>
