<script setup lang="ts">
import type { Ref } from "vue";
import type { Remove_IEffect } from "~/shared";
import { inject } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Remove_IEffect>>("currentEffect");

useDataCleanup(currentEffect, ["removeParent"]);
</script>

<template>
	<template v-if="currentEffect">
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Remove IEffect" />
				<p>Remove IEffect only has optional options.</p>

			</v-col>

			<v-col cols="12">
				<SectionHeader title="Additional Options" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="currentEffect.removeParent" label="Remove Parent" :items="[
					{ title: 'Never', value: null },
					{ title: 'Always', value: 'always' },
					{ title: 'If No Children', value: 'if_no_children' },
				]" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
