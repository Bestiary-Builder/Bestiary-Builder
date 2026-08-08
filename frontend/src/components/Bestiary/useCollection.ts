// types/collection.ts
import type { Automation, AutomationCollectionResponse, AutomationWithType, BestiaryResponse, BestiaryStatus, CreatureWithStats, Statblock, User } from "~/shared";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getUmami } from "@/utils/app/analytics";
import { useToast } from "@/utils/app/toast";
import { useRecentPages } from "@/utils/app/useRecentPages";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

type CollectionType = "bestiary" | "automations";

type CollectionBase = BestiaryResponse | AutomationCollectionResponse

interface ItemBase {
    id: string;
}

interface CollectionTypeMap {
    bestiary: {
        collection: BestiaryResponse;
        item: CreatureWithStats;
        itemRaw: CreatureWithStats["stats"];
    };
    automations: {
        collection: AutomationCollectionResponse;
        item: AutomationWithType;
        itemRaw: Automation["automation"];
    };
}

interface CollectionConfig {
    apiRoute: string; // /api/{apiRoute}
    itemRoute: string; // /api/{itemRoute}/add, /delete, etc
    itemsKey: string; // /api/{apiRoute}/{id}/{itemsKey}
    itemRawKey: string;
    addManyRoute: string; // bulk-import endpoint segment
    parentIdField: string; // field on item pointing back to collection
    labels: {
        itemName: string;
        itemNamePlural: string;
        collectionName: string;
    };
}

const collectionConfigs: Record<CollectionType, CollectionConfig> = {
    bestiary: {
        apiRoute: "bestiary",
        itemRoute: "creature",
        itemsKey: "creatures",
        itemRawKey: "stats",
        addManyRoute: "addcreatures",
        parentIdField: "bestiaryId",
        labels: { itemName: "creature", itemNamePlural: "creatures", collectionName: "bestiary" },
    },
    automations: {
        apiRoute: "automation-collection",
        itemRoute: "automation",
        itemsKey: "automations",
        itemRawKey: "automation",
        addManyRoute: "addautomations",
        parentIdField: "collectionId",
        labels: { itemName: "automation", itemNamePlural: "automations", collectionName: "automation collection" },
    },
};


