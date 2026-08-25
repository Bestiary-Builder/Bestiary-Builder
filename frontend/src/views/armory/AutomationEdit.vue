<script setup lang="ts">
import type { AttackModel, AutomationCollectionExtended, AutomationWithType, FeatureEntity, Features } from "~/shared";
import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, onMounted, onUnmounted, provide, ref, useTemplateRef, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import EditAutomation from "@/components/Automations/EditAutomation.vue";
import ImportAutomationUtil from "@/components/Automations/ImportAutomationUtil.vue";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useToast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";
import { parseDescIntoAutomation } from "~/shared";
import { useHotkey } from "vuetify";
import { useRecentPages } from "@/utils/app/useRecentPages";
import ImportToCharacter from "@/components/Characters/ImportToCharacter.vue";

const $router = useRouter();
const $route = useRoute();
const type = $route.params.type as keyof Features;
const aid = $route.params.aid as any;
const data = ref<AutomationWithType>();
const collection = ref<AutomationCollectionExtended | null>(null);

const { addToast, updateToast, removeToast } = useToast();
const { updateLabel } = useRecentPages();
const EditAutomationRef = useTemplateRef("EditAutomationRef");

// load creature data
onMounted(async () => {
    const toastId = addToast("Loading...", { loading: true });
    const { success, data: aData, error } = await useFetch<AutomationWithType>(`/api/automation/${$route.params.id.toString()}`);
    if (success) {
        data.value = aData;
        await nextTick(() => madeChanges.value = false);
        await getCollection();
        updateLabel($route.path, data.value.name);
        removeToast(toastId);
    }
    else {
        addToast(error, { color: "error" });
        madeChanges.value = false;
        await $router.push("/error");
        removeToast(toastId);
    }
});

const madeChanges = ref(false);

// ownership
const isOwner = ref(false);
const isEditor = ref(false);
const getCollection = async () => {
    const { success, data: cData, error } = await useFetch<AutomationCollectionExtended>(`/api/automation-collection/${data.value?.collectionId}`);
    if (success) {
        collection.value = cData;
        isOwner.value = store.user?.id === collection.value.ownerId;
        isEditor.value = (collection.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");

        if (!isOwner.value && !isEditor.value)
            await $router.push(`/automation/view/${data.value?.id}`);
    }
    else {
        addToast(error, { color: "error" });
    }
};

const unwatch = watch(() => data.value, () => {
    if (collection.value == null)
        return;
    madeChanges.value = true;
    unwatch();
}, { deep: true });

onBeforeRouteUpdate(() => {
    if (isVisualEditor.value)
        return;

    if (madeChanges.value && (isOwner.value || isEditor.value)) {
        const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
        if (!answer)
            return false;
    }
});
onBeforeRouteLeave(() => {
    if (isVisualEditor.value)
        return;

    if (madeChanges.value && (isOwner.value || isEditor.value)) {
        const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
        if (!answer)
            return false;
    }
});

const beforeUnLoad = (event: Event) => {
    if (isVisualEditor.value)
        return;
    if (madeChanges.value && (isOwner.value || isEditor.value)) {
        event.preventDefault();
        event.returnValue = true;
    }
};

window.addEventListener("beforeunload", beforeUnLoad);
onUnmounted(() => {
    window.removeEventListener("beforeunload", beforeUnLoad);
});


// saving
const validateAttack = async (automation: AttackModel | AttackModel[] | null): Promise<true | string> => {
    if (automation === null)
        return true;
    const { success, error } = await useFetch("/api/validate/automation", "POST", automation);
    if (success)
        return true;
    else
        return error;
};

const isSaved = ref(false);
const isSavingCreature = ref(false);

const saveAutomation = async (shouldNotify: boolean): Promise<boolean> => {
    if (!collection.value || !data.value)
        return false;

    if (!isVisualEditor.value && EditAutomationRef.value?.yamlError) {
        const message = `Error parsing automation YAML. ${EditAutomationRef.value.yamlError}`;
        if (shouldNotify)
            addToast(message, { color: "error", timeout: -1 });
        return false;
    }

    const toastId = shouldNotify ? addToast("Validating...", { loading: true }) : undefined;
    isSavingCreature.value = true;

    try {
        const validAutomation = await validateAttack(data.value.automation);
        if (validAutomation !== true) {
            if (toastId)
                updateToast(toastId, {
                    text: validAutomation,
                    color: "error",
                    timeout: -1,
                    isHtml: true,
                });
            isSavingCreature.value = false;
            return false;
        }

        if (toastId)
            updateToast(toastId, { text: "Saving..." });

        const { success, error } = await useFetch(`/api/automation/${data.value.id}/update`, "POST", data.value);
        if (!success) {
            if (toastId) {
                updateToast(toastId, {
                    text: `Error saving automation. ${error}`,
                    color: "error",
                    timeout: -1,
                });
            }
            else {
                addToast(`Error saving automation. ${error}`, {
                    color: "error",
                    timeout: -1,
                });
            }
            isSavingCreature.value = false;
            return false;
        }

        isSaved.value = true;
        madeChanges.value = false;

        const unwatch = watch(
            () => data.value,
            () => {
                madeChanges.value = true;
                unwatch();
            },
            { deep: true },
        );

        if (toastId)
            setTimeout(() => updateToast(toastId, { text: "Saved action!", prependIcon: "mdi-check" }), 500);
        isSavingCreature.value = false;
        updateLabel($route.path, data.value.name);
        return true;
    }
    catch (err) {
        if (toastId) {
            updateToast(toastId, {
                text: err instanceof Error ? err.message : "An unexpected error occurred.",
                color: "error",
            });
        }
        isSavingCreature.value = false;
        return false;
    }
};
useHotkey("cmd+s", async () => await saveAutomation(true), { inputs: true });

type AutomationTypes = "automation" | "basic-example" | "srd-features/2014" | "srd-features/2024";
const loadFeature = async (feature: FeatureEntity, apiPath: AutomationTypes) => {
    if (!data.value)
        return;

    data.value.description = feature.description;
    data.value.name = feature.name.substring(0, store.limits?.nameLength)

    if (apiPath === "basic-example" && feature.automation) {
        let lastNode;

        if (Array.isArray(feature.automation))
            lastNode = feature.automation[0].automation[feature.automation[0].automation.length - 1];
        else
            lastNode = feature.automation.automation[feature.automation.automation.length - 1];

        if (lastNode.type === "text") {
            if (typeof (lastNode.text) === "string")
                feature.description = lastNode.text;
            else
                feature.description = "";
        }
        else {
            feature.description = "";
        }
    }

    data.value.automation = feature.automation;
    EditAutomationRef.value?.resetVisualEditorState();

    addToast(`Successfully loaded ${feature.name}!`);
    await saveAutomation(false);
};

const generateAutomation = async () => {
    if (!data.value)
        return;
    let activationType;
    const automation = data.value.automation
    if (automation === null) {
        activationType = 0
    } else if (Array.isArray(automation)) {
        activationType = automation[0].activation_type ?? 0
    } else {
        activationType = automation.activation_type ?? 0
    }
    const result = parseDescIntoAutomation(data.value.description, data.value.name, activationType)[0];
    if (result) {
        try {
            data.value.automation = result;
        }
        catch {
            addToast("Something went wrong when generation automation", { color: "error" });
        }
    }
};

// Description parity helpers
const updateFeatureDescFromAutomationDesc = () => {
    if (!data.value)
        return;
    const auto = data.value.automation as AttackModel | AttackModel[] | null | undefined;
    if (!auto || Array.isArray(auto))
        return;
    for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
        const field = auto.automation[i];
        if (field.type === "text" && data.value) {
            //@ts-ignore
            data.value.features[type][aid].description = field.text;
            return;
        }
    }
};

