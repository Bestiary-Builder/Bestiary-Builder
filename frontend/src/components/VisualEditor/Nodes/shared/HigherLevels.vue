<script setup lang="ts">
import IntExpression from "./IntExpression.vue";

withDefaults(defineProps<{ isIntExpression?: boolean }>(), { isIntExpression: false });
const model = defineModel<Record<number, string>>({ required: true });
</script>

<template>
	<div>
		For use with the -l argument.
		<details>
			<summary> Expand </summary>
			<ol>
				<li v-for="x in 9" :key="x">
					<div class="input-wrapper">
						<input v-model="model[x]" type="text"> <IntExpression v-if="isIntExpression" />
					</div>
				</li>
			</ol>
		</details>
	</div>
</template>

<style scoped>
@import url("../../../../assets/styles/automation-editor.less");

li {
	margin-bottom: 0.5rem;
}
</style>
