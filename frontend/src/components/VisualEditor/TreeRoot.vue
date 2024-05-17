<template>
    <span v-if="!parsedAutomation"> No data set </span>
    <p v-else v-for="node in parsedAutomation.automation ?? []">
        <TreeNode :data="node" :depth :parent-type/>
    </p>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import TreeNode from "./TreeNode.vue"
import YAML from "yaml"
const props = withDefaults(defineProps<{data: string, depth?: number, parentType?: string}>(), {depth: 0, parentType: "root"})

const parsedAutomation = ref<Record<string, unknown> | null>(null)
watch(() => props.data, () => {
    try {
        parsedAutomation.value = YAML.parse(props.data)
    } catch {
        console.log('data is not ready yet...', props.data)
    }
}, {immediate: true})
</script>