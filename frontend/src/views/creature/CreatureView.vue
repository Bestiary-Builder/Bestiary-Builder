<script setup lang="ts">
import type { BestiaryResponse, CreatureResponse } from "~/shared";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import ExportCreature from "@/components/Bestiary/ExportCreature.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { useToast } from "@/utils/app/toast";
import { useFetch } from "@/utils/utils";

const $route = useRoute();
const $router = useRouter();

const { addToast } = useToast()
const data = ref<CreatureResponse | null>(null);
const bestiary = ref<BestiaryResponse | null>(null);
const isOwner = ref(false);
const isEditor = ref(false);

// load creature data
onMounted(async () => {
	const { success, data: cData, error, status } = await useFetch<CreatureResponse>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = cData;
		// loader.hide();
		const { success, data: bData, error, status } = await useFetch<BestiaryResponse>(`/api/bestiary/${data.value?.bestiaryId}`);
		if (success) {
			bestiary.value = bData;
			isOwner.value = bData.permissionLevel === "owner";
			isEditor.value = bData.permissionLevel === "editor";
			if (bestiary.value && data.value && (isOwner.value || isEditor.value))
				void $router.push(`/creature/edit/${data.value.id}`)
		}
		else {
			addToast(error, { color: "error" });
			if (status === 401 || status === 404)
				await $router.replace("/404");
		}
	}
	else {
		addToast(error, { color: "error" })
		if (status === 401 || status === 404)
			await $router.replace("/404");
	}
});
</script>

<template>
	<div>
		<Breadcrumbs v-if="bestiary && (data?.stats.description.name || data?.stats.description.name === '')" :routes="[
			{
				path: `/bestiary/view/${bestiary?.id}`,
				text: bestiary?.name,
				isCurrent: false
			},
			{
				path: '',
				text: data?.stats.description.name || 'Unnamed Creature',
				isCurrent: true
			}
		]">
			<CopyCreature v-if="data" no-import-all :may-import="false"
				:current-creature="{ ...data, bestiaryName: bestiary.name }" />
			<ExportCreature :data="data.stats" />
		</Breadcrumbs>
		<div class="content">
			<div class="content-container__inner">
				<v-skeleton-loader type="heading, divider, text, text, sentences, heading, text" v-if="data === null" />
				<StatblockRenderer v-else id="statblock" :data="data.stats" is2024 statblock-design="BestiaryBuilder" />
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.content {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr;

	.content-container__inner {
		width: 60%;
		margin: 0 auto;
	}
}

@media screen and (max-width: 1200px) {
	.content {
		grid-template-columns: 1fr;

		&.is-statblock-only .content-container__inner {
			width: 100%;
			margin: unset;
		}
	}
}
</style>
