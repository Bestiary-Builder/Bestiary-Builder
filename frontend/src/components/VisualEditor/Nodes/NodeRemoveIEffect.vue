<script setup lang="ts">
import type { Ref } from "vue";
import type { Remove_IEffect } from "~/shared";
import { inject } from "vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

const currentEffect = inject<Ref<Remove_IEffect>>("currentEffect");

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
@import url("./styles/automation-editor.less");
</style>
