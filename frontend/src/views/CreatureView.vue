<script setup lang="ts">
import type { BestiaryExtended, CreatureWithStats } from "~/shared";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import CopyCreature from "@/components/Bestiary/CopyCreature.vue";
import ExportCreature from "@/components/Bestiary/ExportCreature.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import { $toast } from "@/utils/app/toast";
import { store } from "@/utils/store";
import { useFetch } from "@/utils/utils";

const $route = useRoute();

const data = ref<CreatureWithStats | null>(null);
const bestiary = ref<BestiaryExtended | null>(null);
const isOwner = ref(false);
const isEditor = ref(false);
// load creature data
onMounted(async () => {
	const { success, data: cData, error } = await useFetch<CreatureWithStats>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = cData;
		// loader.hide();
		const { success, data: bData, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${data.value?.bestiaryId}`);
		if (success) {
			bestiary.value = bData;
			isOwner.value = store.user?.id === bData.ownerId;
			isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");
		}
		else {
			addToast(error, { color: "error" });
			;
		}
	}
	else {
		$toast.error(`Error: ${error}`);
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
				<StatblockRenderer v-else id="statblock" :data="data.stats" />
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
