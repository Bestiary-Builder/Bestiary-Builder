<script setup lang="ts">
import { type Ref, inject, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Remove_IEffect } from "~/shared";

const currentEffect = inject<Ref<Remove_IEffect>>("currentEffect");
const _currentContext = inject<Ref<string[]>>("currentContext");

useDataCleanup(currentEffect, ["removeParent"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Remove IEffect" />
		<span>Remove IEffect only has optional options.</span>
		<SectionHeader title="Additional Options" />
		<div class="two-wide">
			<LabelledComponent title="Remove Parent" for="removeParent">
				<select id="removeParent" v-model="currentEffect.removeParent" class="ghost">
					<option :value="null">
						Never
					</option>
					<option value="always">
						Always
					</option>
					<option value="if_no_children">
						If No Children
					</option>
				</select>
			</LabelledComponent>
		</div>
	</template>
</template>

<style scoped>
@import url("../../../assets/styles/automation-editor.less");
</style>
