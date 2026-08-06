<script setup lang="ts">
import { useElementSize, useShare } from "@vueuse/core";
import { isClient } from "@vueuse/shared";
import { ref, watchEffect } from "vue";
import { useToast } from "@/utils/app/toast";

const { isLessWide = false, routes } = defineProps<{ routes: links; isLessWide?: boolean }>();

const { addToast } = useToast()
type links = {
	path: string;
	text: string;
	isCurrent: boolean;
}[];

const options = ref({
	title: "Bestiary Builder",
	text: "Check my creation out on Bestiary Builder!",
	url: isClient ? location.href : ""
});

const { share, isSupported } = useShare(options);

async function startShare() {
	if (isSupported && isSupported.value)
		return share().catch(err => err);
	// webshare API is not supported
	await navigator.clipboard.writeText(options.value.url);
	addToast("Copied link to clipboard!");
}

const breadcrumbs = ref(null);
const { height } = useElementSize(breadcrumbs);
watchEffect(() => {
	document.body.style.setProperty("--breadcrumbs-height", `${height.value}px`);
});
</script>

<template>
	<nav id="breadcrumb" ref="breadcrumbs" class="breadcrumbs__container" :class="{ 'less-wide': isLessWide }"
		aria-label="Header">
		<ol class="breadcrumbs__links" aria-label="Breadcrumbs">
			<li v-for="(route, index) in routes" :key="index">
				<RouterLink v-if="!route.isCurrent" :to="route.path">
					{{ route.text }}
				</RouterLink>
				<h1 v-else class="current-page" aria-current="page">
					{{ route.text }}
				</h1>
				<span v-if="index + 1 !== routes.length" class="seperator"> ></span>
			</li>
		</ol>

		<div class="right-buttons">
			<slot />
			<v-icon-btn text="Share this page" @click="startShare" icon="mdi:share" size="24" />
		</div>
	</nav>
</template>

<style lang="less">
.breadcrumbs__container {
	background-color: var(--color-surface-0);
	padding: 0.7rem 5vw;
	box-shadow:
		rgba(0, 0, 0, 0.19) 0px 10px 20px,
		rgba(0, 0, 0, 0.23) 0px 6px 6px;
	position: static;
	width: 100%;
	// top: 0;
	display: flex;
	justify-content: space-between;
	margin-top: var(--navbar-height);
	flex-wrap: wrap;
	z-index: 100;

	.right-buttons {
		display: flex;
		gap: 1rem;

		& button {
			margin: auto 0;

			svg {
				scale: 0.9
			}

			&.inverted {
				background-color: orangered;
				color: var(--color-surface-0);

				&:hover {
					background-color: var(--color-surface-0);
					color: orangered;
				}
			}
		}
	}
}

@media screen and (max-width: 1080px) {
	.breadcrumbs__container {
		padding: 0.7rem 0vw;
	}
}

@media screen and (min-width: 1080px) {
	.breadcrumbs__container.less-wide {
		padding: 0.7rem 10vw;
	}
}

.breadcrumbs__links {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 0.7rem;
	font-size: 1.2rem;
	margin: 0;
	padding-left: 0;
	list-style: none;

	.current-page {
		font-weight: bold;
		font-size: 1.2rem;
		max-width: 60vw;
		text-wrap: nowrap;
		overflow: hidden;
	}
}

@media (max-width: 842px) {
	.breadcrumbs__container {
		padding: 0.5rem;
	}

	.breadcrumbs__links {
		font-size: 0.8rem;
		display: flex;
		align-items: center;

		.current-page {
			font-size: 0.8rem;
		}
	}
}
</style>
