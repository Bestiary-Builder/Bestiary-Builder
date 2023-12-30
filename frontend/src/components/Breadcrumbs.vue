<template>
	<section class="breadcrumbs__container" :class="{'less-wide': isLessWide}">
		<div class="breadcrumbs__links">
			<template v-for="(route, index) in routes" :key="index">
				<RouterLink v-if="!route.isCurrent" :to="route.path"> {{ route.text }} </RouterLink>
				<h1 v-else class="current-page">{{ route.text }}</h1>
				<span v-if="index + 1 != routes.length" class="seperator">></span>
			</template>
		</div>

		<div class="right-buttons">
			<slot name="right-button"></slot>
			<button @click="startShare" v-tooltip="'Share this page!'" aria-label="Share this page">
				<font-awesome-icon :icon="['fas', 'share-nodes']" />
			</button>
		</div>
	</section>
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
			required: false
		}
	}
});
</script>

<style lang="less">
.breadcrumbs__container {
	background-color: var(--color-surface-0);
	padding: 0.7rem 5vw;
	box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;

	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	.right-buttons {
		display: flex;
		gap: 1rem;

		& button {
			padding: 0;
			border: unset;
			background: unset;

			cursor: pointer;
			background: transparent;
			border-radius: 50%;
			padding: 0.3rem;
			height: 1.8rem;
			width: 1.8rem;
			color: orangered;
			transition: all ease 0.3s;

			svg {
				scale: 1.1;
			}
			&:hover {
				background-color: orangered;
				color: var(--color-surface-0);
			}
		}

		& select {
			border: 2px solid orangered;
			background: transparent;
			color: orangered;
			border-radius: 0.2rem;
			padding: 0 0.2rem;
			outline: none;

			& option {
				background-color: var(--color-surface-0);
				color: orangered;
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

	& .current-page {
		font-weight: bold;
		font-size: 1.3rem;
	}
}
</style>
