<script setup lang="ts">
import LabelledComponent from "./LabelledComponent.vue";

const { title } = defineProps<{ title: string }>();
const model = defineModel<number>();

const changeCR = (isIncrease: boolean) => {
	if (!model.value)
		model.value = 0;

	if (model.value === 0 && isIncrease) {
		model.value = 0.125;
	}
	else if (model.value === 0.125 && isIncrease) {
		model.value = 0.25;
	}
	else if (model.value === 0.25 && isIncrease) {
		model.value = 0.5;
	}
	else if (model.value === 0.5 && isIncrease) {
		model.value = 1;
	}
	else if (model.value === 0.125 && !isIncrease) {
		model.value = 0;
	}
	else if (model.value === 0.25 && !isIncrease) {
		model.value = 0.125;
	}
	else if (model.value === 0.5 && !isIncrease) {
		model.value = 0.25;
	}
	else if (model.value === 1 && !isIncrease) {
		model.value = 0.5;
	}
	else {
		if (isIncrease)
			model.value = Math.min(30, model.value + 1);
		else
			model.value = Math.max(0, model.value - 1);
	}
};
</script>

<template>
	<LabelledComponent :title="title">
		<div class="quantity">
			<input id="challengerating" v-model="model" type="number" min="0" max="30" inputmode="numeric">
			<div class="quantity-nav">
				<div class="quantity-button quantity-up" aria-label="Increase CR" @click="changeCR(true)">
					+
				</div>
				<div class="quantity-button quantity-down" aria-label="Decrease CR" @click="changeCR(false)">
					-
				</div>
			</div>
		</div>
	</LabelledComponent>
</template>

<style scoped>
@import url("@/assets/styles/number-input.less");
</style>
