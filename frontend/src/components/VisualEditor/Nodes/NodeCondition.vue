<script setup lang="ts">
import { type Ref, computed, inject, watch } from "vue";
import IntExpression from "./shared/IntExpression.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Condition } from "~/shared";

const currentEffect = inject<Ref<Condition>>("currentEffect");

const isWarning = computed(() => {
	return (currentEffect?.value.condition.includes(" = ") || (currentEffect?.value.condition.includes("=") && !currentEffect?.value.condition.includes("==") && currentEffect?.value.condition[currentEffect?.value.condition.length - 1] !== "="));
});

useDataCleanup(currentEffect, ["errorBehaviour"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Branch" />
		<LabelledComponent title="Condition*" for="condition">
			<div class="input-wrapper">
				<input id="condition" v-model="currentEffect.condition" type="text" :class="{ required: currentEffect.condition.length === 0, warning: isWarning }"> <IntExpression />
				<span v-if="isWarning" class="delay" style="color: var(--color-warning); font-size: small;"> Equality checks should use double ==.</span>
			</div>
		</LabelledComponent>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Error Behaviour" for="error">
				<select id="error" v-model="currentEffect.errorBehaviour" title="Error Behaviour" class="ghost">
					<option value="true">
						Treat as True
					</option>
					<option value="false">
						Treat as False
					</option>
					<option value="both">
						Run both
					</option>
					<option value="neither">
						Neither
					</option>
					<option value="raise">
						Raise
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
