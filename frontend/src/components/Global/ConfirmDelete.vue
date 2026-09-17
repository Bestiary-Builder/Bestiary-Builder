<template>
    <DropdownMenu v-model="isDropDownOpen">
        <template #activator="{ props: menuProps }">
            <v-tooltip text="Delete">
                <template #activator="{ props: tooltipProps }">
                    <v-icon icon="mdi:trash" :size="size" v-bind="mergeProps(menuProps, tooltipProps)"
                        class="no-focus-outline" :color />
                </template>
            </v-tooltip>
        </template>
        <v-card class="text-center pb-2" :subtitle="message">
            <v-card-text>
                <v-btn color="error" class="w-100" @click="emit('confirm'); isDropDownOpen = false">
                    Delete
                </v-btn>
            </v-card-text>
        </v-card>
    </DropdownMenu>
</template>

<script setup lang="ts">
import { mergeProps, ref } from 'vue'
import DropdownMenu from './DropdownMenu.vue'

withDefaults(defineProps<{
    message: string
    size?: string
    color?: string
}>(), {
    tooltipText: 'Delete this element',
    size: '24',
    color: 'primary'
})

const isDropDownOpen = ref(false);

const emit = defineEmits<{
    confirm: []
}>()
</script>