const updateAutomationDescFromFeatureDesc = () => {
    if (!data.value)
        return;
    const auto = data.value.automation as AttackModel | AttackModel[] | null | undefined;
    if (!auto || Array.isArray(auto))
        return;
    for (let i = (auto.automation || []).length - 1; i >= 0; i--) {
        const field = auto.automation[i];
        if (field.type === "text") {
            field.text = data.value.description ?? "";
            return;
        }
    }
};

const getAutomationDescription = (): string | boolean => {
    if (!data.value)
        return "";
    const auto = data.value?.automation as AttackModel | AttackModel[] | null | undefined;
    if (!auto || Array.isArray(auto) || !auto.automation || auto.automation.length === 0)
        return false;
    for (let i = auto.automation.length - 1; i >= 0; i--) {
        const field = auto.automation[i];
        if (field?.type === "text") {
            //@ts-ignore
            return field.text;
        }
    }
    return "";
};

const showDescriptionButtons = computed(() => {
    if (!data.value)
        return;
    const desc = data.value.description;
    const autoDesc = getAutomationDescription();
    if (Array.isArray(data.value.automation) || !desc || !autoDesc)
        return false;
    if (desc !== autoDesc)
        return true;
    return false;
});

const isVisualEditor = ref(store.user?.preferredEditor === "Visual");


const parityOptions = useLocalStorage("featureEditParityOptions", {
    updateName: true,
    updateDescription: true,
});

watch(() => data.value?.name, (newName) => {
    if (isVisualEditor.value && parityOptions.value.updateName) {
        const automation = data.value?.automation as AttackModel | AttackModel[] | null;
        if (!automation)
            return;
        if (Array.isArray(automation))
            automation[0].name = newName || "";
        else
            automation.name = newName || "";
    }
});

