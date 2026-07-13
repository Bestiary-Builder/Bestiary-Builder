<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, provide, ref, watch } from "vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
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
import DescriptionPanel from "@/components/StatblockEditor/0DescriptionPanel.vue";
import CorePanel from "@/components/StatblockEditor/1CorePanel.vue";
import StatsPanel from "@/components/StatblockEditor/2StatsPanel.vue";
import DefensesPanel from "@/components/StatblockEditor/3DefensesPanel.vue";
import FeaturesPanel from "@/components/StatblockEditor/4FeaturesPanel.vue";
import SpellcastingPanel from "@/components/StatblockEditor/5SpellcastingPanel.vue";

const $route = useRoute();
const $router = useRouter();

const data = ref<Statblock>(defaultStatblock);
const rawInfo = ref<CreatureWithStats | null>(null);

// load creature data
onMounted(async () => {
	// const loader = $loading.show();
	const { success, data: cData, error } = await useFetch<CreatureWithStats>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => madeChanges.value = false);
		rawInfo.value = cData;
		await loadRawInfo();
		// loader.hide();
	}
	else {
		$toast.error(`Error: ${error}`);
		madeChanges.value = false;
		await $router.push("/error");
		// loader.hide();
	}
});

// bestiary data
const bestiary = ref<BestiaryExtended | null>(null);
const isOwner = ref(false);
const isEditor = ref(false);
const shouldShowEditor = ref(false);

const loadRawInfo = async () => {
	const { success, data, error } = await useFetch<BestiaryExtended>(`/api/bestiary/${rawInfo.value?.bestiaryId}`);
	if (success) {
		bestiary.value = data;
		isOwner.value = store.user?.id === bestiary.value.ownerId;
		isEditor.value = (bestiary.value?.editors ?? []).map(e => e.userId).includes(store.user?.id ?? "");
		if (isOwner.value || isEditor.value)
			shouldShowEditor.value = true;
	}
	else {
		$toast.error(error);
	}
};

// saving
const saveStatblock = async (shouldNotify = true): Promise<boolean> => {
	if (!rawInfo.value)
		return false;
	rawInfo.value.stats = data.value;
	const loader = $loading.show();
	// Send to backend
	const { success, error } = await useFetch<CreatureWithStats>(`/api/creature/${rawInfo.value.id.toString()}/update`, "POST", rawInfo.value);
	if (success) {
		if (shouldNotify)
			$toast.success("Saved stat block");
		madeChanges.value = false;
		// watch data only once, as traversing the object deeply is expensive.
		const unwatch = watch(
			() => data.value,
			() => {
				madeChanges.value = true;
				unwatch();
			},
			{ deep: true }
		);
	}
	else {
		$toast.error(htmlToast(error), { duration: Number.POSITIVE_INFINITY });
	}
	loader.hide();
	if (success)
		return true;
	return false;
};

provide("saveStatblock", saveStatblock);

// end of lifecycle
const madeChanges = ref(false);

const unwatch = watch(() => data.value,	() => {
	if (rawInfo.value == null)
		return;
	madeChanges.value = true;
	unwatch();
},	{ deep: true });

onBeforeRouteUpdate(() => {
	// just in case the user manages to navigate to a page that also uses StatblockEditorView
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});
onBeforeRouteLeave(() => {
	// when the user leaves this route
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
		if (!answer)
			return false;
	}
});

const beforeUnLoad = (event: Event) => {
	if (madeChanges.value && (isOwner.value || isEditor.value)) {
		event.preventDefault();
		event.returnValue = true;
	}
};
window.addEventListener("beforeunload", beforeUnLoad);
onUnmounted(() => {
	window.removeEventListener("beforeunload", beforeUnLoad);
});

// doc title
watch(() => data.value.description.name, () => {
	document.title = `${data.value.description.name} | Bestiary Builder`;
}, { immediate: true });