// composables/useCollection.ts
export const useCollection = <T extends CollectionType>(type: T) => {
    type Collection = CollectionTypeMap[T]["collection"] & CollectionBase;
    type Item = CollectionTypeMap[T]["item"] & ItemBase;
    type ItemRaw = CollectionTypeMap[T]["itemRaw"]

    const config = collectionConfigs[type];

    const $route = useRoute();
    const $router = useRouter();
    const { addToast, updateToast } = useToast()
    const { updateLabel } = useRecentPages()

    const collection = ref<CollectionBase | null>(null);
    const items = ref<Item[] | null>(null);
    const editors = ref<User[]>([]);
    const isOwner = ref(false);
    const isEditor = ref(false);
    const bookmarked = ref(false);
    const initialLoading = ref(true);
    const notices = ref<Record<string, string>>({});

    const getCollection = async () => {
        const id = $route.params.id;
        const { success, data, error } = await useFetch<Collection>(`/api/${config.apiRoute}/${id.toString()}`);
        if (!success) {
            collection.value = null;
            addToast(error, { color: "error" });
            return;
        }

        collection.value = data;
        isOwner.value = collection.value.permissionLevel === "owner";
        isEditor.value = collection.value.permissionLevel === "editor";

        updateLabel($route.path, collection.value.name);

        if (!isOwner.value && !isEditor.value)
            await $router.push(`/${config.apiRoute}/view/${collection.value.id}`);

        initialLoading.value = false;

        // Fetch items
        await useFetch<Item[]>(`/api/${config.apiRoute}/${collection.value.id.toString()}/${config.itemsKey}`).then(async (itemResult) => {
            if (itemResult.success)
                items.value = itemResult.data;
            else {
                items.value = null;
                addToast(itemResult.error, { color: "error" });
            }
        });

        // Fetch editors
        editors.value = [] as User[];
        for (const { userId: editorId } of collection.value.editors ?? []) {
            await useFetch(`/api/user/${editorId}`).then((editorResult) => {
                if (editorResult.success)
                    editors.value.push(editorResult.data as User);
                else
                    addToast(editorResult.error, { color: "error" });
            });
        }

        // Bookmark state
        if (store.user) {
            await useFetch<{ state: boolean }>(`/api/${config.apiRoute}/${collection.value.id.toString()}/bookmark/get`).then(async (bookmarkResult) => {
                if (bookmarkResult.success)
                    bookmarked.value = bookmarkResult.data.state;
                else {
                    bookmarked.value = false;
                    addToast(bookmarkResult.error, { color: "error" });
                }
            });
        }
        else {
            bookmarked.value = false;
        }
    };

    const updateCollection = async () => {
        if (!collection.value)
            return;
        const toastId = addToast("Saving...", { loading: true });
        const { permissionLevel: _, ...collectionData } = collection.value;
        const { success, error } = await useFetch<Collection>(`/api/${config.apiRoute}/${collection.value.id.toString()}/update`, "POST", collectionData);
        if (success) {
            updateToast(toastId, { text: "Saved", color: "success" });
        }
        else {
            updateToast(toastId, { text: error, color: "error" });
            if (error.includes("includes blocked words or phrases"))
                void getUmami()?.track("Blocked words", { error });
        }
    };

    const toggleBookmark = async () => {
        if (!collection.value)
            return;
        const { success, data, error } = await useFetch<{ state: boolean }>(`/api/${config.apiRoute}/${collection.value.id.toString()}/bookmark/toggle`);
        if (success) {
            bookmarked.value = data.state;
            addToast(
                bookmarked.value
                    ? `Successfully bookmarked this ${config.labels.collectionName}!`
                    : `Successfully unbookmarked this ${config.labels.collectionName}!`,
            );
            void getUmami()?.track(`${bookmarked.value ? "Bookmark" : "Unbookmark"} ${config.labels.collectionName}`);
        }
        else {
            bookmarked.value = false;
            addToast(error, { color: "error" });
        }
    };

    const addEditor = async (userId: string) => {
        if (!collection.value)
            return;
        const { success, error } = await useFetch(`/api/${config.apiRoute}/${collection.value.id.toString()}/editors/add/${userId}`);
        if (success) {
            addToast("Added editor succesfully", { color: "success" });
            void getUmami()?.track(`Add ${config.labels.collectionName} editor`);
        }
        else {
            addToast(error, { color: "error" });
        }
        await getCollection();
    };

    const removeEditor = async (userId: string) => {
        if (!collection.value)
            return;
        const { success, error } = await useFetch(`/api/${config.apiRoute}/${collection.value.id.toString()}/editors/remove/${userId}`);
        if (success) {
            addToast("Removed editor succesfully", { color: "success" });
            void getUmami()?.track(`Remove ${config.labels.collectionName} editor`);
        }
        else {
            addToast(error, { color: "error" });
        }
        await getCollection();
    };

    const createItem = async (data: ItemRaw, openPage = true) => {
        const payload = {
            [config.itemRawKey]: data,
            [config.parentIdField]: collection.value?.id,
        };

        const { success, data: resultData, error } = await useFetch<Item>(`/api/${config.itemRoute}/add`, "POST", payload);
        if (success) {
            void getUmami()?.track(`Create ${config.labels.itemName}`);
            if (openPage)
                await $router.push(`/${config.itemRoute}/edit/${resultData.id.toString()}`);
            else
                await getCollection();
            return resultData;
        }
        else {
            addToast(error, { color: "error" });
        }
    };

    const createManyItems = async (payload: ItemRaw[]) => {
        if (!collection.value)
            return;

        const toastId = addToast(`Importing ${config.labels.itemNamePlural} has started. This may take a while.`);
        const { success, data, error } = await useFetch<{ error?: string; ignoredItems: { item: string; error: string }[] }>(
            `/api/${config.apiRoute}/${collection.value.id.toString()}/${config.addManyRoute}`,
            "POST",
            payload,
        );

        if (!success) {
            notices.value = {};
            updateToast(toastId, { text: error, color: "error" });
        }
        else if (data.error) {
            updateToast(toastId, { text: "The import was completed with errors.", color: "error" });
            notices.value.Errors = data.error;
            for (const ignored of data.ignoredItems)
                notices.value[ignored.item] = ignored.error;
        }
        else {
            updateToast(toastId, { text: "Importing has finished!", color: "success" });
            void getUmami()?.track(`Imported ${config.labels.itemNamePlural}`, { count: payload.length });
        }

        await getCollection();
    };

    const deleteItem = async (id: string) => {
        const { success, error } = await useFetch(`/api/${config.itemRoute}/${id.toString()}/delete`);
        if (success) {
            addToast(`Deleted ${config.labels.itemName} succesfully`, { color: "success" });
            void getUmami()?.track(`Delete ${config.labels.itemName}`);
            if (!collection.value)
                return;
            items.value = items.value?.filter(item => item.id !== id) ?? [];
        }
        else {
            addToast(error, { color: "error" });
        }
    };

    return {
        collection,
        items,
        editors,
        isOwner,
        isEditor,
        bookmarked,
        notices,
        getCollection,
        updateCollection,
        toggleBookmark,
        addEditor,
        removeEditor,
        createItem,
        createManyItems,
        deleteItem,
    };
};
