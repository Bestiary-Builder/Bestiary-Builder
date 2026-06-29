<script setup lang="ts">
import Draggable from "vuedraggable";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { toJpeg } from "html-to-image";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import html2canvas from "html2canvas";
import { toast } from "@/utils/app/toast";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { BestiaryExtended, CreatureWithStats, Features, Statblock } from "~/shared";
import { defaultStatblock, getSpellSlots, getXPbyCR, spellList, spellListFlattened, statFullName } from "~/shared";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";
import { alignments, classLevels, classes, conditionList, creatureTypes, languages, newFeatureGenerator, resistanceList, sizes, stats } from "@/utils/constants";
import SectionHeader from "@/components/VisualEditor/Nodes/shared/SectionHeader.vue";
import CopyManager from "@/components/CopyManager.vue";
import SimpleNumberInput from "@/components/SimpleNumberInput.vue";

const $route = useRoute();
const $router = useRouter();

const data = ref<Statblock>(defaultStatblock);
const rawInfo = ref<CreatureWithStats | null>(null);

// load creature data
onMounted(async () => {
	const loader = $loading.show();
	const { success, data: cData, error } = await useFetch<CreatureWithStats>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => madeChanges.value = false);
		rawInfo.value = cData;
		await loadRawInfo();
		loader.hide();
	}
	else {
		toast.error(`Error: ${error}`);
		madeChanges.value = false;
		await $router.push("/error");
		loader.hide();
	}
});

// ownership
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
		toast.error(error);
	}
};

// saving
const saveStatblock = async (shouldNotify = true): Promise<boolean> => {
	if (!rawInfo.value)
		return false;
	rawInfo.value.stats = data.value;
	const loader = $loading.show();
	// Send to backend
	console.log(data.value);
	const { success, error } = await useFetch<CreatureWithStats>(`/api/creature/${rawInfo.value.id.toString()}/update`, "POST", rawInfo.value);
	if (success) {
		if (shouldNotify)
			toast.success("Saved stat block");
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
		toast.error(`Error saving statblock. ${error}`, { duration: 10000 });
	}
	loader.hide();
	if (success)
		return true;
	return false;
};
// update xp and prof bonus whenever a user changes cr.
watch(() => data.value.description.cr, () => {
	if (rawInfo.value == null)
		return;
	data.value.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.value.description.cr + 3) / 4)) + 1);
	data.value.description.xp = getXPbyCR(data.value.description.cr);
});

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

// document title handling
const setDocumentTitle = () => {
	document.title = `${data.value.description.name.substring(0, 16)} | Bestiary Builder`;
};

watch(() => data.value.description.name, () => {
	setDocumentTitle();
}, { immediate: true });

// draggable stuff
const getDraggableKey = (item: any) => {
	return item;
};

// import
const showImportModal = ref(false);
const notices = ref<{ [key: string]: string[] }>({});
const toolsjson = ref("");

const import5etools = async () => {
	if (toolsjson.value.startsWith("___")) {
		toast.error("You copied the markdown code, not the JSON.");
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
		toast.success(`Successfully imported ${data.value.description.name}`);
	}
	catch (e) {
		toast.error("Failed to import this creature");
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
			toast.success(`Successfully imported ${data.value.description.name}`);
		}
		else {
			toast.error(error.replaceAll("\n", "<br />"), {
				duration: 0
			});
		}
		showImportModal.value = false;
	}
	catch (e) {
		console.error(e);
		toast.error("Failed to import this creature");
	}
};

const critterLink = ref("");
const importCritterDB = async () => {
	let link = critterLink.value.trim();
	try {
		const url = new URL(link);
		if (url.hostname !== "critterdb.com" && !url.hostname.endsWith(".critterdb.com")) {
			toast.error("Could not recognize link as a link to a CritterDB bestiary");
			return;
		}
	}
	catch {
		toast.error("Could not recognize link as a link to a CritterDB bestiary");
		return;
	}

	const linkEls = link.split("/");
	link = linkEls[linkEls.length - 1];

	const { success, data: cData, error } = await useFetch(`/api/critterdbcreature/${link}`);
	if (!success) {
		toast.error(error);
		return;
	}

	data.value = cData as Statblock;
	showImportModal.value = false;
	toast.success(`Successfully imported ${data.value.description.name}`);
};

const importCreature = async (creature: Statblock) => {
	data.value = creature;
	await saveStatblock(false);
	toast.success(`Successfully imported ${data.value.description.name}`);
};

// export
const exportStatblock = async () => {
	const text = JSON.stringify(data.value, null, 2);
	await navigator.clipboard.writeText(text);
	toast.info("Exported this statblock to your clipboard.");
};

const exportHomebrery = async () => {
	try {
		const { success, data: resultData, error } = await useFetch<{ metadata: string }>(
			`/api/homebrewery/export/creature/${$route.params.id.toString()}`,
			"GET"
		);
		if (success) {
			await navigator.clipboard.writeText(resultData.metadata);
			toast.info("Exported this statblock markdown to your clipboard");
		}
		else {
			toast.error(error);
		}
	}
	catch (err) {
		toast.error(err as string);
	}
};

const exportToImage = async () => {
	const loader = $loading.show();
	const filter = (node: HTMLElement) => {
		return true;
		return (node.tagName !== "IMG");
	};

	const doc = document.getElementById("statblock");
	if (!doc)
		return;
	doc.style = "width: 800px; column-count: 2;";

	// The image converter breaks when it encounters css styles imported by monaco. Remove that from the dom, run the function, then add it again.
	const monacoCss = document.head.querySelector(`[data-name="vs/editor/editor.main"]`);
	monacoCss?.remove();

	// convert it to an image
	await toJpeg(doc, { filter, pixelRatio: 2 })
		.then((dataUrl) => {
			const link = document.createElement("a");
			link.download = `${data.value.description.name} from BestiaryBuilder.jpg`;
			link.href = dataUrl;
			link.click();

			// timeout because otherwise the browser download window shows up after the toast is shown.
			setTimeout(() => {
				toast.success("Statblock successfully exported to an image!");
				toast.warning("If the statblock contained images, these were ignored due to technical limitations.");
			}, 1000);
		});

	if (monacoCss)
		document.head.appendChild(monacoCss);
	doc.style = "";
	loader.hide();
};

