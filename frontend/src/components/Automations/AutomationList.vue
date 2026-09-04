<template>
    <div>
        <v-row class="mb-6 pt-2">
            <v-col>
                <v-text-field v-model="searchText" label="Search by name" prepend-inner-icon="mdi:magnify" clearable
                    density="compact" hide-details @click:clear="searchText = ''" />
            </v-col>
            <v-col>
                <v-select v-model="sortMode" :items="sortModeOptions" label="Sort by" density="compact" hide-details
                    prepend-inner-icon="mdi:sort" />
            </v-col>
        </v-row>


        <v-list density="compact" v-if="flattenedItems.length > 0">
            <v-virtual-scroll max-height="500" :items="flattenedItems" item-height="48" item-key="key"
                ref="virtualScroll">
                <template #default="{ item }">
                    <v-list-item v-if="item.type === 'header'" :title="item.label" class="group-header"
                        @click="toggleGroup(item.groupKey)">
                        <template #append>
                            <v-icon :icon="item.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" />
                        </template>
                    </v-list-item>

                    <v-list-item v-else :title="item.data.name" class="multiline-subtitle creature-item">

                        <template #default>
                            <v-list-item-subtitle v-html="md.renderInline(item.data.description || '')" />
                        </template>
                        <template #prepend v-if="sortMode === 'Custom' && canEdit">
                            <v-icon icon="$drag" class="drag-handle" :class="{ 'drag-handle--disabled': !canDrag }"
                                color="primary" />
                        </template>


                        <template #append>
                            <RouterLink class="creature"
                                :to="`/automation/${canEdit ? 'edit' : 'view'}/${item.data.id}`"
                                :aria-label="`${canEdit ? 'Edit' : 'View'} automation`" size="24">
                                <v-icon-btn v-if="canEdit" icon="mdi:pencil" size="24" />
                                <v-icon-btn v-else icon="mdi:eye" size="24" style="scale: 0.9;" />
                            </RouterLink>

                            <ImportToCharacter :automation="item.data.automation"
                                :consumables="item.data.consumables" />
                            <DropdownMenu v-if="canEdit">
                                <template #activator="{ props }">
                                    <v-icon-btn text="Delete automation" icon="mdi:delete" v-bind="props" size="24" />
                                </template>
                                <v-card min-width="300" class="text-center pb-2">
                                    <v-card-text>
                                        Are you sure you want to delete <br> <b>{{ item.data.name }}</b>?
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn size="large" color="error" class="mx-auto"
                                            @click.stop="emit('deleteItem', item.data.id);">
                                            Confirm
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </DropdownMenu>
                        </template>
                    </v-list-item>
                    <v-divider>

                    </v-divider>
                </template>
            </v-virtual-scroll>
        </v-list>
        <p v-else class="text-center">
            No automations found.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useFetch } from '@/utils/utils';
import { ACTION_TYPE_MAP } from '@/views/armory/utils';
import { useLocalStorage } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useDraggable } from 'vue-draggable-plus'
import { type Automation, type Bestiary } from '~/shared';
import ImportToCharacter from '../Characters/ImportToCharacter.vue';
import MarkdownIt from "markdown-it";

const model = defineModel<Automation[]>()
const { collection, canEdit } = defineProps<{ collection: Bestiary, canEdit: boolean }>()

const emit = defineEmits<{
    (e: 'deleteItem', id: Automation["id"]): void
}>()

// --- Grouping ---

type SortMode = 'Custom' | 'Alphabetical' | 'activation_type' | 'tag'
const sortMode = canEdit ? useLocalStorage<SortMode>('sortModeForAutomations', 'Alphabetical') : ref<SortMode>('Alphabetical')
const searchText = ref('')

const sortModeOptions: { title: string; value: SortMode }[] = [
    { title: 'Alphabetically', value: 'Alphabetical' },
    { title: 'Custom order', value: 'Custom' },
    { title: 'Activation Type', value: 'activation_type' },
    { title: 'Tag', value: 'tag' },

]

type FlatEntry =
    | { type: 'header'; key: string; label: string; groupKey: string; collapsed: boolean }
    | { type: 'item'; key: string; data: Automation }


const collapsedGroups = ref(new Set<string>())

const toggleGroup = (groupKey: string) => {
    if (collapsedGroups.value.has(groupKey)) collapsedGroups.value.delete(groupKey)
    else collapsedGroups.value.add(groupKey)
}

