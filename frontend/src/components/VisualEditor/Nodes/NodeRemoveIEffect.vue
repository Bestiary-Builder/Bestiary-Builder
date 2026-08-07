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
		<SectionHeader title="Remove IEffect" />
		<p>Remove IEffect only has optional options.</p>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<v-select v-model="currentEffect.removeParent" label="Remove Parent" :items="[
				{ title: 'Never', value: null },
				{ title: 'Always', value: 'always' },
				{ title: 'If No Children', value: 'if_no_children' },
			]" />
		</div>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