// import
const showImportModal = ref(false);
const notices = ref<{ [key: string]: string[] }>({});
const toolsjson = ref("");

const import5etools = async () => {
	if (toolsjson.value.startsWith("___")) {
		$toast.error("You copied the markdown code, not the JSON.");
		return;
	}
	try {
		const json = JSON.parse(toolsjson.value);
		const { success, data: cData, error } = await useFetch<{ stats: Statblock; notices: { [key: string]: string[] } }>("/api/5etools-import", "POST", json);
		if (!success)
			throw error;
		data.value = cData?.stats;
		notices.value = cData?.notices;
		toolsjson.value = "";
		$toast.success(`Successfully imported ${data.value.description.name}`);
	}
	catch (e) {
		$toast.error("Failed to import this creature");
	}
};

const bestiaryBuilderJson = ref("");
const importBestiaryBuilder = async () => {
	try {
		let creature = JSON.parse(bestiaryBuilderJson.value);
		if (Array.isArray(creature))
			creature = creature[0];
		// Validate input
		const { success, error } = await useFetch("/api/validate/creature", "POST", creature);
		// Succesful?:
		if (success) {
			data.value = creature;
			notices.value = {};
			bestiaryBuilderJson.value = "";
			$toast.success(`Successfully imported ${data.value.description.name}`);
		}
		else {
			$toast.error(error.replaceAll("\n", "<br />"), {
				duration: 0
			});
		}
		showImportModal.value = false;
	}
	catch (e) {
		console.error(e);
		$toast.error("Failed to import this creature");
	}
};

const critterLink = ref("");
const importCritterDB = async () => {
	let link = critterLink.value.trim();
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			$toast.error("Could not recognize link as a link to a CritterDB bestiary");
			return;
		}
	}
	catch {
		$toast.error("Could not recognize link as a link to a CritterDB bestiary");
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	const { success, data: cData, error } = await useFetch(`/api/critterdbcreature/${link}`);
	if (!success) {
		$toast.error(error);
		return;
	}

	data.value = cData as Statblock;
	showImportModal.value = false;
	$toast.success(`Successfully imported ${data.value.description.name}`);
};

const importCreature = async (creature: Statblock) => {
	data.value = creature;
	await saveStatblock(false);
	$toast.success(`Successfully imported ${data.value.description.name}`);
};

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
	const loader = $loading.show();
	const el = document.getElementById("statblock");
	if (!el)
		return;

	el.style = `width: ${type === "2x1 wide" ? "1200" : "800"}px; column-count: ${type === "1x1" ? "1" : "2"};`;
	el.classList.add("toPrint");

	const canvas = await html2canvas(el, { scale: 2 });
	const image = canvas.toDataURL("image/jpeg");
	const link = document.createElement("a");

	link.download = `${data.value.description.name} from BestiaryBuilder (${type}).jpg`;
	link.href = image;
	link.click();
	el.classList.remove("toPrint");
	el.style = "";
	loader.hide();
};

// slide managers for accessibility:
const slideIndex = ref(2);
const tabs = document.getElementsByClassName("editor-nav__tab") as HTMLCollectionOf<HTMLElement>;
const tabsContent = document.getElementsByClassName("editor-content__tab-inner") as HTMLCollectionOf<HTMLElement>;

onMounted(async () => {
	if (typeof ($route.query.pane) == "string") {
		showSlides(Math.max(0, Math.min(6, Math.abs(Number.parseInt($route.query.pane)))));
		await $router.replace({ query: undefined });
	}
	else { showSlides(1); }
});

const showSlides = (n: number) => {
	if (slideIndex.value === n)
		return;

	for (let i = 0; i < tabs.length; i++) {
		const tab = tabs[i];
		if (i !== n - 1) {
			tab.setAttribute("aria-selected", "false");
			tab.tabIndex = -1;
		}
		else {
			tab.setAttribute("aria-selected", "true");
			tab.removeAttribute("tabindex");
			tab.focus();
		}
	}

	for (let i = 0; i < tabsContent.length; i++) {
		if (i !== n - 1)
			tabsContent[i].style.display = "none";
		else
			tabsContent[i].style.display = "block";
	}

	slideIndex.value = n;
};

