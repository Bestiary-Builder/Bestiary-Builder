<script setup lang="ts">
import { $toast } from '@/utils/app/toast';
import { store } from '@/utils/store';
import { useFetch } from '@/utils/utils';
import { onMounted, ref } from 'vue';

const automationCollections = ref()
const getMyCollections = async () => {
    const { success, data, error } = await useFetch(`/api/my-automation-collections`);
    if (success)
        automationCollections.value = data;
    else $toast.error(error);
};

onMounted(async () => {
	await getMyCollections()
})
</script>


<template>
	{{ automationCollections }}
</template>