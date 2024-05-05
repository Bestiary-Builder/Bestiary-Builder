<template>
	<div class="article-header">
		<div class="header-content">
			<h1 class="header-title">Bestiary Builder</h1>
			<div class="call-to-action">
				<ul class="left">
					<li>
						Join our <b>{{ stats?.users }}</b> users!
					</li>
					<li>
						Flip through our <b>{{ stats?.bestiaries }}</b> bestiaries!
					</li>
					<li>
						Frighten your players with our <b>{{ stats?.creatures }}</b> creatures!
					</li>
				</ul>
				<ul class="right">
					<li>
						Welcome to Bestiary Builder, <i>the</i> convenient Bestiary Creator for <span style="display: inline-block"><b>D&D 5e</b>,</span> designed for incredible integration with <b><a href="https://avrae.io/"> Avrae</a></b> and convenience of use!
					</li>
				</ul>
			</div>
		</div>
		<img src="/mmcover.jpg" alt="" class="header-image" />
	</div>

	<div class="content markdown less-wide">
		<Markdown :text="dataFile" :options="{html: true, linkify: true, typographer: true}" />
	</div>
</template>

<script setup lang="ts">
import dataFile from "@/assets/documents/home.md";
import Markdown from "@/components/Markdown.vue";
import {handleApiResponse} from "@/main";
import { onBeforeMount, ref } from "vue";
import type { GlobalStats } from "../../../shared";

const stats = ref<null | GlobalStats>(null);
onBeforeMount(async () => {
	await fetch("/api/stats")
		.then(handleApiResponse)
		.then((result) => {
			if (result.success) {
				stats.value = result.data as GlobalStats
			} else {
				console.error("Failed to retrieve global stats.");
				stats.value = null;
			}
		});
	}
)
</script>
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

	.call-to-action {
		display: grid;
		grid-template-columns: 1fr 1fr;
		font-weight: bolder;

		ul {
			list-style-type: none;
			font-size: 1.5rem;
			max-width: 80%;
			margin: auto;

			li {
				font-weight: 100;
			}

			b {
				font-size: 2rem;
				display: inline-block;
			}
		}

		.left {
			text-align: right;

			li {
				color: orangered;
			}

			b {
				color: white;
			}
		}
		.right {
			text-wrap: balance;
			text-align: left;

			li {
				color: white;
			}

			b {
				&,
				a {
					color: orangered;
				}
			}
		}
	}

	@media screen and (max-width: 950px) {
		.call-to-action {
			grid-template-columns: 1fr;
			gap: 1rem;

			.left,
			.right {
				text-align: left;
				font-size: 1rem;
				b {
					font-size: 1rem;
				}
			}

			.right {
				text-wrap: unset;
			}
		}
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
