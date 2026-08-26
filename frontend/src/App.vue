<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { RouterView } from "vue-router";
import ToastHost from "./components/Page/ToastHost.vue";
import { useRecentPages } from "./utils/app/useRecentPages.js";
import { store } from "./utils/store.js";
import { sendToLogin } from "./utils/utils.js";

const { recentPages } = useRecentPages();

const openGroups = ref(["bestiaries", "automations", "recentlyViewed"]);

const dismissed = useLocalStorage("update3.0.0dismissed", false);

const dismiss = () => {
	dismissed.value = true;
};

const drawer = ref<boolean | null>(null);
const toggleDrawer = () => {
	if (drawer.value === null) {
		drawer.value = true;
	}
	else {
		drawer.value = !drawer.value;
	}
};

const defaults = computed(() => ({
	VRow: {
		size: store.isMobile ? 4 : undefined,
	},
}));
</script>

<template>
	<v-app>
		<v-navigation-drawer v-model="drawer" app>
			<v-list v-model:opened="openGroups" nav open-strategy="multiple" class="pt-0" density="compact">
				<v-list-item height="64" class="px-2">
					<template #prepend>
						<v-icon icon="$bestiaryBuilder" style="opacity: 1; scale: 1.4" />
					</template>
					<RouterLink to="/" class="d-flex align-center flex-grow-1 text-decoration-none text-high-emphasis">
						<v-list-item-title color="primary" class="text-high-emphasis font-weight-bold"
							style="font-size: larger;">
							Bestiary
							Builder
						</v-list-item-title>
						<v-spacer />
					</RouterLink>
				</v-list-item>
				<v-divider class="mx-n4" />

				<v-list-group value="bestiaries">
					<template #activator="{ props }">
						<v-list-item v-bind="props" prepend-icon="mdi:book-open-page-variant" title="Bestiaries" />
					</template>

					<v-list-item title="My Bestiaries" value="personalBestiaries" to="/bestiaries/personal" link />
					<v-list-item title="Explore" value="publicBestiaries" to="/bestiaries/public" link />
					<!-- <v-list-item title="Bookmarked" value="savedBestiaries" to="/bestiaries/public/saved" link /> -->
				</v-list-group>
				<v-divider />
				<v-list-group value="automations">
					<template #activator="{ props }">
						<v-list-item v-bind="props" prepend-icon="material-symbols:automation" title="Automations" />
					</template>

					<v-list-item title="My Automations" value="personalAutomations" to="/armory/personal" link />
					<v-list-item title="Explore" value="publicAutomations" to="/armory/public" link />
					<!-- <v-list-item title="Subscribed" value="savedAutomations" to="/automations/public/saved" link /> -->
				</v-list-group>
				<v-divider />

				<v-list-item title="Characters" value="characters" to="/characters" prepend-icon="mdi:account-group" />
				<v-divider />

				<v-list-group v-if="recentPages.length" value="recentlyViewed">
					<template #activator="{ props }">
						<v-list-item v-bind="props" prepend-icon="mdi:history" title="Recently Viewed" />
					</template>
					<v-list density="compact" class="recent-pages-list">
						<v-list-item v-for="page in recentPages" :key="page.path" :title="page.label"
							:prepend-icon="page.icon" :to="page.path" density="compact" size="small"
							class="text-caption" />
					</v-list>
				</v-list-group>
			</v-list>
			<template #append>
				<v-list nav density="compact">
					<v-divider />
					<v-list-item title="Help" value="help" to="/help" prepend-icon="mdi:frequently-asked-questions" />
					<v-list-item title="Changelog" value="changelog" to="/changelog" prepend-icon="mdi:history" />
					<v-list-item title="Discord" value="discord" href="https://discord.gg/a6bwXCSymN" target="_blank"
						rel="noopener noreferrer" prepend-icon="mdi:discord" link append-icon="mdi:open-in-new" />
					<v-list-item title="Patreon" value="patreon" href="https://patreon.com/BestiaryBuilder"
						target="_blank" rel="noopener noreferrer" prepend-icon="mdi:patreon" link
						append-icon="mdi:open-in-new" />

					<v-divider />
					<v-list-item v-if="store.user" append-icon="mdi:cog" to="/user" :title="store.user.username">
						<template #prepend>
							<v-avatar alt="avatar"
								:image="store.user.avatar ? `https://cdn.discordapp.com/avatars/${store.user.id}/${store.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'"
								size="30" class="mr-3" />
						</template>
					</v-list-item>
					<v-list-item v-else prepend-icon="mdi:login" @click="sendToLogin($route.path)">
						Login
					</v-list-item>
				</v-list>
			</template>
		</v-navigation-drawer>
		<v-app-bar id="navbar" scroll-behavior="elevate" class="border-b" app elevation="3" height="64">
			<template #prepend>
				<v-app-bar-nav-icon v-model="drawer" @click="toggleDrawer" />
			</template>
			<div id="app-bar-actions" class="d-flex align-center" />
			<template #append />
		</v-app-bar>
		<v-main>
			<v-alert v-if="!dismissed" class="ma-4" closable title="Update 3.0.0 Released" color="primary"
				@click:close="dismiss">
				Welcome
				to
				Bestiary Builder 3.0.0! See all the changes in the <RouterLink to="/changelog">
					Changelog
				</RouterLink>
			</v-alert>
			<VDefaultsProvider :defaults="defaults">
				<RouterView v-slot="{ Component, route }">
					<component :is="Component" :key="route.params.id" />
				</RouterView>
			</VDefaultsProvider>
		</v-main>
		<v-footer class="d-flex align-center justify-center ga-2 flex-wrap flex-grow-1 py-3" color="surface-light-1">
			<v-btn to="/" text="Home" variant="plain" />
			<v-btn text="Discord" variant="plain" href="https://discord.gg/a6bwXCSymN" target="_blank" />
			<v-btn text="Patreon" variant="plain" href="https://patreon.com/BestiaryBuilder" target="_blank" />
			<v-btn to="/privacy-policy" text="Privacy Policy" variant="plain" />
			<v-btn to="/terms-and-conditions" text="Terms and Conditions" variant="plain" />

			<div class="flex-1-0-100 text-center mt-2">
				{{ new Date().getFullYear() }} — <strong>Bestiary Builder</strong>
			</div>
		</v-footer>
		<ToastHost />
	</v-app>
</template>

<style scoped>
a {
	color: color-mix(in srgb, currentcolor 75%, black 25%);
}

.recent-pages-list :deep(.v-list-item-title) {
	font-size: 0.75rem !important;
}

.recent-pages-list :deep(.v-icon) {
	font-size: 16px !important;
}

.recent-pages-list :deep(.v-list-item) {
	min-height: 32px;
}
</style>
