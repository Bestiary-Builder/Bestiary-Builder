<template>
	<!-- <Breadcrumbs
	:routes="[
		{
			path: '',
			text: 'Home',
			isCurrent: true
		}
	]"
	:isLessWide="true"
	/> -->
	<div class="article-header">
		<div class="header-content">
			<h1 class="header-title">Bestiary Builder</h1>
			<p>Welcome to Bestiary Builder, <i>the</i> convenient Bestiary Creator for D&D 5e, designed for incredible integration with <a href="https://avrae.io/"> Avrae</a> and convenience of use!</p>
		</div>
		<img src="/mmcover.jpg" alt="" class="header-image" />
	</div>
	<div v-show="stats != null" class="stats">
		<span>Users: {{ stats?.users }}</span>
		<span>Bestiaries: {{ stats?.bestiaries }}</span>
		<span>Creatures: {{ stats?.creatures }}</span>
	</div>
	<div class="content markdown less-wide">
		<div v-if="content" v-html="content"></div>
	</div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
// @ts-ignore
import markdownit from "markdown-it";
const md = markdownit({html: true, linkify: true, typographer: true});
import dataFile from "@/assets/documents/home.md";
import Breadcrumbs from "@/components/Breadcrumbs.vue";
import {handleApiResponse} from "@/main";
export default defineComponent({
	data() {
		return {
			content: md.render(dataFile),
			stats: null as {
				creatures: number;
				bestiaries: number;
				users: number;
			} | null
		};
	},
	components: {
		Breadcrumbs
	},
	mounted() {
		fetch("/api/stats")
			.then(handleApiResponse)
			.then((result) => {
				if (result.success) {
					this.stats = result.data as {
						creatures: number;
						bestiaries: number;
						users: number;
					};
				} else {
					console.error("Failed to retrieve global stats.");
					this.stats = null;
				}
			});
	}
});
</script>
<style scoped>
html {
	overflow-y: unset;
}
.stats {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
</style>
<style scoped lang="less">
@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&display=block");
.content {
	z-index: 2;
	position: relative;
	padding-top: 0;
}
.article-header {
	display: grid;
	place-items: center;
	position: relative;
	height: 95svh;
	overflow-x: clip;
	padding-block: 7rem;
	margin-block-end: 3rem;
	color: white;

	.header-content {
		z-index: 1;
		text-align: center;
		h1 {
			font-size: 12vw;
			text-transform: uppercase;
			font-family: "Bebas Neue", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
			letter-spacing: 3px;
		}

		p {
			font-size: 1.5rem;
			text-wrap: balance;
			font-weight: 100;
			max-width: 80%;
			margin: auto;
		}
	}
	.header-image {
		grid-column: 1 / -1;
		position: absolute;
		inset: 0;
		width: 100vw;
		height: 100%;
		opacity: 0.3;
		object-fit: cover;
		z-index: 0;
		pointer-events: none;
		transform-origin: top right;
		scale: 1;
	}
}

@keyframes header-image-animation {
	85%,
	100% {
		opacity: 0.3;
		scale: 1.5;
	}
}

@supports (animation-timeline: view()) {
	.header-image {
		animation: header-image-animation linear forwards;
		animation-timeline: view();
		animation-range: exit;
	}
}
</style>
