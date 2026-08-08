<script setup lang="ts">
import type { AutomationCollectionExtended, AutomationCollectionWithCount } from "~/shared";
import { onMounted, ref, watch } from "vue";
import Draggable from "vuedraggable";
import CollectionTile from "@/components/Global/CollectionTile.vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { refDebounced } from "@vueuse/core";
import { getUmami } from "@/utils/app/analytics";


onMounted(async () => {
    const toastId = addToast("Loading...", { loading: true })
    await searchCollections();
    removeToast(toastId)
});

const { addToast, removeToast } = useToast()
const collections = ref<AutomationCollectionExtended[]>([]);

const selectedPage = ref(1);
const selectedTags = ref<string[]>([]);
const viewMode = ref("Popular");
const search = ref("");
const debouncedSearch = refDebounced(search, 600);
const totalPages = ref(1);

const searchCollections = async () => {
    const searchData = {
        search: search.value,
        page: selectedPage.value - 1,
        tags: selectedTags.value,
        mode: viewMode.value.toLowerCase()
    };
    // Request bestiary info
    const { success, data, error } = await useFetch<{ results: AutomationCollectionWithCount[]; pageAmount: number }>(`/api/search`, "POST", searchData);
    if (success) {
        collections.value = data.results.map(collection => ({ ...collection, automations: Array(collection.automationCount), editors: [] }));
        totalPages.value = data.pageAmount;
        void getUmami()?.track("Search bestiary", searchData);
    }
    else {
        collections.value = [];
        totalPages.value = 1;
        addToast(error, { color: "error" });
    }
};

const getBookmarked = async () => {
    // Request bestiary info
    const { success, data, error } = await useFetch<AutomationCollectionExtended[]>(`/api/user/bookmarks`);
    if (success) {
        collections.value = data;
        void getUmami()?.track("View bookmarked bestiaries");
    }
    else {
        collections.value = [];
        addToast(error, { color: "error" });
    }
};

watch(selectedPage, async () => searchCollections());
watch(selectedTags, async () => searchCollections());
watch(viewMode, async (newValue) => {
    if (newValue !== "Bookmarked") {
        const toastId = addToast("Loading...", { loading: true })
        await searchCollections();
        removeToast(toastId)
    }
    else {
        const toastId = addToast("Loading...", { loading: true })
        await getBookmarked();
        removeToast(toastId)
    }
});
watch(debouncedSearch, async () => searchCollections());
</script>

<template>
    <Breadcrumbs :routes="[
        {
            path: '',
            text: 'Public Automation Collections',
            isCurrent: true
        }
    ]">
        <select v-model="viewMode" aria-label="Select public collections list mode"
            name="Select public collections list mode">
            <option>Recent</option>
            <option>Popular</option>
            <option>Bookmarked</option>
        </select>

        <DropdownMenu>
            <template #activator="{ props }">
                <v-icon-btn icon="mdi:magnify" v-bind="props" text="Search collections" size="24"
                    v-tooltip="'Search collections'" />
            </template>
            <v-card min-width="300" class="text-center pb-2" title="Search collections">
                <v-spacer />
                <v-card-text>
                    <v-text-field label="Search text" v-model="search" />
                    <v-select v-model="selectedTags" label="Select Tags" multiple :items="store.tags || []" chips
                        closable-chips />
                </v-card-text>
            </v-card>
        </DropdownMenu>

    </Breadcrumbs>
    <div class="content">
        <div v-if="collections.length > 0" class="tile-container">
            <RouterLink v-for="coll, idx of collections" :key="idx" :to="`/armory/view/${coll.id}`">
                <CollectionTile :data="coll" />
            </RouterLink>
        </div>
        <div v-else class="zero-found text-center">
            <span v-if="viewMode !== 'Bookmarked'"> No collections found. </span>
            <span v-else>You do not have any bookmarked collections. View an Automation Collection and click on the ⭐
                icon
                to bookmark
                it.</span>
        </div>
    </div>
</template>