const exportToImageNew = async (type: "1x1" | "2x1" | "2x1 wide") => {
	const loader = $loading.show();
	const el = document.getElementById("statblock");
	if (!el)
		return;

	el.style = `width: ${type === "2x1 wide" ? "1200" : "800"}px; column-count: ${type === "1x1" ? "1" : "2"};`;
	el.classList.add("toPrint");

	const canvas = await html2canvas(el, { scale: 2 });
	const image = canvas.toDataURL("image/jpeg");
	const link = document.createElement("a");

	link.download = `${data.value.description.name} from BestiaryBuilder.jpg`;
	link.href = image;
	link.click();
	el.classList.remove("toPrint");
	el.style = "";
	loader.hide();
};

// helpers for adding speed or senses
const addNewSpeed = (newSpeedName: string) => {
	if (!newSpeedName) {
		toast.error("No speed chosen.");
		return;
	}
	if (data.value.core.speed.some(obj => obj.name === newSpeedName)) {
		toast.error("You already have this speed.");
		return;
	}
	data.value.core.speed.push({ name: newSpeedName, value: 30, unit: "ft", comment: "" });
};
const addNewSense = (newSenseName: string) => {
	if (!newSenseName) {
		toast.error("No sense chosen.");
		return;
	}
	if (data.value.core.senses.some(obj => obj.name === newSenseName)) {
		toast.error("You already have this sense.");
		return;
	}
	data.value.core.senses.push({ name: newSenseName, value: 30, unit: "ft", comment: "" });
};

// helpers for skills
const deleteSkill = (index: number) => {
	data.value.abilities.skills?.splice(index, 1);
};

const addNewSkill = (newSkillName: string) => {
	if (!newSkillName) {
		toast.error("No skill chosen.");
		return;
	}
	if (data.value.abilities.skills.some(obj => obj.skillName === newSkillName)) {
		toast.error("You already have this skill.");
		return;
	}

	data.value.abilities.skills.push({
		skillName: newSkillName,
		isHalfProficient: false,
		isProficient: true,
		isExpertise: false,
		override: null,
		adv: null
	});
};

// helpers for features
const deleteFeature = (type: keyof Features, index: number) => {
	data.value.features[type].splice(index, 1);
};
const createNewFeature = (type: keyof Features) => {
	// TODO: .push instead?
	data.value.features[type].push({
		name: `New Feature ${data.value.features[type].length + 1}`,
		description: "",
		automation: null
	});
};

// helpers for spells
const showSpellModal = ref(false);

const spellLevelList = computed((): number[] => {
	const sClass = data.value.spellcasting.casterSpells.castingClass;
	const slots = data.value.spellcasting.casterSpells.spellSlotList;

	if (sClass === "Warlock" && slots) {
		// @ts-expect-error It's complicated
		return Array.from({ length: Object.keys(slots)[0] }, (_, index) => index + 1);
	}
	if (slots)
		return Object.keys(slots).map(str => Number.parseInt(str));
	return [];
});

const getSpellsByLevel = (level: number): string[] => {
	// this function is needed for typescript.
	if (level < 0 || level > 9)
		return [];
	return spellList[level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9];
};

// helpers for managing spellcasting
const clearCasting = () => {
	data.value.spellcasting.casterSpells = defaultStatblock.spellcasting.casterSpells;
};

watch(() => data.value.spellcasting.casterSpells.casterLevel, (newValue) => {
	if (rawInfo.value == null)
		return;
	if (newValue == null || newValue === undefined) {
		clearCasting();
		return;
	}
	// set spell slots when they change level
	data.value.spellcasting.casterSpells.spellSlotList = getSpellSlots(data.value.spellcasting.casterSpells.castingClass, data.value.spellcasting.casterSpells.casterLevel);
});

watch(() => data.value.spellcasting.casterSpells.castingClass, (newValue) => {
	if (rawInfo.value == null)
		return;
	data.value.spellcasting.casterSpells.castingClass = newValue;

	const sClass = data.value.spellcasting.casterSpells.castingClass;
	switch (sClass) {
		case "Artificer":
		case "Wizard":
			data.value.spellcasting.casterSpells.spellCastingAbility = "int";
			break;
		case "Cleric":
		case "Druid":
		case "Ranger":
			data.value.spellcasting.casterSpells.spellCastingAbility = "wis";
			break;
		default:
			data.value.spellcasting.casterSpells.spellCastingAbility = "cha";
	}
	// set spell slots in case they changed full caster/half caster/arti half/warlock
	console.log(sClass, data.value.spellcasting.casterSpells.spellSlotList);
	data.value.spellcasting.casterSpells.spellSlotList = getSpellSlots(sClass, data.value.spellcasting.casterSpells.casterLevel);
	console.log(sClass, data.value.spellcasting.casterSpells.spellSlotList);
});

const newDailyAmount = ref<number | null>(null);

const addNewDaily = () => {
	if (!newDailyAmount.value) {
		toast.error("You did not choose an amount per day");
		return;
	}
	if (newDailyAmount.value >= 4)
		data.value.spellcasting.innateSpells.spellList[newDailyAmount.value] = [];
	newDailyAmount.value = null;
};

const showSpellSlotModal = ref(false);

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

