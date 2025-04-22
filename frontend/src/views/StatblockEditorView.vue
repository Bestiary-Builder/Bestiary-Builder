<script setup lang="ts">
import Draggable from "vuedraggable";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { toJpeg } from "html-to-image";
import { usePermission } from "@vueuse/core";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import FeatureWidget from "@/components/FeatureWidget.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Bestiary, Creature, Features, Statblock } from "~/shared";
import { capitalizeFirstLetter, defaultStatblock, getSpellSlots, getXPbyCR, spellList, spellListFlattened } from "~/shared";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";
import { toast } from "@/utils/app/toast";
import { alignments, classLevels, classes, conditionList, creatureTypes, languages, newFeatureGenerator, resistanceList, sizes, stats } from "@/utils/constants";

const $route = useRoute();
const $router = useRouter();

const data = ref<Statblock>(defaultStatblock);
const rawInfo = ref<Creature | null>(null);

// load creature data
onMounted(async () => {
	const loader = $loading.show();
	const { success, data: cData, error } = await useFetch<Creature>(`/api/creature/${$route.params.id.toString()}`);
	if (success) {
		data.value = (cData).stats;
		await nextTick(() => { madeChanges.value = false; });
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
const bestiary = ref<Bestiary | null>(null);
const isOwner = ref(false);
const isEditor = ref(false);
const shouldShowEditor = ref(false);
const loadRawInfo = async () => {
	const { success, data, error } = await useFetch<Bestiary>(`/api/bestiary/${rawInfo.value?.bestiary.toString()}`);
	if (success) {
		bestiary.value = data;
		isOwner.value = store.user?._id === bestiary.value.owner;
		isEditor.value = (bestiary.value?.editors ?? []).includes(store.user?._id ?? "");
		if (isOwner.value || isEditor.value)
			shouldShowEditor.value = true;
	}
	else {
		toast.error(error);
	}
};

// saving
const saveStatblock = async () => {
	if (!rawInfo.value)
		return;
	rawInfo.value.stats = data.value;
	const loader = $loading.show();
	// Send to backend
	const { success, error } = await useFetch<Creature>(`/api/creature/${rawInfo.value._id?.toString()}/update`, "POST", rawInfo.value);
	if (success) {
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
		toast.error(`Error: ${error}`, { duration: 10000 });
	}
	loader.hide();
};
// update xp and prof bonus whenever a user changes cr.
watch(() => data.value.description.cr, () => {
	data.value.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((data.value.description.cr + 3) / 4)) + 1);
	data.value.description.xp = getXPbyCR(data.value.description.cr);
});

// end of lifecycle
const madeChanges = ref(false);

const unwatch = watch(() => data.value,	() => {
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

// Pasting BB statblock from clipboard
const clipboardText = ref("");
const permissionRead = usePermission("clipboard-read");
const canPasteBBStatblock = computed(() => {
	try {
		const parsed = JSON.parse(clipboardText.value);
		return !!parsed?.isBB;
	}
	catch {
		return false;
	}
});

const importFromPaste = async () => {
	if (!canPasteBBStatblock.value)
		return;
	try {
		const parsed = JSON.parse(clipboardText.value);
		delete parsed.isBB;
		data.value = parsed;
		toast.success("Successfully pasted creature!");
	}
	catch {}
};

const onTabFocus = async () => {
	if (!permissionRead.value)
		return;
	if (document.hidden)
		return;
	setTimeout(async () => {
		if (!document.hasFocus()) {
			try {
				clipboardText.value = await navigator.clipboard.readText();
			}
			catch {}
		}
	}, 200);
};
onMounted(() => document.addEventListener("visibilitychange", onTabFocus));
onUnmounted(() => document.removeEventListener("visibilitychange", onTabFocus));

const onCopy = async () => {
	if (!permissionRead.value)
		return;
	try {
		clipboardText.value = await navigator.clipboard.readText();
	}
	catch {}
};
onMounted(() => document.addEventListener("copy", onCopy));
onUnmounted(() => document.removeEventListener("copy", onCopy));

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

// export
const exportStatblock = async () => {
	const text = JSON.stringify({ ...data.value, isBB: true }, null, 2);
	await navigator.clipboard.writeText(text);
	clipboardText.value = text;
	toast.info("Exported this statblock to your clipboard.");
};

const exportToImage = async () => {
	const filter = (node: HTMLElement) => {
		return (node.tagName !== "IMG");
	};

	const doc = document.getElementById("statblock");
	if (!doc)
		return;

	// The image converter breaks when it encounters css styles imported by monaco. Remove that from the dom, run the function, then add it again.
	const monacoCss = document.head.querySelector(`[data-name="vs/editor/editor.main"]`);
	monacoCss?.remove();

	// convert it to an image
	await toJpeg(doc, { filter })
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
		override: null
	});
};

const disableOtherSkills = (index: number, type: "prof" | "exp" | "halfprof", value: boolean) => {
	if (!value && data.value.abilities.skills) {
		if (type === "prof") {
			data.value.abilities.skills[index].isExpertise = false;
			data.value.abilities.skills[index].isHalfProficient = false;
		}
		if (type === "exp") {
			data.value.abilities.skills[index].isProficient = false;
			data.value.abilities.skills[index].isHalfProficient = false;
		}
		if (type === "halfprof") {
			data.value.abilities.skills[index].isExpertise = false;
			data.value.abilities.skills[index].isProficient = false;
		}
	}
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

const spellLevelList = (): number[] => {
	const sClass = data.value.spellcasting.casterSpells.castingClass;
	const slots = data.value.spellcasting.casterSpells.spellSlotList;

	if (sClass === "Warlock" && slots) {
		// @ts-expect-error It's complicated
		return Array.from({ length: Object.keys(slots)[0] }, (_, index) => index + 1);
	}
	if (slots)
		return Object.keys(slots).map(str => Number.parseInt(str));
	return [];
};

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
	if (newValue == null || newValue === undefined) {
		clearCasting();
		return;
	}
	// set spell slots when they change level
	data.value.spellcasting.casterSpells.spellSlotList = getSpellSlots(data.value.spellcasting.casterSpells.castingClass, data.value.spellcasting.casterSpells.casterLevel);
});

