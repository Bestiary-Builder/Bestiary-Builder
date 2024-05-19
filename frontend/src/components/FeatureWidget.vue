<script lang="ts" setup>
import { ref } from "vue";
import AutomationEditor from "./AutomationEditor.vue";
import Modal from "./Modal.vue";
import type { FeatureEntity } from "~/shared";

defineProps<{ data: FeatureEntity; type: string; index: number; creatureName: string }>();
const showFeatureModal = ref(false);
</script>

<template>
	<button :id="type + index" class="btn open-btn" @click="showFeatureModal = true">
		Edit Feature
	</button>
	<Modal :show="showFeatureModal" :full-screen="true" @close="showFeatureModal = false">
		<template #header>
			Edit feature: {{ data.name }}
		</template>
		<template #body>
			<AutomationEditor :data="data" :is-stand-alone="false" :creature-name="creatureName" />
		</template>
	</Modal>
</template>

<style scoped lang="less">
.open-btn {
	width: 100%;
}
</style>
