<script setup lang="ts">
import type { Ref } from "vue";
import type { Condition } from "~/shared";
import { computed, inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Condition>>("currentEffect");

const isWarning = computed(() => {
	return (
		(
			(currentEffect?.value.condition.includes(" = ")) ?? false
		) || (
			(
				(currentEffect?.value.condition.includes("=") ?? false)
				&& !(currentEffect?.value.condition.includes("==") ?? false)
				&& currentEffect?.value.condition[currentEffect?.value.condition.length - 1] !== "="
			)
			&& !(currentEffect?.value.condition.includes(">") || currentEffect?.value.condition.includes("<") || currentEffect?.value.condition.includes("!"))
		)
	);
});

useDataCleanup(currentEffect, ["errorBehaviour"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Branch" />
		<div>
			<v-text-field v-model="currentEffect.condition" label="Condition"
				:messages="isWarning ? ['Equality checks should use double ==.'] : []" hint="IntExpression"
				:color="isWarning ? 'warning' : undefined" />
		</div>

		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-select v-model="currentEffect.errorBehaviour" label="Error Behaviour" title="Error Behaviour" :items="[
				{ title: 'Treat as True', value: 'true' },
				{ title: 'Treat as False', value: 'false' },
				{ title: 'Run both', value: 'both' },
				{ title: 'Neither', value: 'neither' },
				{ title: 'Raise', value: 'raise' },
			]" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
