<template>
    <template v-if="metaData">
        <p> 
            <p :style="`margin-left: ${(depth+0) * 20}px`"> {{ parentType}}:</p>
            <p :style="`margin-left: ${(depth+1) * 20}px`"> {{ selfType }}</p>
        </p>
    </template>
    <!-- <p v-if="metaData" :style="`margin-left: ${depth * 20}px`"> {{parentType}}: 
        <p style="margin-left: 20px"> {{ selfType }}</p>
    </p> -->
    <template v-for="node, nodeType of data" v-if="metaData">
        <template v-if="metaData[selfType][nodeType] == 'Effects[]'">
            <TreeNode v-for="childNode in node" :data="childNode" :depth="depth + 1" :parent-type="nodeType"/> 
        </template>
        <template v-if="nodeType == 'buttons'">
            <TreeRoot v-for="button in node" :data="JSON.stringify(button)" :depth="depth + 1" parent-type="buttonRoot" />
        </template>
        <template v-if="nodeType == 'attacks'">
            <TreeRoot v-for="attack in node" :data="JSON.stringify(attack)" :depth="depth + 1" parent-type="attackRoot" />
        </template>
    </template>
</template>

<script setup lang="ts">
import { useFetch } from '@/utils/utils';
import { ref, onMounted, computed } from 'vue';
import TreeRoot from './TreeRoot.vue';

const props = defineProps<{data: unknown, depth: number, parentType: string}>()

// Documentation helpers
const metaData = ref<any | null>(null);

onMounted(async () => {
    const {success, data, error } = await useFetch("/api/automationMetaData")
    if (success) metaData.value = data
})

const selfType = computed(() => {
    // @ts-ignore
    return props.data.type
})
</script>

<style scoped>
.red {
    border: 4px solid lightcoral;
}

.blue {
    border: 4px solid lightblue;
    margin-right: .5rem;
}

.green {
    border: 4px solid lightgreen
}
</style>