watch(() => data.value?.description, (newDesc) => {
    if (isVisualEditor.value && parityOptions.value.updateDescription) {
        const automation = data.value?.automation as AttackModel | AttackModel[] | null;
        if (!automation)
            return;
        let auto = automation;
        if (Array.isArray(automation))
            auto = automation[0];

        for (const field of ((auto as AttackModel)?.automation || []).reverse() || []) {
            if (field.type === "text") {
                field.text = newDesc || "";
                (auto as AttackModel).automation.reverse();
                return;
            }
        }
    }
});

const setName = (newName: string) => {
    if (!data.value)
        return;
    data.value.name = newName;
};

const setDesc = (setDesc: string) => {
    if (!data.value)
        return;
    data.value.description = setDesc;
};

provide("setActionName", setName);
provide("setActionDescription", setDesc);

const makeGvar = async () => {
    console.log("run this")
    const { success, data: aAdata, error } = await useFetch("/api/character/makeattackgvar", "POST", data.value?.automation)
    console.log(success, aAdata, error)
}
</script>

<template>
    <Breadcrumbs :routes="[
        {
            path: isOwner || isEditor ? `/armory/edit/${collection?.id}` : `/armory/view/${collection?.id}`,
            text: collection?.name || '',
            isCurrent: false
        },
        {
            path: '',
            text: data?.name,
            isCurrent: true
        }
    ]">
        <v-icon-btn v-if="madeChanges && (isOwner || isEditor)" icon="mdi:content-save" text="Save creature"
            :class="{ inverted: !isSavingCreature }" @click="saveAutomation(true)" size="24" :loading="isSavingCreature"
            v-tooltip="'Save feature (CTRL+S)'" />
        <v-icon-btn icon="fa7-solid:wand-sparkles"
            text="Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks."
            @click="generateAutomation" size="24"
            v-tooltip="'Generate automation from description. May be incomplete or inaccurate. Only works for basic, to hit attacks.'" />
        <v-icon-btn size="24" icon="mdi:code-block-braces" text="Change editor"
            @click="EditAutomationRef?.toggleEditor()" v-tooltip="'Change editor'" />
        <ImportAutomationUtil @load-feature="(feature, apiPath) => loadFeature(feature, apiPath)" />
        <ImportToCharacter :automation="data?.automation || null" />
        <v-icon-btn v-if="data && store.isMobile" icon="mdi:delete" text="Clear automation"
            @click="data.automation = null" size="24" v-tooltip="'Clear automation'" />
        <v-icon-btn v-if="data && store.isMobile" icon="mdi:content-copy" text="Copy automation"
            @click="EditAutomationRef?.copyAutomation()" size="24" v-tooltip="'Copy automation'" />
    </Breadcrumbs>
    <div v-if="data" class="content">
        <div class="pa-0">
            <v-row>
                <v-col cols="4">
                    <v-text-field v-model="data.name" type="text" label="Feature name"
                        :minlength="store.limits?.nameMin" :maxlength="store.limits?.nameLength" variant="outlined"
                        hide-details />
                    <span v-if="isVisualEditor">
                        <input v-model="parityOptions.updateName" type="checkbox" style="scale: .7; translate: 0 4px">
                        <small style="font-size: x-small;"> <i>Updates the name of the first action in the automation
                                structure to this text while enabled.</i> </small>
                    </span>

                    <div v-if="!isVisualEditor && showDescriptionButtons" class="mt-4">
                        <b class="mt-4"> Descriptions: </b>
                        <span style="color: rgb(var(--v-theme-error))"> Don't match. </span>
                        <p style="text-decoration: underline; font-size: smaller; cursor: pointer;"
                            @click="updateAutomationDescFromFeatureDesc">
                            Update from feature
                        </p>
                        <p style="text-decoration: underline; font-size: smaller; cursor: pointer"
                            @click="updateFeatureDescFromAutomationDesc">
                            Update from automation
                        </p>
                    </div>
                </v-col>
                <v-col cols="8">
                    <Editor v-model="data.description" :height="100" />
                    <span v-if="isVisualEditor" class="sub-action">
                        <input v-model="parityOptions.updateDescription" type="checkbox">
                        <small> <i>Updates the last text node of the first action in the automation structure to this
                                text
                                while
                                enabled.</i> </small>
                    </span>
                </v-col>
            </v-row>
        </div>

        <EditAutomation ref="EditAutomationRef" v-model="data.automation" v-model:is-visual-editor="isVisualEditor"
            :name="data.name" />
    </div>
</template>

<style scoped lang="less">
.two-wide {
    display: grid;
    gap: 2rem;
    grid-template-columns: 1fr 1fr;

    &.uneven {
        grid-template-columns: 1fr 2fr;
        max-width: 100%;
    }
}

a {
    color: rgb(var(--v-theme-primary));
}

.sub-action {
    line-height: 0.7;

    small {
        font-size: x-small;
    }

    input[type="checkbox"] {
        scale: 0.7;
        translate: 0 4px;
    }
}
</style>