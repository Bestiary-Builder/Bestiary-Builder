<script setup lang="ts">
import { RouterView } from "vue-router";
import ToastHost from "./components/Page/ToastHost.vue";
import { ref } from "vue";
import { store } from "./utils/store";
import { sendToLogin } from "./utils/utils";
import { useLocalStorage } from "@vueuse/core";
import { onMounted } from "vue";

const links = [
    'Home',
    'Patreon',
    'Discord',
    'Terms of Service',
    'Privacy Policy',
]

const drawer = ref(true)
const openGroups = ref(['bestiaries', 'automations'])
onMounted(() => {
    openGroups.value = ['bestiaries', 'automations']
})
const dismissed = useLocalStorage('update3.0.0dismissed', false)

const dismiss = () => {
    dismissed.value = true
}
</script>

<template>
    <v-app>
        <v-app-bar scroll-behavior="elevate" class="border" app elevation="3">
            <template v-slot:prepend>
                <v-app-bar-nav-icon>
                </v-app-bar-nav-icon>
                <v-app-bar-title text="Bestiary Builder"
                    style="font-family: 'Space Mono'; letter-spacing: -0.05rem; font-weight: bold;">

                </v-app-bar-title>

            </template>
        </v-app-bar>

        <v-navigation-drawer app v-model="drawer">
            <v-list nav v-model:opened="openGroups" open-strategy="multiple">
                <v-list-group value="bestiaries">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props" prepend-icon="mdi:book-open-page-variant" title="Bestiaries" />
                    </template>

                    <v-list-item title="My Bestiaries" value="personalBestiaries" to="/bestiaries/personal" link />
                    <v-list-item title="Explore" value="publicBestiaries" to="/bestiaries/public" link />
                    <v-list-item title="Bookmarked" value="savedBestiaries" to="/bestiaries/public/saved" link />
                </v-list-group>
                <v-divider />
                <v-list-group value="automations">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props" prepend-icon="material-symbols:automation" title="Automations" />
                    </template>

                    <v-list-item title="My Automations" value="personalAutomations" to="/automations/personal" link />
                    <v-list-item title="Explore" value="publicAutomations" to="/automations/public" link />
                    <v-list-item title="Subscribed" value="savedAutomations" to="/automations/public/saved" link />
                </v-list-group>
                <v-divider />

                <v-list-item title="Characters" value="characters" to="/characters" prepend-icon="mdi:account-group" />
                <v-divider />
            </v-list>
            <template v-slot:append>
                <v-list nav>
                    <v-divider></v-divider>
                    <v-list-item title="Discord" value="help" to="/" prepend-icon="mdi:discord" />
                    <v-list-item title="Patreon" value="help" to="/help" prepend-icon="mdi:patreon" />
                    <v-list-item title="Help" value="help" to="/help" prepend-icon="mdi:frequently-asked-questions" />
                    <v-list-item title="Changelog" value="changelog" to="/changelog" prepend-icon="mdi:history" />
                    <v-divider />
                    <v-list-item prepend-icon="mdi:cog" v-if="store.user" to="/user" :title="store.user.username">
                        <template #prepend>
                            <v-avatar alt="avatar"
                                :image="store.user.avatar ? `https://cdn.discordapp.com/avatars/${store.user.id}/${store.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'"
                                size="30" class="mr-2" />
                        </template>
                    </v-list-item>
                    <v-list-item v-else prepend-icon="mdi:login" @click="sendToLogin($route.path)">
                        Login
                    </v-list-item>

                </v-list>
            </template>
        </v-navigation-drawer>
        <v-main>
            <v-alert class="ma-2" closable title="Update 3.0.0 Released" @click:close="dismiss" v-if="!dismissed">
                Welcome
                to
                Bestiary Builder 3.0.0! See all the changes in the <RouterLink to="/changelog">
                    Changelog </RouterLink>
            </v-alert>
            <RouterView />
        </v-main>
        <v-footer class="d-flex align-center justify-center ga-2 flex-wrap flex-grow-1 py-3" color="surface-light-1">
            <v-btn v-for="link in links" :key="link" :text="link" variant="text" rounded></v-btn>

            <div class="flex-1-0-100 text-center mt-2">
                {{ new Date().getFullYear() }} — <strong>Bestiary Builder</strong>
            </div>
        </v-footer>
        <ToastHost />
    </v-app>
</template>


<style></style>