<script setup lang="ts">
import { ref, watch } from "vue";
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

const { smAndDown } = useDisplay();

const isOpen = ref(props.modelValue);
const emit = defineEmits(["update:modelValue"]);

watch(
	() => props.modelValue,
	(value) => {
		isOpen.value = value;
	}
);

const updateOpen = (value: boolean) => {
	isOpen.value = value;
	emit("update:modelValue", value);
};
</script>

<template>
	<v-menu v-if="!smAndDown" :model-value="isOpen" v-bind="menuProps" :close-on-content-click="false"
		location="bottom center" origin="top center" :scrim="true" offset="0 -50%" @update:model-value="updateOpen">
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
