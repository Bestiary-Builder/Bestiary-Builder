<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute } from "vue-router";
import html2canvas from "html2canvas";
import { Shimmer } from "@shimmer-from-structure/vue";
import { $toast, htmlToast } from "@/utils/app/toast";
import Modal from "@/components/Global/Modal.vue";
import StatblockRenderer from "@/components/Statblock/StatblockRenderer.vue";
import Breadcrumbs from "@/components/Page/Breadcrumbs.vue";
import LabelledComponent from "@/components/FormInputs/LabelledComponent.vue";
import type { BestiaryExtended, CreatureWithStats, Statblock } from "~/shared";
import { defaultStatblock } from "~/shared";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";
import CopyManager from "@/components/Bestiary/CopyManager.vue";
import ButtonIcon from "@/components/Global/ButtonIcon.vue";

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
			$toast.error(error);
		}
	}
	else {
		$toast.error(`Error: ${error}`);
	}
});

// export
const exportStatblock = async () => {
	const text = JSON.stringify(data.value, null, 2);
	await navigator.clipboard.writeText(text);
	$toast.info("Exported this statblock to your clipboard.");
};

const exportHomebrery = async () => {
	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/creature/${$route.params.id.toString()}`,
			"GET"
		);
		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			$toast.info("Exported this statblock markdown to your clipboard");
		}
		else {
			$toast.error(error);
		}
	}
	catch (err) {
		$toast.error(err as string);
	}
};

const exportToImage = async (type: "1x1" | "2x1" | "2x1 wide") => {
	if (!data.value)
		return;
	const loader = $loading.show();
	const el = document.getElementById("statblock");
	if (!el)
		return;

	el.style = `width: ${type === "2x1 wide" ? "1200" : "800"}px; column-count: ${type === "1x1" ? "1" : "2"};`;
	el.classList.add("toPrint");

	const canvas = await html2canvas(el, { scale: 2 });
	const image = canvas.toDataURL("image/jpeg");
	const link = document.createElement("a");

	link.download = `${data.value.stats.description.name} from BestiaryBuilder (${type}).jpg`;
	link.href = image;
	link.click();
	el.classList.remove("toPrint");
	el.style = "";
	loader.hide();
};
</script>

<template>
	<div>
		<Breadcrumbs
			v-if="bestiary && (data?.stats.description.name || data?.stats.description.name === '')"
			:routes="[
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
			]"
		>
			<CopyManager v-if="data" no-import-all :may-import="false" :current-creature="{ ...data, bestiaryName: bestiary.name }" />

			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<ButtonIcon icon="arrow-right-from-bracket" label="Export statblock" />
				<template #popper>
					<div class="v-popper__custom-menu">
						<span>
							Export this creature
						</span>
						<button v-close-popper class="btn confirm" @click="exportStatblock">
							JSON
						</button>
						<button v-close-popper class="btn confirm" @click="exportHomebrery">
							Homebrewery
						</button>
						<LabelledComponent title="Image export options">
							<div style="display: flex;flex-direction: column;gap: 1rem;">
								<button v-close-popper class="btn confirm" @click="exportToImage('2x1')">
									2 columns (Recommended)
								</button>
								<button v-close-popper class="btn confirm" @click="exportToImage('1x1')">
									1 column
								</button>
								<button v-close-popper class="btn confirm" @click="exportToImage('2x1 wide')">
									2 columns extra wide
								</button>
							</div>
						</LabelledComponent>
					</div>
				</template>
			</VDropdown>
		</Breadcrumbs>
		<div class="content">
			<div class="content-container__inner">
				<Shimmer :loading="data === null" :template-props="{ data: defaultStatblock }" shimmer-color="orangered">
					<StatblockRenderer id="statblock" :data="data?.stats || defaultStatblock" />
				</Shimmer>
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
