<script setup lang="ts">
import { type Ref, inject, onMounted, ref, watch } from "vue";
import SectionHeader from "./shared/SectionHeader.vue";
import AnnotatedString from "./shared/AnnotatedString.vue";
import { useDataCleanup } from "./shared/utils";
import AutomationDocumentation from "./shared/AutomationDocumentation.vue";
import type { AbilityReference, Text } from "~/shared";
import LabelledComponent from "@/components/LabelledComponent.vue";
import { useFetch } from "@/utils/utils";

const currentEffect = inject<Ref<Text>>("currentEffect");

const abilities = ref<AbilityReference[]>([]);
onMounted(async () => {
	const { success, data } = await useFetch<AbilityReference[]>("/api/gamedata/limiteduse");
	if (success)
		abilities.value = data;
});

const descIsText = ref(typeof currentEffect!.value.text === "string");

watch(() => descIsText.value, () => {
	if (descIsText.value)
		currentEffect!.value.text = "";
	else
		// default to Second Wind ability
		currentEffect!.value.text = { id: 192, typeId: 12168134 };
});

useDataCleanup(currentEffect, ["title"]);
</script>

<template>
	<template v-if="currentEffect">
		<SectionHeader title="Text" />
		<div class="two-wide">
			<LabelledComponent title="Title" for="title">
				<input id="title" v-model="currentEffect.title" type="text" placeholder="Effect">
			</LabelledComponent>
		</div>

		<LabelledComponent title="Description" for="text" style="margin-top: 1rem">
			<div v-if="descIsText" class="input-wrapper">
				<textarea id="text" v-model="(currentEffect.text as string)" rows="20" placeholder="Description" /><AnnotatedString />
			</div>
			<v-select v-else v-model="currentEffect.text" :options="abilities" label="name" input-id="text" :reduce="(x : any) => ({ id: x.id, typeId: x.typeId })" />
		</labelledcomponent>
		<LabelledComponent title="Text Type" for="textType" style="margin-top: 1rem">
			<select id="textType" v-model="descIsText" class="ghost">
				<option :value="true">
					Text
				</option>
				<option :value="false">
					Ability Reference
				</option>
			</select>
		</LabelledComponent>
	</template>
</template>

<style scoped>
	@import url("../../../assets/styles/automation-editor.less");
textarea {
	min-height: 150px;
}

:deep(.v-select.vs--single .vs__selected) {
	max-width: none;
}
</style>
