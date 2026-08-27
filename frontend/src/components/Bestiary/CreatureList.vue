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
            <v-virtual-scroll max-height="500" :items="flattenedItems" item-height="65" item-key="key"
                ref="virtualScroll">
                <template #default="{ item }">
                    <v-list-item v-if="item.type === 'header'" :title="item.label" class="group-header"
                        @click="toggleGroup(item.groupKey)">
                        <template #append>
                            <v-icon :icon="item.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down'" />
                        </template>
                    </v-list-item>

                    <v-list-item v-else :title="item.data.name" @mouseover="hoveredCreature = item.data.id"
                        :subtitle="`${item.data.size} ${item.data.race}\nCR ${item.data.cr}`" lines="two"
                        class="multiline-subtitle creature-item">
                        <template #prepend v-if="sortMode === 'Custom'">
                            <v-icon icon="material-symbols:drag-indicator" class="drag-handle"
                                :class="{ 'drag-handle--disabled': !canDrag }" color="primary" />
                        </template>


                        <template #append>
                            <RouterLink class="creature" :to="`/creature/${canEdit ? 'edit' : 'view'}/${item.data.id}`"
                                :aria-label="`${canEdit ? 'Edit' : 'View'} creature`" size="24">
                                <v-icon-btn v-if="canEdit" icon="mdi:pencil" size="24" />
                                <v-icon-btn v-else icon="mdi:eye" size="24" style="scale: 0.9;" />
                            </RouterLink>
                            <v-icon-btn text="Pin creature"
                                :icon="pinnedCreature === item.data.id ? 'mdi:pin-off' : 'mdi:pin'" size="24"
                                @click="emit('pinCreature', item.data.id)" />

                            <DropdownMenu v-if="canEdit">
                                <template #activator="{ props }">
                                    <v-icon-btn text="Delete creature" icon="mdi:delete" v-bind="props" size="24" />
                                </template>
                                <v-card min-width="300" class="text-center pb-2">
                                    <v-card-text>
                                        Are you sure you want to delete <br> <b>{{ item.data.name }}</b>?
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn size="large" color="error" class="mx-auto"
                                            @click.stop="emit('deleteCreature', item.data.id);">
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
            No creatures found
        </p>
    </div>
</template>

<script setup lang="ts">
import { useFetch } from '@/utils/utils';
import { refDebounced, useLocalStorage } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useDraggable } from 'vue-draggable-plus'
import { type Bestiary, type CreatureMetaData } from '~/shared';

const model = defineModel<CreatureMetaData[]>()
const { pinnedCreature = null, collection, canEdit } = defineProps<{ pinnedCreature: CreatureMetaData["id"] | null, collection: Bestiary, canEdit: boolean }>()

const emit = defineEmits<{
    (e: 'hoveredCreature', id: CreatureMetaData["id"]): void
    (e: 'pinCreature', id: CreatureMetaData["id"]): void
    (e: 'deleteCreature', id: CreatureMetaData["id"]): void
    (e: 'copyCreature', id: CreatureMetaData["id"]): void
}>()

const hoveredCreature = ref<CreatureMetaData["id"] | null>(null)
const debouncedHoveredCreature = refDebounced(hoveredCreature, 200)

watch(debouncedHoveredCreature, () => {
    if (debouncedHoveredCreature.value)
        emit('hoveredCreature', debouncedHoveredCreature.value)
})

// --- Grouping ---

type SortMode = 'Custom' | 'Alphabetical' | 'race' | 'size' | 'cr-asc' | 'cr-desc'
const sortMode = canEdit ? useLocalStorage<SortMode>('sortModeForBestiaries', 'Alphabetical') : ref<SortMode>('Alphabetical')
const searchText = ref('')

const sortModeOptions: { title: string; value: SortMode }[] = [
    { title: 'Alphabetically', value: 'Alphabetical' },
    { title: 'Creature Type', value: 'race' },
    { title: 'Size', value: 'size' },
    { title: 'CR Ascending', value: 'cr-asc' },
    { title: 'CR Descending', value: 'cr-desc' },]

if (canEdit)
    sortModeOptions.unshift({ title: 'Custom order', value: 'Custom' })

type FlatEntry =
    | { type: 'header'; key: string; label: string; groupKey: string; collapsed: boolean }
    | { type: 'item'; key: string; data: CreatureMetaData }


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


    const groupKeyProp: 'race' | 'size' | 'cr' =
        sortMode.value === 'cr-asc' || sortMode.value === 'cr-desc' ? 'cr' : sortMode.value
    const isCr = groupKeyProp === 'cr'

    const groups = new Map<string, CreatureMetaData[]>()

    for (const item of items) {
        const groupKey = String(item[groupKeyProp] ?? 'Unknown').replace(/ .*/, '')
        if (!groups.has(groupKey)) groups.set(groupKey, [])
        groups.get(groupKey)!.push(item)
    }

    const sortedGroupKeys = [...groups.keys()].sort((a, b) => {
        if (isCr) {
            const diff = Number(a) - Number(b)
            return sortMode.value === 'cr-desc' ? -diff : diff
        }
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
                label: isCr ? `CR ${groupKey}` : (groupKey ? groupKey : `No ${sortMode.value}`),
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
        onUpdate: saveOrder,
    })

    if (!canDrag.value) draggableControls.value.pause()
}

onMounted(initDraggable)

const saveOrder = async () => {
    if (model.value && collection) {
        const orderIds = model.value.map(creature => creature.id);
        const { success, data, error } = await useFetch(`/api/bestiary/${collection.id}/creatures/order`, "POST", orderIds);
        console.log(success, data, error)
    }
};
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