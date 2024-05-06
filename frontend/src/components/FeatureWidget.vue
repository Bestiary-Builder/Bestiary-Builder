<template>
	<button class="btn open-btn" @click="showFeatureModal = true" :id="type + index">Edit Feature</button>
	<Modal :show="showFeatureModal" @close="showFeatureModal = false" :full-screen="true">
		<template #header> Edit feature: {{ data.name }} </template>
		<template #body>
			<AutomationEditor :data="data" :is-stand-alone="false" :creature-name="creatureName" />
		</template>
	</Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AutomationEditor from './AutomationEditor.vue';
import Modal from './Modal.vue';
import type {  FeatureEntity } from '~/shared';
const showFeatureModal = ref(false);
const props = defineProps<{data: FeatureEntity, type: string, index: number, creatureName: string}>();
</script>

<style scoped lang="less">
.open-btn {
	width: 100%;
}
</style>