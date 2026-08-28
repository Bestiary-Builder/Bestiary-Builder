<script setup lang="ts">
import { useElementSize, useShare } from "@vueuse/core";
import { isClient } from "@vueuse/shared";
import { computed, ref, watchEffect } from "vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";

const { routes } = defineProps<{ routes: links }>();

const { addToast } = useToast();

type links = {
	path: string;
	text: string;
	isCurrent: boolean;
}[];

const breadcrumbItems = computed(() =>
	routes.map(route => ({
		title: route.text,
		to: route.path,
		disabled: route.isCurrent,
	}))
);

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
	<Teleport to="#navbar .v-toolbar__prepend">
		<v-breadcrumbs :items="store.isMobile ? breadcrumbItems.slice(-2) : breadcrumbItems"
			:divider="store.isMobile ? '/' : '>'" class="left-buttons">
			<template #item="{ item }">
				<v-breadcrumbs-item :disabled="item.disabled" :style="`opacity: ${item.disabled ? 1 : ''}`"
					density="compact">
					<RouterLink v-if="!item.disabled" :to="item.to || '/'" class="crumb-link">
						{{ item.title }}
					</RouterLink>
					<h1 v-else class="crumb-current" aria-current="page">
						{{ item.title }}
					</h1>
				</v-breadcrumbs-item>
			</template>
		</v-breadcrumbs>
	</Teleport>

	<Teleport to="#navbar .v-toolbar__append">
		<div class="right-buttons">
			<slot />
			<v-icon-btn text="Share this page" icon="mdi:share" size="24" @click="startShare" />
		</div>
	</Teleport>
</template>

<style lang="less" scoped>
.left-buttons {
	margin-left: 2rem;
}

.right-buttons {
	margin-right: 5.5rem;
	display: flex;
	gap: 1.5rem;

	& button {
		margin: auto 0;

		svg {
			scale: 0.9;
		}
	}

	& button.inverted {
		background-color: rgb(var(--v-theme-primary));
		color: var(--bg-surface);

		&:hover {
			background-color: var(--bg-surface);
			color: rgb(var(--v-theme-primary));
		}
	}
}

.crumb-link {
	color: rgb(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
	text-decoration: none;
	font-size: 0.875rem;
	font-weight: 400;
	transition: color 0.15s ease;
}

.crumb-link:hover {
	color: rgb(var(--v-theme-on-surface));
	text-decoration: underline;
}

.crumb-current {
	margin: 0;
	font-size: 0.875rem;
	font-weight: bold;
	line-height: inherit;
	opacity: 1 !important;
}

@media (width <=842px) {
	.v-breadcrumbs {
		padding: 0 6px;
		margin: 0;
	}

	.crumb-link,
	.crumb-current {
		font-size: 0.7rem;
		line-height: 0.7rem;
	}

	.left-buttons {
		margin-left: 0;
	}

	.right-buttons {
		margin-right: 5px;
		gap: 0.5rem;
		scale: 0.8;
	}
}
</style>
