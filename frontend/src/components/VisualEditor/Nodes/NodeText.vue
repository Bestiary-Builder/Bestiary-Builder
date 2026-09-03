<script setup lang="ts">
import type { Ref } from "vue";
import type { AbilityReference, Text } from "~/shared";
import { inject, onMounted, ref, watch } from "vue";
import Editor from "@/components/StatblockEditor/Editor.vue";
import { useFetch } from "@/utils/utils";
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

// eslint-disable-next-line ts/no-unsafe-function-type
const setDesc = inject<false | Function>("setActionDescription");

const abilityTitle = (item: Record<string, any>) => {
	return `${item.name} (${item.type})`;
};
</script>

<template>
	<template v-if="currentEffect">
		<v-row density="comfortable">
			<v-col cols="12">
				<SectionHeader title="Text" />
			</v-col>

			<v-col cols="6">
				<v-text-field v-model="currentEffect.title" label="Title" placeholder="Effect" persistent-placeholder/>
			</v-col>

			<v-col cols="12" v-if="typeof (currentEffect!.text) === 'string'">
				<Editor v-model="currentEffect.text" />
				<small v-if="setDesc" style="font-size: x-small; cursor: pointer" role="button"
					@click="setDesc(currentEffect.text)"> <i>Set the description of the statblock trait to this
						text.</i>
				</small>
			</v-col>

			<v-col cols="12" v-else>
				<v-autocomplete v-model="currentEffect.text" :items="abilities" :item-title="abilityTitle" return-object
					label="Ability Reference" />
			</v-col>

			<v-col cols="6">
				<v-select v-model="descIsText" :items="[
					{ title: 'Text', value: true },
					{ title: 'Ability Reference', value: false },
				]" label="Text type" />
			</v-col>
		</v-row>
	</template>
</template>

<style scoped>
@import url("./styles/automation-editor.less");
</style>
