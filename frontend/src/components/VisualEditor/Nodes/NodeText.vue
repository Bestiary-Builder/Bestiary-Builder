<script setup lang="ts">
import type { Ref } from "vue";
import type { AbilityReference, Text } from "~/shared";
import { inject, onMounted, ref, watch } from "vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import { useFetch } from "@/utils/utils";
import AnnotatedString from "./shared/AnnotatedString.vue";
import SectionHeader from "./shared/SectionHeader.vue";
import { useDataCleanup } from "./shared/utils";

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

const setDesc = inject<false | Function>("setActionDescription");
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
				<textarea id="text" v-model="(currentEffect.text as string)" rows="5" placeholder="Description" /><AnnotatedString />
				<small v-if="setDesc" style="font-size: x-small; cursor: pointer" role="button" @click="setDesc(currentEffect.text)"> <i>Set the description of the statblock trait to this text.</i> </small>
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
	@import url("./styles/automation-editor.less");
textarea {
	min-height: 150px;
}

:deep(.v-select.vs--single .vs__selected) {
	max-width: none;
}
</style>