watch(() => data.value.spellcasting.casterSpells.castingClass, (newValue) => {
	if (newValue == null || newValue === undefined) {
		clearCasting();
		return;
	}
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
	data.value.spellcasting.casterSpells.spellSlotList = getSpellSlots(sClass, data.value.spellcasting.casterSpells.casterLevel);
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

onMounted(() => showSlides(1));
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
					path: `../bestiary-viewer/${bestiary?._id}`,
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
			<button v-if="!isOwner && !isEditor" v-tooltip="'Toggle Editor for debugging purposes'" aria-label="Toggle Editor for debugging purposes" @click="shouldShowEditor = !shouldShowEditor">
				<font-awesome-icon v-if="!shouldShowEditor" :icon="['fas', 'eye']" />
				<font-awesome-icon v-else :icon="['fas', 'eye-slash']" />
			</button>
			<button v-if="canPasteBBStatblock" v-tooltip="'Paste copied creature'" aria-label="Paste copied creature" style="position: relative" @click="importFromPaste">
				<font-awesome-icon :icon="['far', 'clipboard']" />
				<div class="notice-dot" />
			</button>
			<button v-if="isOwner || isEditor" v-tooltip="'Import a creature\'s statblock'" aria-label="Import a creature's statblock" @click="showImportModal = true">
				<font-awesome-icon :icon="['fas', 'arrow-right-to-bracket']" />
			</button>
			<button v-if="isOwner || isEditor" v-tooltip="'Export this creature as JSON to your clipboard.'" aria-label="Export a creature's statblock" @click="exportStatblock">
				<font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" />
			</button>
			<button v-tooltip="'Export creature as image'" aria-label="Export creature as image" @click="exportToImage">
				<font-awesome-icon :icon="['far', 'image']" />
			</button>
		</Breadcrumbs>
		<div class="content" :class="{ 'is-statblock-only': !shouldShowEditor }">
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
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Creature name" for="creaturename">
								<input id="creaturename" v-model="data.description.name" type="text" :maxlength="store.limits?.nameLength">
							</LabelledComponent>

							<LabelledComponent title="Proper Noun" for="propernoun">
								<span>
									<input id="propernoun" v-model="data.description.isProperNoun" type="checkbox"> <label for="propernoun">Toggles display as "{{ data.description.name }}" instead of "the {{ data.description.name }}"? </label>
								</span>
							</LabelledComponent>
						</div>

						<div class="editor-field__container one-wide">
							<LabelledComponent title="Description" for="description">
								<textarea id="description" v-model="data.description.description" rows="20" :maxlength="store.limits?.descriptionLength" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Image URL" for="imageurl">
								<input id="imageurl" v-model="data.description.image" type="text" :pattern="store.limits?.imageFormats ? `(https:\/\/)(.+)(\\.${store.limits?.imageFormats.join('|\\.')})` : ''">
							</LabelledComponent>
							<LabelledComponent title="Environment" for="environment">
								<input id="environment" v-model="data.description.environment" type="text">
							</LabelledComponent>
							<LabelledComponent title="Faction" for="faction">
								<input id="faction" v-model="data.description.faction" type="text">
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
						<h2 class="group-header">
							Speed
						</h2>
						<Draggable :list="data.core.speed" handle=".handle" :item-key="getDraggableKey" class="editor-field__container two-wide" :animation="150">
							<template #item="{ element, index }">
								<LabelledComponent :title="element.name">
									<div class="grid eight-two">
										<LabelledNumberInput v-model="data.core.speed[index].value" title="" :label-id="element.name" />
										<select v-model="data.core.speed[index].unit" class="ghost unit-selector" title="Select speed unit">
											<option>ft</option>
											<option>m</option>
											<option>km</option>
											<option>mi</option>
											<option>none</option>
										</select>
									</div>
									<div class="grid eight-two">
										<input v-model="data.core.speed[index].comment" type="text" placeholder="Comment...">
										<span class="grid five-five">
											<font-awesome-icon v-tooltip="'Delete this speed'" :icon="['fas', 'trash']" class="button-icon" @click="data.core.speed.splice(index, 1)" />
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" />
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add speed" takes-custom-text-input for="addspeed">
									<v-select :options="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" :taggable="true" :push-tags="true" input-id="addspeed" placeholder="Select speed" @option:selected="(selected : string) => (addNewSpeed(selected))" />
								</LabelledComponent>
							</template>
						</Draggable>
						<h2 class="group-header">
							Senses
						</h2>
						<Draggable :list="data.core.senses" handle=".handle" :item-key="getDraggableKey" class="editor-field__container two-wide" :animation="150">
							<template #item="{ element, index }">
								<LabelledComponent :title="element.name">
									<div class="grid eight-two">
										<LabelledNumberInput v-model="element.value" title="" :label-id="element.name" />
										<select v-model="element.unit" class="ghost unit-selector" title="Select sense unit">
											<option>ft</option>
											<option>m</option>
											<option>km</option>
											<option>mi</option>
											<option>none</option>
										</select>
									</div>
									<div class="grid eight-two">
										<input v-model="element.comment" type="text" placeholder="Comment...">
										<span class="grid five-five">
											<font-awesome-icon v-tooltip="'Delete this sense'" :icon="['fas', 'trash']" class="button-icon" @click="data.core.senses.splice(index, 1)" />
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" />
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add sense" takes-custom-text-input for="addsense">
									<v-select :options="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" :taggable="true" :push-tags="true" input-id="addsense" placeholder="Select sense" @option:selected="(selected : string) => (addNewSense(selected))" />
								</LabelledComponent>
								<LabelledNumberInput v-model="data.misc.passivePerceptionOverride" title="Passive perc override" :step="1" :is-clearable="true" label-id="passivePercOverride" />
							</template>
						</Draggable>
						<h2 class="group-header">
							Misc
						</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Languages" takes-custom-text-input for="languages">
								<v-select v-model="data.core.languages" placeholder="Select a Language or type one" multiple :deselect-from-dropdown="true" :close-on-select="false" :options="languages" :taggable="true" :push-tags="true" input-id="languages" />
							</LabelledComponent>
							<LabelledNumberInput v-model="data.misc.telepathy" title="Telepathy" label-id="telepathy" />
						</div>
					</div>

					<div id="tabpanel-3" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-3">
						<h2 class="group-header">
							Ability Scores
						</h2>
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.abilities.stats.str" title="Strength" :step="1" label-id="strStat" />
							<LabelledNumberInput v-model="data.abilities.stats.dex" title="Dexterity" :step="1" label-id="dexStat" />
							<LabelledNumberInput v-model="data.abilities.stats.con" title="Constitution" :step="1" label-id="conStat" />
							<LabelledNumberInput v-model="data.abilities.stats.int" title="Intelligence" :step="1" label-id="intStat" />
							<LabelledNumberInput v-model="data.abilities.stats.wis" title="Wisdom" :step="1" label-id="wisStat" />
							<LabelledNumberInput v-model="data.abilities.stats.cha" title="Charisma" :step="1" label-id="chaStat" />
						</div>
						<h2 class="group-header">
							Saving Throws
						</h2>
						<div class="editor-field__container three-wide">
							<LabelledNumberInput v-model="data.abilities.saves.str.override" title="Strength" :step="1" :is-clearable="true" label-id="strSave">
								<p>
									<input id="strsaveprof" v-model="data.abilities.saves.str.isProficient" type="checkbox" :is-clearable="true">
									<label for="strsaveprof" aria-label="strength save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.dex.override" title="Dexterity" :step="1" :is-clearable="true" label-id="dexSave">
								<p>
									<input id="dexsaveprof" v-model="data.abilities.saves.dex.isProficient" type="checkbox">
									<label for="dexsaveprof" aria-label="dexterity save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.con.override" title="Constitution" :step="1" :is-clearable="true" label-id="conSave">
								<p>
									<input id="consaveprof" v-model="data.abilities.saves.con.isProficient" type="checkbox">
									<label for="consaveprof" aria-label="constitution save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.int.override" title="Intelligence" :step="1" :is-clearable="true" label-id="intSave">
								<p>
									<input id="intsaveprof" v-model="data.abilities.saves.int.isProficient" type="checkbox">
									<label for="intsaveprof" aria-label="intelligence save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.wis.override" title="Wisdom" :step="1" :is-clearable="true" label-id="wisSave">
								<p>
									<input id="wissaveprof" v-model="data.abilities.saves.wis.isProficient" type="checkbox">
									<label for="wissaveprof" aria-label="wisdom save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
							<LabelledNumberInput v-model="data.abilities.saves.cha.override" title="Charisma" :step="1" :is-clearable="true" label-id="chaSave">
								<p>
									<input id="chasaveprof" v-model="data.abilities.saves.cha.isProficient" type="checkbox">
									<label for="chasaveprof" aria-label="charisma save proficiency"> Proficient </label>
								</p>
							</LabelledNumberInput>
						</div>
						<h2 class="group-header">
							Skills
						</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent v-for="(skill, index) in data.abilities.skills" :key="skill.skillName" :title="skill.skillName">
								<div class="button-container">
									<p><input :id="`${skill.skillName}prof`" v-model="skill.isProficient" type="checkbox" @click="disableOtherSkills(index, 'prof', skill.isProficient)"> <label :for="`${skill.skillName}prof`"> Proficient </label></p>
									<p><input :id="`${skill.skillName}exp`" v-model="skill.isExpertise" type="checkbox" @click="disableOtherSkills(index, 'exp', skill.isExpertise)"><label :for="`${skill.skillName}exp`"> Expertise </label></p>
									<p><input :id="`${skill.skillName}halfprof`" v-model="skill.isHalfProficient" type="checkbox" @click="disableOtherSkills(index, 'halfprof', skill.isHalfProficient)"><label :for="`${skill.skillName}halfprof`"> Half prof </label></p>
								</div>
								<div>
									<LabelledNumberInput v-model="skill.override" title="" :step="1" :is-clearable="true" />
								</div>
								<button class="btn" @click="deleteSkill(index)">
									Delete
								</button>
							</LabelledComponent>
							<LabelledComponent title="Add new skill" for="addnewskill">
								<v-select
									placeholder="Select skill"
									:options="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Initiative', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']"
									input-id="addnewskill"
									@option:selected="(selected : string) => (addNewSkill(selected))"
								/>
							</LabelledComponent>
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
							<h2 class="group-header">
								{{ descText.replace("New ", "") }}s
							</h2>
							<Draggable :list="data.features[fType]" group="features" :item-key="getDraggableKey" handle=".handle" class="editor-field__container two-wide" :animation="150">
								<template #item="{ element, index }">
									<LabelledComponent :title="element.name || `Unnamed ${index}`">
										<div class="feature-button__container">
											<FeatureWidget :index="index" :type="fType" :data="data.features[fType][index]" :creature-name="data.description.name" />
											<span class="delete-button" aria-label="Delete feature" @click="deleteFeature(fType, index)"><font-awesome-icon :icon="['fas', 'trash']" /></span>
											<font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" />
										</div>
									</LabelledComponent>
								</template>
								<template #footer>
									<LabelledComponent :title="descText" :for="descText">
										<button :id="descText" class="btn" @click="createNewFeature(fType)">
											Create
										</button>
									</LabelledComponent>

									<LabelledComponent :title="`${capitalizeFirstLetter(fType)} Header`" :for="fType">
										<textarea :id="fType" v-model="data.misc.featureHeaderTexts[fType]" />
									</LabelledComponent>

									<LabelledNumberInput v-if="fType === 'legendary' && data.features[fType].length > 0" v-model="data.misc.legActionsPerRound" title="Legendary Actions per round" :min="0" :step="1" for="legActionsPerRound" />
								</template>
							</Draggable>
						</div>
					</div>
					<div id="tabpanel-6" class="editor-content__tab-inner scale-in" role="tabpanel" tabindex="0" aria-labelledby="tab-6">
						<h2 class="group-header">
							Innate Spellcasting
						</h2>
						<div class="editor-field__container two-wide">
							<LabelledComponent title="Casting ability" for="castingability">
								<v-select v-model="data.spellcasting.innateSpells.spellCastingAbility" :options="stats" input-id="castingability" />
							</LabelledComponent>
							<LabelledComponent title="Not these components" for="notthesecomponents">
								<v-select v-model="data.spellcasting.innateSpells.noComponentsOfType" :options="['Material', 'Verbal', 'Somatic']" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="notthesecomponents" />
							</LabelledComponent>
						</div>
						<div class="editor-field__container two-wide">
							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellDcOverride" title="DC override" :step="1" :is-clearable="true" label-id="innateSpellDcOverride" />
							<LabelledNumberInput v-model="data.spellcasting.innateSpells.spellBonusOverride" title="Attack bonus override" :step="1" :is-clearable="true" label-id="innateSpellBonusOverride" />
							<TransitionGroup name="list">
								<template v-for="_, times in data.spellcasting.innateSpells.spellList" :key="times">
									<LabelledComponent :title="times === '0' ? 'At will' : `${times}/day`" takes-custom-text-input :for="`innateSpellTimes${times}`">
										<div :class="{ 'select-with-delete': parseInt(times.toString()) > 3 }">
											<v-select v-model="data.spellcasting.innateSpells.spellList[times]" :reduce="(sp : any) => ({ spell: sp.spell ?? sp, comment: sp.comment ?? '' })" width="100%" label="spell" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" :input-id="`innateSpellTimes${times}`" :taggable="true" :push-tags="true" />
											<font-awesome-icon v-if="parseInt(times.toString()) > 3" v-tooltip="'Delete this daily amount'" :icon="['fas', 'trash']" class="delete-button button-icon" @click="delete data.spellcasting.innateSpells.spellList[times]" />
										</div>
									</LabelledComponent>
								</template>
							</TransitionGroup>
							<LabelledComponent title="Add daily amount" for="innateSpellDailyAmount">
								<LabelledNumberInput v-model="newDailyAmount" title="" :min="4" :step="1" :is-clearable="true" label-id="innateSpellDailyAmount" />
								<button class="btn" @click="addNewDaily()">
									Add
								</button>
							</LabelledComponent>

							<LabelledComponent title="Is psionics?" for="ispsionics">
								<span> <input id="ispsionics" v-model="data.spellcasting.innateSpells.isPsionics" type="checkbox"> Toggles display as psionics </span>
							</LabelledComponent>
							<LabelledComponent title="Display as action?" for="displayasaction">
								<span> <input id="displayasaction" v-model="data.spellcasting.innateSpells.displayAsAction" type="checkbox"> Toggles display as action </span>
							</LabelledComponent>

							<LabelledComponent title="Edit specific spells" for="editspells">
								<button id="editspells" class="btn" @click="showSpellModal = true">
									Edit cast level/add comment
								</button>
							</LabelledComponent>
							<LabelledComponent title="Description override" for="innateDescription">
								<textarea id="innateDescription" v-model="data.spellcasting.innateSpells.customDescription" rows="20" :maxlength="store.limits?.descriptionLength" />
							</LabelledComponent>
						</div>
						<h2 class="group-header">
							Class spellcasting
						</h2>
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
								<textarea id="casterDescription" v-model="data.spellcasting.casterSpells.customDescription" rows="20" :maxlength="store.limits?.descriptionLength" />
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
							<LabelledComponent v-for="level in spellLevelList()" :key="level" :title="`Level ${level}`" takes-custom-text-input :for="`spellLevel${level}`">
								<v-select v-model="data.spellcasting.casterSpells.spellList[level]" :options="getSpellsByLevel(level)" multiple :deselect-from-dropdown="true" :close-on-select="false" :taggable="true" :push-tags="true" :title="`Level ${level}`" :input-id="`spellLevel${level}`" />
							</LabelledComponent>
						</div>
					</div>
				</div>

				<hr>

				<div class="buttons">
					<button class="btn" :class="{ confirm: madeChanges }" @click="saveStatblock">
						Save statblock
					</button>
				</div>
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

			textarea {
				min-height: 46px;
				height: 46px;
			}
		}
	}
}

.button-icon {
	cursor: pointer;
	color: orangered;
	padding-top: 15px;
	padding-bottom: 8px;
	.scale-on-hover(1.2);
	margin: auto;
}

.feature-button__container {
	display: flex;
	gap: 0.5rem;
	justify-content: space-between;

	.delete-button {
		padding-top: 9px !important;
		.button-icon();
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
	padding-top: 15px;
	padding-bottom: 8px;
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
</style>
