<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	menuProps: {
		type: Object,
		default: () => ({}),
	},
	sheetProps: {
		type: Object,
		default: () => ({}),
	},
});

const emit = defineEmits(["update:modelValue"]);

const { smAndDown } = useDisplay();

const updateOpen = (value: boolean) => {
	isOpen.value = value;
	emit("update:modelValue", value);
};

const isOpen = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit("update:modelValue", value),
});
</script>

<template>
	<v-menu v-if="!smAndDown" :model-value="isOpen" v-bind="menuProps" location="bottom center" origin="top center"
		:scrim="true" offset="0 -50%" :close-on-content-click="false" @update:model-value="updateOpen">
		<template #activator="{ props: activatorProps }">
			<slot name="activator" v-bind="{ props: activatorProps }" />
		</template>
		<slot />
	</v-menu>

	<v-bottom-sheet v-else :model-value="isOpen" v-bind="sheetProps" @update:model-value="updateOpen">
		<template #activator="{ props: activatorProps }">
			<slot name="activator" v-bind="{ props: activatorProps }" />
		</template>
		<slot />
	</v-bottom-sheet>
</template>
