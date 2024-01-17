<template>
	<nav class="breadcrumbs__container" :class="{'less-wide': isLessWide}" aria-label="Header" id="breadcrumb">
		<ol class="breadcrumbs__links" aria-label="Breadcrumbs">
			<li v-for="(route, index) in routes" :key="index">
				<RouterLink v-if="!route.isCurrent" :to="route.path"> {{ route.text }} </RouterLink>
				<h1 v-else class="current-page" aria-current="page">{{ route.text }}</h1>
				<span v-if="index + 1 != routes.length" class="seperator"> ></span>
			</li>
		</ol>

		<div class="right-buttons">
			<slot></slot>
			<button @click="startShare" v-tooltip="'Share this page!'" aria-label="Share this page">
				<font-awesome-icon :icon="['fas', 'share-nodes']" />
			</button>
		</div>
	</nav>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ref} from "vue";
import {isClient} from "@vueuse/shared";
import {useShare} from "@vueuse/core";
import {toast} from "@/main";

type links = {
	path: string;
	text: string;
	isCurrent: boolean;
}[];
export default defineComponent({
	setup() {
		const options = ref({
			title: "Bestiary Builder",
			text: "Check my creation out on Bestiary Builder!",
			url: isClient ? location.href : ""
		});

		const {share, isSupported} = useShare(options);

		async function startShare() {
			if (isSupported && isSupported.value) return share().catch((err) => err);
			// webshare API is not supported
			navigator.clipboard.writeText(options.value.url);
			toast.success("Copied link to clipboard!");
		}

		return {
			isSupported,
			startShare
		};
	},
	props: {
		routes: {
			type: Array as () => links,
			required: true
		},
		isLessWide: {
			type: Boolean,
			default: false,
			required: false
		}
	},
	mounted() {
		document.body.style.setProperty('--navbar-height', document.getElementById('navbar')!.offsetHeight.toString() + "px") 
		// document.getElementById("breadcrumb")!.style.marginTop = "1000"
	}
});
</script>

<style lang="less">
.breadcrumbs__container {
	background-color: var(--color-surface-0);
	padding: 0.7rem 9.5vw;
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
	position: fixed;
	top: 0;
	width: 100%;
	display: flex;
	justify-content: space-between;
	margin-top: var(--navbar-height);
	flex-wrap: wrap;
	z-index: 100;
	.right-buttons {
		display: flex;
		gap: 1rem;

		& button {
			padding: 0;
			border: unset;
			background: unset;
			position: relative;
			cursor: pointer;
			background: transparent;
			border-radius: 50%;
			padding: 0.3rem;
			height: 1.8rem;
			width: 1.8rem;
			aspect-ratio: 1;
			color: orangered;
			transition: all ease 0.3s;

			svg {
				scale: 1.1;
				translate: 0 -2px;
			}
			&:hover {
				background-color: orangered;
				color: var(--color-surface-0);
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
		padding: 1rem 2vw;
	}
}

@media screen and (min-width: 1080px) {
	&.breadcrumbs__container.less-wide {
		padding: 0.7rem 25vw;
	}
}

.breadcrumbs__links {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 0.7rem;
	font-size: 1.3rem;
	margin: 0;
 	padding-left: 0;
  	list-style: none;
	& .current-page {
		font-weight: bold;
		font-size: 1.3rem;
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
		& .current-page {
			font-size: 0.8rem;
		}
	}
}
</style>