const moveSlide = (event: KeyboardEvent) => {
	const currentSlide = slideIndex.value;
	let moveToSlide = 0;
	switch (event.key) {
		case "ArrowLeft":
			if (currentSlide === 1)
				moveToSlide = tabs.length;
			else moveToSlide = currentSlide - 1;
			break;

		case "ArrowRight":
			if (currentSlide === tabs.length)
				moveToSlide = 1;
			else moveToSlide = currentSlide + 1;
			break;

		case "Home":
			moveToSlide = 1;
			break;

		case "End":
			moveToSlide = tabs.length;
			break;
	}

	if (moveToSlide) {
		event.stopPropagation();
		event.preventDefault();
		showSlides(moveToSlide);
	}
};
</script>

<template>
	<div>
		<Breadcrumbs
			v-if="bestiary && (data.description.name || data.description.name === '')"
			:routes="[
				{
					path: '../my-bestiaries/',
					text: shouldShowEditor ? 'My Bestiaries' : 'Public Bestiaries',
					isCurrent: false
				},
				{
					path: `../bestiary-viewer/${bestiary?.id}`,
					text: bestiary?.name,
					isCurrent: false
				},
				{
					path: '',
					text: data?.description.name || 'Unnamed Creature',
					isCurrent: true
				}
			]"
		>
			<ButtonIcon v-if="madeChanges && (isOwner || isEditor)" icon="save" label="Save creature" inverted @click="saveStatblock()" />
			<template v-if="!isOwner && !isEditor">
				<ButtonIcon v-if="!shouldShowEditor" icon="eye" label="Toggle editor for debugging purposes" @click="shouldShowEditor = !shouldShowEditor" />
				<ButtonIcon v-else icon="eye-slash" label="Toggle editor for debugging purposes" @click="shouldShowEditor = !shouldShowEditor" />
			</template>

			<CopyManager v-if="rawInfo" no-import-all :may-import="isOwner || isEditor" :current-creature="{ ...rawInfo, bestiaryName: bestiary.name }" @import-creature="(creature) => importCreature(creature)" />
			<ButtonIcon v-if="isOwner || isEditor" icon="arrow-right-to-bracket" label="Import statblock" @click="showImportModal = true" />

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
		<div class="content more-wide" :class="{ 'is-statblock-only': !shouldShowEditor }">
			<div v-show="shouldShowEditor" class="content-container__inner editor">
				<div class="editor-nav" role="tablist" aria-label="Statblock editor tabs">
					<button id="tab-1" :class="{ 'active-slide': slideIndex === 1 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(1)" @keydown="moveSlide">
						Description
					</button>
					<button id="tab-2" :class="{ 'active-slide': slideIndex === 2 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-2" @click="showSlides(2)" @keydown="moveSlide">
						Core
					</button>
					<button id="tab-3" :class="{ 'active-slide': slideIndex === 3 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-3" @click="showSlides(3)" @keydown="moveSlide">
						Stats
					</button>
					<button id="tab-4" :class="{ 'active-slide': slideIndex === 4 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-4" @click="showSlides(4)" @keydown="moveSlide">
						Defenses
					</button>
					<button id="tab-5" :class="{ 'active-slide': slideIndex === 5 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-5" @click="showSlides(5)" @keydown="moveSlide">
						Features
					</button>
					<button id="tab-6" :class="{ 'active-slide': slideIndex === 6 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-6" @click="showSlides(6)" @keydown="moveSlide">
						Spells
					</button>
				</div>

				<div v-if="rawInfo !== null" class="editor-content">
					<DescriptionPanel :data="data" />
					<CorePanel :data="data" />
					<StatsPanel :data="data" />
					<DefensesPanel :data="data" />
					<FeaturesPanel :data="data" :raw-info="rawInfo" />
					<SpellcastingPanel :data="data" :raw-info="rawInfo" />
				</div>
			</div>
			<div class="content-container__inner">
				<Shimmer :loading="rawInfo === null" :template-props="{ data: defaultStatblock }" shimmer-color="orangered">
					<StatblockRenderer id="statblock" :data="data || defaultStatblock" />
				</Shimmer>
			</div>
		</div>

		<Modal :show="showImportModal" @close="showImportModal = false">
			<template #header>
				Import Creatures
			</template>
			<template #body>
				<LabelledComponent title="Bestiary Builder JSON" for="bestiarybuilderjson">
					<p>Insert the JSON as text gotten from clicking export on another creature within Bestiary Builder.</p>
					<div class="two-wide">
						<input id="bestiarybuilderjson" v-model="bestiaryBuilderJson" type="text">
						<button class="btn confirm" @click="importBestiaryBuilder">
							Import
						</button>
					</div>
				</LabelledComponent>
				<hr>
				<LabelledComponent title="5e Tools JSON" for="toolsjson">
					<p>Insert 5e.tools JSON as text into this field, gotten from clicking export on 5e.tools and copying the JSON.</p>
					<div class="two-wide">
						<input id="toolsjson" v-model="toolsjson" type="text">
						<button class="btn confirm" @click.prevent="import5etools">
							Import
						</button>
					</div>
				</LabelledComponent>
				<hr>
				<LabelledComponent title="CritterDB JSON" for="critterjson">
					<p>Insert a CritterDB link to a single creature here.</p>
					<div class="two-wide">
						<input id="critterjson" v-model="critterLink" type="text">
						<button class="btn confirm" @click.prevent="importCritterDB">
							Import
						</button>
					</div>
				</LabelledComponent>

				<div v-if="JSON.stringify(notices) !== '{}'">
					<p class="warning">
						<b>Please note the following for this import:</b>
					</p>
					<p>Some features may not have automation as they should, aka description only features, but some might not have imported correctly or are missing certain parts. It is recommended to review.</p>
					<div v-for="(type, index) in notices" :key="index">
						<h3 v-if="type.length > 0">
							{{ index }}
						</h3>
						<ul v-if="type.length > 0">
							<li v-for="(notice, indexInner) in type" :key="indexInner">
								{{ notice }}
							</li>
						</ul>
					</div>
				</div>
			</template>
		</Modal>
	</div>