// utils
const changeCR = (isIncrease: boolean) => {
	let cr = data.value.description.cr;

	if (cr === 0 && isIncrease) {
		cr = 0.125;
	}
	else if (cr === 0.125 && isIncrease) {
		cr = 0.25;
	}
	else if (cr === 0.25 && isIncrease) {
		cr = 0.5;
	}
	else if (cr === 0.5 && isIncrease) {
		cr = 1;
	}
	else if (cr === 0.125 && !isIncrease) {
		cr = 0;
	}
	else if (cr === 0.25 && !isIncrease) {
		cr = 0.125;
	}
	else if (cr === 0.5 && !isIncrease) {
		cr = 0.25;
	}
	else if (cr === 1 && !isIncrease) {
		cr = 0.5;
	}
	else {
		if (isIncrease)
			cr = Math.min(30, cr + 1);
		else cr = Math.max(0, cr - 1);
	}

	data.value.description.cr = cr;
};

const selectedSpell = ref({
	0: null,
	1: null,
	2: null,
	3: null
} as any);

watch(selectedSpell, () => {
	for (const x in selectedSpell.value)
		selectedSpell.value[x] = null;
}, { deep: true });

const openFeature = async (path: string) => {
	const didSave = await saveStatblock(false);
	if (didSave)
		await $router.push(path);
	else
		toast.error("Cannot open action while creature cannot save.");
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
			<button v-if="madeChanges && (isOwner || isEditor)" v-tooltip="'Save creature!'" class="inverted" aria-label="Save creature" @click="saveStatblock()">
				<font-awesome-icon :icon="['fas', 'save']" />
			</button>
			<button v-if="!isOwner && !isEditor" v-tooltip="'Toggle Editor for debugging purposes'" aria-label="Toggle Editor for debugging purposes" @click="shouldShowEditor = !shouldShowEditor">
				<font-awesome-icon v-if="!shouldShowEditor" :icon="['fas', 'eye']" />
				<font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
			</button>
			<CopyManager v-if="rawInfo" no-import-all :may-import="isOwner || isEditor" :current-creature="{ ...rawInfo, bestiaryName: bestiary.name }" @import-creature="(creature) => importCreature(creature)" />

			<button v-if="isOwner || isEditor" v-tooltip="'Import a creature\'s statblock'" aria-label="Import a creature's statblock" @click="showImportModal = true">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>
			<VDropdown :distance="6" :positioning-disabled="store.isMobile">
				<button v-tooltip="'Export statblock'" aria-label="Export statblock">
					<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
				</button>
				<template #popper>
					<div class="v-popper__custom-menu">
						<span>
							Export this creature
						</span>
						<button v-close-popper class="btn confirm" @click="exportStatblock">
							JSON
						</button>
						<button v-close-popper class="btn confirm" @click="exportToImageNew('1x1')">
							1x1
						</button>
						<button v-close-popper class="btn confirm" @click="exportToImageNew('2x1')">
							2x1
						</button>
						<button v-close-popper class="btn confirm" @click="exportToImageNew('2x1 wide')">
							2x1 wide
						</button>
						<button v-close-popper class="btn confirm" @click="exportHomebrery">
							Homebrewery
						</button>
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
					<button id="tab-2" :class="{ 'active-slide': slideIndex === 2 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(2)" @keydown="moveSlide">
						Core
					</button>
					<button id="tab-3" :class="{ 'active-slide': slideIndex === 3 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(3)" @keydown="moveSlide">
						Stats
					</button>
					<button id="tab-4" :class="{ 'active-slide': slideIndex === 4 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(4)" @keydown="moveSlide">
						Defenses
					</button>
					<button id="tab-5" :class="{ 'active-slide': slideIndex === 5 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(5)" @keydown="moveSlide">
						Features
					</button>
					<button id="tab-6" :class="{ 'active-slide': slideIndex === 6 }" class="editor-nav__tab" role="tab" aria-controls="tabpanel-1" @click="showSlides(6)" @keydown="moveSlide">
						Spells
					</button>
				</div>

				<div class="editor-content">
					<div id="tabpanel-1" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-1">
						<div class="editor-field__container three-wide">
							<LabelledComponent title="Creature name" for="creaturename">
								<input id="creaturename" v-model="data.description.name" type="text" :maxlength="store.limits?.nameLength">
							</LabelledComponent>

							<LabelledComponent title="Image URL" for="imageurl">
								<div style="display: flex; gap: .3rem;">
									<input id="imageurl" v-model="data.description.image" type="text" :pattern="store.limits?.imageFormats ? `(https:\/\/)(.+)(\\.${store.limits?.imageFormats.join('|\\.')})` : ''">
									<VDropdown :distance="6" :positioning-disabled="store.isMobile">
										<button v-tooltip="'Preview image'" aria-label="Preview image" class="preview-icon">
											<font-awesome-icon :icon="['fas', 'eye']" />
										</button>
										<template #popper>
											<div class="v-popper__custom-menu">
												<img :src="data.description.image" style="width: 200px; height: auto">
											</div>
										</template>
									</VDropdown>
								</div>
							</LabelledComponent>
							<LabelledComponent title="Proper Noun" for="propernoun">
								<span>
									<input id="propernoun" v-model="data.description.isProperNoun" type="checkbox"> <label for="propernoun">Toggles display as "{{ data.description.name }}" instead of "the {{ data.description.name }}"? </label>
								</span>
							</LabelledComponent>
						</div>

						<div class="editor-field__container one-wide">
							<LabelledComponent title="Description" for="description">
								<textarea id="description" v-model="data.description.description" rows="5" :maxlength="store.limits?.descriptionLength" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container three-wide">
							<LabelledComponent title="Size" takes-custom-text-input for="size">
								<v-select v-model="data.core.size" :options="sizes" :taggable="true" :push-tags="true" input-id="size" />
							</LabelledComponent>
							<LabelledComponent title="Race" takes-custom-text-input for="race">
								<v-select v-model="data.core.race" :options="creatureTypes" :taggable="true" :push-tags="true" input-id="race" />
							</LabelledComponent>
							<LabelledComponent title="Alignment" takes-custom-text-input for="alignment">
								<v-select
									v-model="data.description.alignment"
									:options="alignments"
									:taggable="true"
									:push-tags="true"
									input-id="alignment"
								/>
							</LabelledComponent>
						</div>
						<div class="editor-field__container three-wide">
							<div class="flow-vertically">
								<label class="editor-field__title" for="challengerating"><span class="text"> Challenge rating</span></label>
								<div class="quantity">
									<input id="challengerating" v-model="data.description.cr" type="number" min="0" max="30" inputmode="numeric">
									<div class="quantity-nav">
										<div class="quantity-button quantity-up" aria-label="Increase CR" @click="changeCR(true)">
											+
										</div>
										<div class="quantity-button quantity-down" aria-label="Decrease CR" @click="changeCR(false)">
											-
										</div>
									</div>
								</div>
							</div>

							<LabelledNumberInput v-model="data.core.proficiencyBonus" :min="0" title="Proficiency Bonus" :step="1" label-id="proficiencyBonus" />
							<LabelledNumberInput v-model="data.description.xp" :min="0" :step="1" title="Experience Points" label-id="experience" />
						</div>
						<div class="editor-field__container three-wide">
							<LabelledComponent title="Environment" for="environment">
								<input id="environment" v-model="data.description.environment" type="text">
							</LabelledComponent>
							<LabelledComponent title="Faction" for="faction">
								<input id="faction" v-model="data.description.faction" type="text">
							</LabelledComponent>
						</div>
					</div>
					<div id="tabpanel-2" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-2">
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Race" takes-custom-text-input for="race">
								<v-select v-model="data.core.race" :options="creatureTypes" :taggable="true" :push-tags="true" input-id="race" />
							</LabelledComponent>
							<LabelledComponent title="Size" takes-custom-text-input for="size">
								<v-select v-model="data.core.size" :options="sizes" :taggable="true" :push-tags="true" input-id="size" />
							</LabelledComponent>
						</div>
						<SectionHeader title="Speed" />
						<table class="list-table speed-senses">
							<thead>
								<tr>
									<td> Order </td>
									<th>
										Speed
									</th>
									<td>
										Value
									</td>
									<td>
										Unit
									</td>
									<td>
										Comment
									</td>
									<td>
										Delete
									</td>
								</tr>
							</thead>
							<Draggable :list="data.core.speed" group="speed" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
								<template #item="{ element, idx }">
									<tr>
										<td>
											<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
										</td>
										<th> {{ element.name }}</th>
										<td>
											<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
										</td>
										<td>
											<select v-model="element.unit" class="ghost" title="Select speed unit">
												<option>ft</option>
												<option>m</option>
												<option>km</option>
												<option>mi</option>
												<option>none</option>
											</select>
										</td>
										<td>
											<input v-model="element.comment" type="text" placeholder="comment" style="width: 100%; padding: 6px; height: unset">
										</td>
										<td class="edit-buttons">
											<div>
												<font-awesome-icon :icon="['fas', 'eraser']" @click="data.core.speed.splice(idx, 1)" />
											</div>
										</td>
									</tr>
								</template>
							</Draggable>
						</table>
						<div class="two-wide">
							<LabelledComponent title="Add speed" takes-custom-text-input for="addspeed">
								<v-select :options="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" :taggable="true" :push-tags="true" input-id="addspeed" placeholder="Select speed" @option:selected="(selected : string) => (addNewSpeed(selected))" />
							</LabelledComponent>
							<div />
						</div>

						<SectionHeader title="Senses" />
						<table class="list-table speed-senses">
							<thead>
								<tr>
									<td> Order </td>
									<th>
										Sense
									</th>
									<td>
										Value
									</td>
									<td>
										Unit
									</td>
									<td>
										Comment
									</td>
									<td>
										Delete
									</td>
								</tr>
							</thead>
							<Draggable :list="data.core.senses" group="senses" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
								<template #item="{ element, idx }">
									<tr>
										<td>
											<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
										</td>
										<th> {{ element.name }}</th>
										<td>
											<SimpleNumberInput v-model="element.value" :min="0" :step="5" :label="element.name" />
										</td>
										<td>
											<select v-model="element.unit" class="ghost" title="Select speed unit">
												<option>ft</option>
												<option>m</option>
												<option>km</option>
												<option>mi</option>
												<option>none</option>
											</select>
										</td>
										<td>
											<input v-model="element.comment" type="text" placeholder="comment" style="width: 100%; padding: 6px; height: unset">
										</td>
										<td class="edit-buttons">
											<div>
												<font-awesome-icon :icon="['fas', 'eraser']" @click="data.core.speed.splice(idx, 1)" />
											</div>
										</td>
									</tr>
								</template>
							</Draggable>
						</table>
						<div class="two-wide" style="margin-bottom: 2rem;">
							<LabelledComponent title="Add sense" takes-custom-text-input for="addsense">
								<v-select :options="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" :taggable="true" :push-tags="true" input-id="addsense" placeholder="Select sense" @option:selected="(selected : string) => (addNewSense(selected))" />
							</LabelledComponent>
							<LabelledNumberInput v-model="data.misc.passivePerceptionOverride" title="Passive perception override" :step="1" :is-clearable="true" label-id="passivePercOverride" />
						</div>

						<SectionHeader title="Miscellaneous" />
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Languages" takes-custom-text-input for="languages">
								<v-select v-model="data.core.languages" placeholder="Select a Language or type one" multiple :deselect-from-dropdown="true" :close-on-select="false" :options="languages" :taggable="true" :push-tags="true" input-id="languages" />
							</LabelledComponent>
							<LabelledNumberInput v-model="data.misc.telepathy" title="Telepathy" label-id="telepathy" />
						</div>
					</div>

					<div id="tabpanel-3" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-3">
						<SectionHeader title="Ability Scores & Saving Throws" />
						<div>
							<table class="list-table">
								<thead>
									<tr>
										<th> Ability </th>
										<td> Value </td>
										<td> Save Prof</td>
										<td> Save Adv </td>
										<td> Save Override</td>
									</tr>
								</thead>
								<tbody>
									<tr v-for="name, stat of statFullName" :key="stat">
										<th scope="row">
											{{ store.isMobile ? stat : name }}
										</th>
										<td>
											<SimpleNumberInput v-model="data.abilities.stats[stat]" :min="0" :label="name" :label-id="stat" />
										</td>
										<td>
											<input v-model="data.abilities.saves[stat].isProficient" type="checkbox" :is-clearable="true">
										</td>
										<td>
											<select v-model="data.abilities.saves[stat].adv" class="ghost" title="Select advantage or disadvantage for this save">
												<option :value="null">
													None
												</option> <option :value="true">
													Adv
												</option> <option :value="false">
													Dis
												</option>
											</select>
										</td>
										<td v-if="data.abilities.saves[stat].override === null" style="cursor: pointer;" @click="data.abilities.saves[stat].override = 1">
											-
										</td>
										<td v-else>
											<SimpleNumberInput v-model="data.abilities.saves[stat].override" :label="`${name} save override`" :label-id="`${stat}Override`" is-clearable />
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<SectionHeader title="Skills" />
						<div>
							<table class="list-table" style="margin-bottom: 1rem;">
								<thead>
									<tr>
										<th> Ability </th>
										<td> Prof / Exp / <span style="font-size: 8px">1/2</span>Prof </td>
										<td> Adv </td>
										<td> Override</td>
										<td> Delete </td>
									</tr>
								</thead>
								<tbody>
									<tr v-for="skill, idx of data.abilities.skills" :key="skill.skillName">
										<th scope="row">
											{{ skill.skillName }}
										</th>
										<td>
											<div style="display: flex; gap: .5rem; justify-content: center; align-items: center;">
												<input v-model="skill.isProficient" type="checkbox" :is-clearable="true" class="round" @click="skill.isExpertise = false; skill.isHalfProficient = false">
												<input v-model="skill.isExpertise" type="checkbox" :is-clearable="true" class="round" @click="skill.isProficient = false; skill.isHalfProficient = false">
												<input v-model="skill.isHalfProficient" type="checkbox" :is-clearable="true" class="round" @click="skill.isExpertise = false; skill.isProficient = false">
											</div>
										</td>
										<td>
											<select v-model="skill.adv" class="ghost" title="Select advantage or disadvantage for this save">
												<option :value="null">
													None
												</option> <option :value="true">
													Adv
												</option> <option :value="false">
													Dis
												</option>
											</select>
										</td>
										<td v-if="skill.override === null" style="cursor: pointer;" @click="skill.override = 1">
											-
										</td>
										<td v-else>
											<SimpleNumberInput v-model="skill.override" :label="`${skill.skillName} save override`" :label-id="`${skill.skillName}Override`" is-clearable />
										</td>
										<td>
											<div>
												<font-awesome-icon :icon="['fas', 'eraser']" @click="deleteSkill(idx)" />
											</div>
										</td>
									</tr>
								</tbody>
							</table>
							<div class="two-wide">
								<LabelledComponent title="Add new skill" for="addnewskill">
									<v-select
										placeholder="Select skill"
										:options="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Charisma', 'Constitution', 'Deception', 'Dexterity', 'History', 'Initiative', 'Insight', 'Intelligence', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Strength', 'Survival', 'Wisdom']"
										input-id="addnewskill"
										@option:selected="(selected : string) => (addNewSkill(selected))"
									/>
								</LabelledComponent>
							</div>
						</div>
					</div>
					<div id="tabpanel-4" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-4">
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.defenses.hp.sizeOfHitDie" title="Hit Die Size" :step="2" label-id="hitDieSize" />
							<LabelledNumberInput v-model="data.defenses.hp.numOfHitDie" title="Hit Die Number" :step="1" label-id="hitDieNumber" />
							<LabelledNumberInput v-model="data.defenses.hp.override" title="HP Override" :step="1" :is-clearable="true" label-id="hpOverride" />
						</div>
						<div class="editor-field__container two-wide">
							<LabelledNumberInput v-model="data.defenses.ac.ac" title="Armor Class" :step="1" label-id="armorClass" />
							<LabelledComponent title="Armor Class source" for="armorclasssource">
								<input id="armorclasssource" v-model="data.defenses.ac.acSource" type="text">
							</LabelledComponent>
						</div>

						<SectionHeader title="Resistances" />
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Vulnerabilities" takes-custom-text-input for="vulnerabilities">
								<v-select v-model="data.defenses.vulnerabilities" placeholder="Type vulnerabilities..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="vulnerabilities" />
							</LabelledComponent>
							<LabelledComponent title="Resistances" takes-custom-text-input for="resistances">
								<v-select v-model="data.defenses.resistances" placeholder="Type resistances..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="resistances" />
							</LabelledComponent>
							<LabelledComponent title="Immunities" takes-custom-text-input for="immunities">
								<v-select v-model="data.defenses.immunities" placeholder="Type immunities..." multiple :deselect-from-dropdown="true" :close-on-select="false" :options="resistanceList" :taggable="true" :push-tags="true" input-id="immunities" />
							</LabelledComponent>
							<LabelledComponent title="Condition Immunities" takes-custom-text-input for="conditionimmunities">
								<v-select
									v-model="data.defenses.conditionImmunities"
									placeholder="Type condition immunities..."
									multiple
									:deselect-from-dropdown="true"
									:close-on-select="false"
									:options="conditionList"
									:taggable="true"
									:push-tags="true"
									input-id="conditionimmunities"
								/>
							</LabelledComponent>
						</div>
					</div>
					<div id="tabpanel-5" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-5">
						<div v-for="(descText, fType) in newFeatureGenerator" :key="fType">
							<SectionHeader :title="`${descText.replace('New ', '').replace('Feature', 'Trait')}s`" />

							<table class="list-table features">
								<thead>
									<tr>
										<td> Order </td>
										<th>
											Action
										</th>
										<td>
											Options
										</td>
									</tr>
								</thead>
								<Draggable :list="data.features[fType]" group="features" :item-key="getDraggableKey" :animation="150" tag="tbody" class=".handle">
									<template #item="{ element, index }">
										<tr>
											<td>
												<span><font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> </span>
											</td>
											<th> {{ element.name }}</th>
											<td class="edit-buttons">
												<div>
													<a :to="`${rawInfo?.id}/${fType}/${index}`" @click="openFeature(`${rawInfo?.id}/${fType}/${index}`)">
														<font-awesome-icon :icon="['fas', 'edit']" />
													</a>
													<span class="delete-button" aria-label="Delete feature" @click="deleteFeature(fType, index)"><font-awesome-icon :icon="['fas', 'trash']" /></span>
												</div>
											</td>
										</tr>
									</template>
									<template #footer>
										<tr class="table-footer">
											<td />
											<th style="cursor: pointer;" @click="createNewFeature(fType)">
												Add {{ descText }}
											</th>
											<td>
												<span :id="descText" class="button-icon" @click="createNewFeature(fType)">
													<font-awesome-icon :icon="['fas', 'plus']" />
												</span>
											</td>
										</tr>
										<tr class="table-footer">
											<td />
											<th>
												Edit feature header description
											</th>
											<td class="edit-buttons">
												<VDropdown :distance="6" :positioning-disabled="store.isMobile">
													<button v-tooltip="'Export statblock'" aria-label="Export statblock" class="btn-icon" style="color: orangered; margin: 0px; font-size: smaller; padding: 0">
														<font-awesome-icon :icon="['fas', 'edit']" />
													</button>
													<template #popper>
														<div class="v-popper__custom-menu">
															<span style="color: lightgray"> You can set text to show at<br> the top of each section here.</span>
															<textarea :id="fType" v-model="data.misc.featureHeaderTexts[fType]" style="min-width: 300px" />
														</div>
													</template>
												</VDropdown>
											</td>
										</tr>
										<tr v-if="fType === 'legendary' && data.features[fType].length > 0" class="table-footer">
											<td />
											<th>
												Legendary actions per round
											</th>
											<td>
												<VDropdown :distance="6" :positioning-disabled="store.isMobile">
													<button v-tooltip="'Export statblock'" aria-label="Export statblock" class="btn-icon" style="color: orangered; margin: 0px; font-size: smaller; padding: 0">
														<font-awesome-icon :icon="['fas', 'edit']" />
													</button>
													<template #popper>
														<div class="v-popper__custom-menu">
															<LabelledNumberInput v-model="data.misc.legActionsPerRound" title="Legendary actions per round" :step="1" :min="0" />
														</div>
													</template>
												</VDropdown>
											</td>
										</tr>
									</template>
								</Draggable>
							</table>
						</div>
					</div>
					<div id="tabpanel-6" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-6">
						<SectionHeader title="Innate Spellcasting" />
						<div class="editor-field__container three-wide">
							<LabelledComponent title="Casting ability" for="castingability">
								<v-select v-model="data.spellcasting.innateSpells.spellCastingAbility" :options="stats" input-id="castingability" />
							</LabelledComponent>
							<LabelledComponent title="Not these components" for="notthesecomponents">
								<v-select v-model="data.spellcasting.innateSpells.noComponentsOfType" :options="['Material', 'Verbal', 'Somatic']" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="notthesecomponents" />
							</LabelledComponent>
							<LabelledComponent title="Display as action?" for="displayasaction">
								<span> <input id="displayasaction" v-model="data.spellcasting.innateSpells.displayAsAction" type="checkbox"> <label for="displayasaction">Toggles display as action</label> </span>
							</LabelledComponent>
						</div>
						<!-- <TransitionGroup name="list">
							<template v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times">
								<LabelledComponent :title="times === '0' ? 'At will' : `${times}/day`" takes-custom-text-input :for="`innateSpellTimes${times}`">
									<div :class="{ 'select-with-delete': parseInt(times.toString()) > 3 }">
										<v-select v-model="data.spellcasting.innateSpells.spellList[times]" :reduce="(sp : any) => ({ spell: sp.spell ?? sp, comment: sp.comment ?? '' })" width="100%" label="spell" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" :input-id="`innateSpellTimes${times}`" :taggable="true" :push-tags="true" />
										<font-awesome-icon v-if="parseInt(times.toString()) > 3" v-tooltip="'Delete this daily amount'" :icon="['fas', 'trash']" class="delete-button button-icon" @click="delete data.spellcasting.innateSpells.spellList[times]" />
									</div>
								</LabelledComponent>
							</template>
						</TransitionGroup> -->
						<table class="list-table">
							<thead>
								<tr>
									<th> T/Day</th>
									<td> Spell </td>
									<td> Comment </td>
								</tr>
							</thead>
							<tbody>
								<template v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times">
									<tr v-for="spell, idx in data.spellcasting.innateSpells.spellList[times]" :key="idx">
										<th v-if="idx === 0" :rowspan="data.spellcasting.innateSpells.spellList[times].length + 1" style="color: lightgray; text-align: center;">
											{{ times === '0' ? 'At Will' : `${times}/Day` }}
										</th>
										<td style="text-align: left">
											{{ spell.spell }}
										</td>
										<td>
											<input :id="`editSpell${spell.spell}`" v-model="spell.comment" type="text" placeholder="comment">
										</td>
									</tr>
									<tr class="table-footer">
										<th v-if="data.spellcasting.innateSpells.spellList[times].length === 0">
											Add spell for {{ times === '0' ? 'At Will' : `${times}/Day` }}
										</th>
										<td>
											<!-- <v-select v-model="data.spellcasting.innateSpells.spellList[times]" :reduce="(sp : any) => ({ spell: sp.spell ?? sp, comment: sp.comment ?? '' })" width="100%" label="spell" :options="spellListFlattened" multiple :close-on-select="false" :input-id="`innateSpellTimes${times}`" :taggable="true" :push-tags="true" /> -->
											<v-select
												v-model="selectedSpell[times as any]"
												:options="spellListFlattened"
												input-id="addnewspell"
												taggable
												:clear-search-on-select="false"
												placeholder="Add spell..."
												@option:selected="(sp : any) => (data.spellcasting.innateSpells.spellList[times].push({ spell: sp, comment: '' }))"
											/>
										</td>
										<td />
									</tr>
								</template>
							</tbody>
						</table>
						<div class="editor-field__container three-wide">
							<LabelledComponent title="Add daily amount" for="innateSpellDailyAmount">
								<LabelledNumberInput v-model="newDailyAmount" title="" :min="4" :step="1" :is-clearable="true" label-id="innateSpellDailyAmount" />
								<button class="btn" @click="addNewDaily()">
									Add
								</button>
							</LabelledComponent>

							<LabelledComponent title="Is psionics?" for="ispsionics">
								<span> <input id="ispsionics" v-model="data.spellcasting.innateSpells.isPsionics" type="checkbox"> <label for="ispsionics">Toggles display as psionics</label>  </span>
							</LabelledComponent>

							<LabelledComponent title="Edit specific spells" for="editspells">
								<button id="editspells" class="btn" @click="showSpellModal = true">
									Edit cast level/add comment
								</button>
							</LabelledComponent>
							<LabelledComponent title="Description override" for="innateDescription">
								<textarea id="innateDescription" v-model="data.spellcasting.innateSpells.customDescription" rows="2" :maxlength="store.limits?.descriptionLength" />
							</LabelledComponent>

							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" label-id="innateSpellDcOverride" />
							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellBonusOverride" title="Attack bonus override" :step="1" :is-clearable="true" label-id="innateSpellBonusOverride" />
						</div>

						<SectionHeader title="Class Spellcasting" />
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Class" for="castingClass">
								<v-select v-model="data.spellcasting.casterSpells.castingClass" :options="classes" input-id="castingClass" />
							</LabelledComponent>
							<LabelledComponent title="Class level" for="classLevel">
								<v-select v-model="data.spellcasting.casterSpells.casterLevel" :options="classLevels" input-id="classLevel" />
							</LabelledComponent>

							<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" label-id="spellDcOverride" />
							<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellBonusOverride" title="Attack bonus override" :step="1" label-id="spellBonusOverride" />
							<LabelledComponent title="Description override" for="casterDescription">
								<textarea id="casterDescription" v-model="data.spellcasting.casterSpells.customDescription" rows="2" :maxlength="store.limits?.descriptionLength" />
							</LabelledComponent>

							<LabelledComponent title="Edit spell slots" for="editspellslots">
								<button id="editspellslots" class="btn" @click="showSpellSlotModal = true">
									Edit spell slot amount
								</button>
							</LabelledComponent>
						</div>
						<div v-if="data.spellcasting.casterSpells.castingClass" class="editor-field__container two-wide">
							<LabelledComponent v-if="!['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass)" title="Cantrips" takes-custom-text-input for="cantrips">
								<v-select v-model="data.spellcasting.casterSpells.spellList[0]" :options="spellList[0]" multiple :deselect-from-dropdown="true" :close-on-select="false" :taggable="true" :push-tags="true" input-id="cantrips" />
							</LabelledComponent>
							<LabelledComponent v-for="level in spellLevelList" :key="level" :title="`Level ${level}`" takes-custom-text-input :for="`spellLevel${level}`">
								<v-select v-model="data.spellcasting.casterSpells.spellList[level]" :options="getSpellsByLevel(level)" multiple :deselect-from-dropdown="true" :close-on-select="false" :taggable="true" :push-tags="true" :title="`Level ${level}`" :input-id="`spellLevel${level}`" />
							</LabelledComponent>
						</div>
					</div>
				</div>
				<hr>
				<!-- <div class="buttons">
					<button class="btn" :class="{ confirm: madeChanges }" @click="saveStatblock">
						Save statblock
					</button>
				</div> -->
			</div>
			<div class="content-container__inner">
				<StatblockRenderer id="statblock" :data="data" />
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

		<Modal :show="showSpellModal" @close="showSpellModal = false">
			<template #header>
				Edit Innate Spellcasting list
			</template>
			<template #body>
				<p>You can use this to add text to specific spells such as "self only" or "at 5th level".</p>
				<div class="two-wide">
					<template v-for="times in data.spellcasting.innateSpells.spellList" :key="times">
						<template v-if="times.length > 0">
							<LabelledComponent v-for="(spell, index) in times" :key="index" :title="spell.spell" :for="`editSpell${spell.spell}`">
								<input :id="`editSpell${spell.spell}`" v-model="spell.comment" type="text" placeholder="comment">
							</LabelledComponent>
						</template>
					</template>
				</div>
			</template>
		</Modal>

		<Modal :show="showSpellSlotModal" @close="showSpellSlotModal = false">
			<template #header>
				Edit Spell Slot Amount
			</template>
			<template #body>
				<p>You can use this to edit how many spell slots a creature has. <br> Note that changing a creature's spellcasting level or class will reset this. </p>
				<div v-if="data.spellcasting.casterSpells.spellSlotList" class="two-wide">
					<template v-for="x in 9" :key="x">
						<LabelledNumberInput v-model="data.spellcasting.casterSpells.spellSlotList[x]" :title="`Level ${x}`" :min="0" :max="9" :step="1" :label-id="`editSpellSlot${x}`" />
					</template>
				</div>
			</template>
		</Modal>
	</div>
</template>

<style scoped lang="less">
@import url("@/assets/styles/number-input.less");
@import url("@/assets/styles/mixins.less");
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

@media screen and (max-width: 1080px) {
	.editor-nav {
		grid-template-columns: 1fr 1fr 1fr;
	}
}
.two-wide {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.editor-content {
	padding: 0.5rem 1rem;

	&__tab-inner {
		background-color: var(--color-surface-1);

		.group-header {
			text-align: center;
			letter-spacing: -1px;
			margin-bottom: 0.5rem;
			border-bottom: 2px dotted var(--border-color-base);
		}

		.editor-field__container {
			width: 100%;
			display: grid;
			gap: 1rem 2rem;
			margin-bottom: 1rem;

			.flow-vertically {
				display: flex;
				flex-direction: column;
				gap: 0.3rem;

				.button-container p {
					display: flex;
					justify-content: space-between;
				}
			}

			.editor-field__title .text {
				font-weight: bold;
				text-decoration: underline;
			}

			&.one-wide {
				grid-template-columns: 1fr;
			}
			&.two-wide {
				grid-template-columns: 1fr 1fr;
			}

			&.three-wide {
				grid-template-columns: 1fr 1fr 1fr;
			}
		}
	}
}

.button-icon {
	cursor: pointer;
	color: orangered;
	.scale-on-hover(1.2);
}

.feature-button__container {
	display: flex;
	gap: 0.5rem;
	justify-content: start;

	.delete-button {
		.button-icon();
	}

	.handle {
		.button-icon();
		translate: 0 2px;
	}
}

@media screen and (max-width: 1080px) {
	.editor-content__tab-inner .editor-field__container.three-wide {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 950px) {
	.editor-content__tab-inner
		.editor-field__container:is(.two-wide, .three-wide) {
		grid-template-columns: 1fr;
	}
}
.scale-in {
	-webkit-animation: scale-in 0.2s ease-in-out;
	-moz-animation: scale-in 0.2s ease-in-out;
	animation: scale-in 0.2s ease-in-out;
}

@keyframes scale-in {
	0% {
		transform: scale(1);
		opacity: 0;
	}
	50% {
		transform: scale(1);
		opacity: 0.5;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

.buttons {
	display: grid;
	gap: 1rem;
	grid-template-columns: 1fr;
	margin: 1rem 25%;

	:disabled {
		cursor: not-allowed;
	}
}

.handle {
	padding-top: 0px;
	padding-bottom: 0px;
	cursor: grab;
	color: orangered;

	&:active {
		cursor: grabbing;
	}
}

.unit-selector {
	height: 40px;
	translate: 0 5px;
}

.notice-dot {
	position: absolute;
	width: 12px;
	height: 12px;
	top: -10%;
	background: red;
	border-radius: 50%;
	right: -10%;
}

.select-with-delete {
	display: flex;

	.v-select {
		width: 90%;
	}

	.button-icon {
		justify-content: center;
		translate: 0 -5px;
	}
}

.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease-in-out;
}

.list-enter-from {
	opacity: 0;
	translate: 0 10px;
}
.list-leave-to {
	opacity: 0;
	translate: 0 -10px;
}

.preview-icon {
	padding: 0;
	border: unset;
	background: unset;
	position: relative;
	cursor: pointer;
	background: transparent;
	border-radius: 50%;
	padding: 0.3rem;
	height: 1.5rem;
	width: 1.5rem;
	aspect-ratio: 1;
	color: grey;
	transition: all ease 0.3s;

	svg {
		scale: 1.1;
		translate: 0 -2px;
	}
	&:hover {
		color: var(--color-surface-0);
	}
}

.list-table {
	width: 100%;
	table-layout: fixed;
	overflow-wrap: break-word;
	display: table;
	margin-bottom: 1rem;
	select {
		font-size: small;
		max-width: 80%;
	}

	tbody th {
		color: orangered;
		overflow-wrap: normal;
	}

	th,
	td {
		padding: 2px 4px;
	}

	.edit-buttons div {
		display: inline-flex;
		flex-direction: row;
		gap: 1em;
		justify-content: center;
		color: orangered;
		a {
			color: orangered;
		}
	}
}

.list-table ~ .two-wide {
	margin-bottom: 2rem;
}

.list-table.features {
	table-layout: auto;
	color: var(--color-base) !important;
	margin-bottom: 2rem;
	th,
	td {
		color: var(--color-base);
	}

	tbody th {
		padding-left: 12px;
	}
}

tr.table-footer {
	th {
		color: gray !important;
	}
}
.list-table.speed-senses {
	color: var(--color-base) !important;
	th,
	td {
		color: var(--color-base);
	}

	tbody th {
		padding-left: 12px;
	}

	.table-footer {
		th {
			color: gray;
		}
	}
	.edit-buttons div {
		color: lightgray;
	}
}
@media screen and (max-width: 450px) {
	.list-table {
		font-size: small;

		thead {
			font-size: 0.5rem;
		}

		select {
			appearance: none;
		}
	}
}
</style>

<style>
.table-footer {
	.v-select .vs__dropdown-toggle {
		border-width: 0;
		color: darkgrey;
	}
}
</style>