// Fresh groups on a new grouping mode shouldn't inherit collapse state from the last one
watch(sortMode, () => {
    collapsedGroups.value = new Set()
})


const flattenedItems = computed<FlatEntry[]>(() => {
    const query = searchText.value.trim().toLowerCase()
    const items = (model.value ?? []).filter(item =>
        query === '' || item.name.toLowerCase().includes(query)
    )

    if (sortMode.value === 'Custom') {
        return items.map(item => ({ type: 'item' as const, key: String(item.id), data: item }))
    }

    if (sortMode.value === 'Alphabetical') {
        return [...items]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(item => ({ type: 'item' as const, key: String(item.id), data: item }))
    }


    const groupKeyProp = sortMode.value
    const getGroupRawValue = (item: Automation): unknown => {
        if (groupKeyProp === 'activation_type') {
            const automation = item.automation
            if (Array.isArray(automation) && automation.length > 0) {
                const firstAutomation = automation[0]
                return firstAutomation.activation_type ?? null
            }
            return automation.activation_type ?? null
        }
        return item[groupKeyProp as keyof Automation]
    }


    const groups = new Map<string, Automation[]>()

    for (const item of items) {
        const groupKey = String(getGroupRawValue(item)).replace(/ .*/, '')
        if (groupKeyProp !== 'tag') groupKey.replace(/ .*/, '')
        if (!groups.has(groupKey)) groups.set(groupKey, [])
        groups.get(groupKey)!.push(item)
    }

    const sortedGroupKeys = [...groups.keys()].sort((a, b) => {
        return a.localeCompare(b)
    })

    return sortedGroupKeys.flatMap(groupKey => {
        const isCollapsed = collapsedGroups.value.has(groupKey)
        const groupItems = isCollapsed
            ? []
            : [...groups.get(groupKey)!].sort((a, b) => a.name.localeCompare(b.name))

        return [
            {
                type: 'header' as const,
                key: `header-${groupKey}`,
                label: (sortMode.value === 'activation_type' ? ACTION_TYPE_MAP[Number.parseInt(groupKey)] || 'Attack' : (groupKey ? groupKey : `No ${sortMode.value}`)),
                groupKey,
                collapsed: isCollapsed,
            },
            ...groupItems.map(item => ({ type: 'item' as const, key: String(item.id), data: item })),
        ]
    })
})

// --- Drag-to-reorder (Custom/flat mode only) ---

const virtualScrollRef = useTemplateRef("virtualScroll")
const draggableControls = ref<ReturnType<typeof useDraggable> | null>(null)

const canDrag = computed(() => sortMode.value === 'Custom' && searchText.value.trim() === '')

watch(canDrag, (enabled) => {
    if (enabled) draggableControls.value?.resume()
    else draggableControls.value?.pause()
})

const initDraggable = async () => {
    await nextTick()

    const outerScrollEl = virtualScrollRef.value?.$el as HTMLElement | undefined
    const innerContainerEl = outerScrollEl?.querySelector('.v-virtual-scroll__container') as HTMLElement | null

    if (!outerScrollEl || !innerContainerEl) return

    draggableControls.value = useDraggable(ref(innerContainerEl), model, {
        animation: 250,
        handle: '.drag-handle',
        disabled: !canEdit,
        scroll: outerScrollEl,
        bubbleScroll: false,
        scrollSensitivity: 500,
        scrollSpeed: 5,
    })

    if (!canDrag.value) draggableControls.value.pause()
}

onMounted(initDraggable)

const saveOrder = async () => {
    if (model.value && collection) {
        const orderIds = model.value.map(automation => automation.id);
        await useFetch(`/api/automation-collection/${collection.id}/automations/order`, "POST", orderIds);
    }
};
watch(model, saveOrder);


const md = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
});
</script>

<style scoped>
.creature-item,
.group-header {
    transition: background-color 0.1s ease;

    &:hover {
        background-color: rgba(var(--v-theme-on-surface), 0.06);
    }
}

.group-header:deep(.v-list-item-title) {
    font-weight: bold;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}


.multiline-subtitle :deep(.v-list-item-subtitle) {
    white-space: pre-line;
}

.drag-handle {
    cursor: grab;

    &.drag-handle--disabled {
        cursor: not-allowed;
        opacity: 0.35;
    }

    &:active {
        cursor: grabbing;
    }
}
</style>