</template>

<style scoped lang="less">
.content {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;
}

.content.is-statblock-only {
	grid-template-columns: 1fr;
	.content-container__inner {
		width: 60%;
		margin: auto;
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

.content-container__inner:first-of-type {
	background-color: var(--color-surface-1);
}

.editor-nav {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
	text-align: center;
	height: fit-content;
	margin: 0 1px;
	background-color: rgb(48, 47, 47);
	&__tab {
		padding: 0.4rem 1rem;
		cursor: pointer;
		transition: 0.3s ease-in-out;
		transition-property: color background-color;
		background-color: unset;
		border: unset;
		border-bottom: 1px solid grey;
		color: rgb(201, 201, 201);

		&:hover {
			background-color: var(--color-surface-0);
			color: white;
		}

		&.active-slide {
			border-bottom-color: orangered;
			border-bottom-width: 1px;
			color: white;
			position: relative;
			transition: all 0.3s ease;

			&::before {
				position: absolute;
				bottom: 0;
				left: 0;
				width: 100%;
				height: 2px;
				background-color: orangered;
				content: "";
			}
		}
	}
}
</style>

<style lang="less">
.table-footer {
	.v-select .vs__dropdown-toggle {
		border-width: 0;
		color: darkgrey;
	}
}

@import url("@/assets/styles/mixins.less");
@import url("@/components/StatblockEditor/styles/statblock-editor.less");
</style>
