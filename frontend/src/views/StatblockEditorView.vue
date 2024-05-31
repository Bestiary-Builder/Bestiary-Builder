<script lang="ts">
import draggable from "vuedraggable";
import { computed, defineComponent, watch } from "vue";
import { toJpeg } from "html-to-image";
import { useClipboard, usePermission } from "@vueuse/core";
import FeatureWidget from "@/components/FeatureWidget.vue";
import Modal from "@/components/Modal.vue";
import StatblockRenderer from "@/components/StatblockRenderer.vue";
import Breadcrumbs from "@/constantComponents/Breadcrumbs.vue";
import LabelledNumberInput from "@/components/LabelledNumberInput.vue";
import LabelledComponent from "@/components/LabelledComponent.vue";
import type { Bestiary, Creature, Statblock } from "~/shared";
import { defaultStatblock, getSpellSlots, getXPbyCR, spellList, spellListFlattened } from "~/shared";
import { useFetch } from "@/utils/utils";
import { store } from "@/utils/store";
import { $loading } from "@/utils/app/loading";
import { toast } from "@/utils/app/toast";
import { capitalizeFirstLetter } from "@/utils/displayFunctions";
import { alignments, classLevels, classes, conditionList, creatureTypes, languages, newFeatureGenerator, resistanceList, sizes, stats } from "@/utils/constants";

const tabs = document.getElementsByClassName("editor-nav__tab") as HTMLCollectionOf<HTMLElement>;
const tabsContent = document.getElementsByClassName("editor-content__tab-inner") as HTMLCollectionOf<HTMLElement>;

export default defineComponent({
	components: {
		StatblockRenderer,
		FeatureWidget,
		Breadcrumbs,
		LabelledNumberInput,
		LabelledComponent,
		Modal,
		Draggable: draggable
	},
	beforeRouteUpdate() {
		// just in case the user manages to navigate to a page that also uses StatblockEditorView
		if (this.madeChanges && (this.isOwner || this.isEditor)) {
			const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
			if (!answer)
				return false;
		}
	},
	beforeRouteLeave() {
		// when the user leaves this route
		if (this.madeChanges && (this.isOwner || this.isEditor)) {
			const answer = window.confirm("Do you really want to leave? you have unsaved changes!");
			if (!answer)
				return false;
		}
	},
	data() {
		return {
			slideIndex: 2,
			data: defaultStatblock,
			rawInfo: null as Creature | null,
			bestiary: null as Bestiary | null,
			list: [] as string[],
			innateSpells: {
				0: [] as string[],
				1: [] as string[],
				2: [] as string[],
				3: [] as string[]
			} as { [key: number]: string[] },
			toolsjson: "",
			bestiaryBuilderJson: "",
			notices: {} as { [key: string]: string[] },
			madeChanges: false,

			showImportModal: false,
			showSpellModal: false,
			capitalizeFirstLetter,
			shouldShowEditor: false,
			isOwner: false,
			isEditor: false,
			newSkillName: "",
			newSpeedName: "",
			newSenseName: "",
			clipboardText: "",
			clipboardInterval: 0,
			// constants we need in the template
			resistanceList,
			languages,
			spellListFlattened,
			spellList,
			newFeatureGenerator,
			stats,
			alignments,
			sizes,
			creatureTypes,
			classes,
			classLevels,
			conditionList,
			store
		};
	},
	computed: {
		canPasteBBStatblock() {
			try {
				const parsed = JSON.parse(this.clipboardText);
				return !!parsed?.isBB;
			}
			catch {
				return false;
			}
		}
	},
	watch: {
		"data.spellcasting.casterSpells.castingClass": function (newValue, _oldValue) {
			if (newValue == null || newValue === undefined) {
				this.clearCasting();
				return;
			}
			const sClass = this.data.spellcasting.casterSpells.castingClass;
			switch (sClass) {
				case "Artificer":
				case "Wizard":
					this.data.spellcasting.casterSpells.spellCastingAbility = "int";
					break;
				case "Cleric":
				case "Druid":
				case "Ranger":
					this.data.spellcasting.casterSpells.spellCastingAbility = "wis";
					break;
				default:
					this.data.spellcasting.casterSpells.spellCastingAbility = "cha";
			}
			// set spell slots in case they changed full caster/half caster/arti half/warlock
			this.data.spellcasting.casterSpells.spellSlotList = getSpellSlots(sClass, this.data.spellcasting.casterSpells.casterLevel);
		},
		"data.spellcasting.casterSpells.casterLevel": function (newValue) {
			if (newValue == null || newValue === undefined) {
				this.clearCasting();
				return;
			}
			// set spell slots when they change level
			this.data.spellcasting.casterSpells.spellSlotList = getSpellSlots(this.data.spellcasting.casterSpells.castingClass, this.data.spellcasting.casterSpells.casterLevel);
		},
		"innateSpells": {
			handler() {
				const list = this.data.spellcasting.innateSpells.spellList;
				// add spells to our data that we did not have in our statblock data yet but we did in our editor data
				for (const times in this.innateSpells) {
					for (const spell of this.innateSpells[times]) {
						// the spell is not in our stat block data yet, so we add it.
						if (!list[times].map(obj => obj.spell).includes(spell)) {
							list[times].push({
								spell,
								comment: ""
							});
						}
					}
				}
				// remove spells that we have in the statblock data but not in the editor data
				for (const times in list) {
					// eslint-disable-next-line ts/no-for-in-array
					for (const spell in list[times]) {
						if (!this.innateSpells[times].includes(list[times][spell].spell))
							delete list[times][spell];
					}

					// remove all falsy (null/undefined/etc) from our array which delete leaves behind.
					list[times] = list[times].filter(Boolean);
				}
			},
			deep: true
		},
		"data.description.cr": function () {
			this.data.core.proficiencyBonus = Math.max(2, Math.min(9, Math.floor((this.data.description.cr + 3) / 4)) + 1);
			this.data.description.xp = getXPbyCR(this.data.description.cr);
		},
		"data.description.name": function () {
			document.title = `${this?.data.description.name.substring(0, 16)} | Bestiary Builder`;
		}
	},

	async mounted() {
		this.showSlides(1);
		const loader = $loading.show();
		// Fetch creature info
		{
			const { success, data, error } = await useFetch<Creature>(`/api/creature/${this.$route.params.id.toString()}`);
			if (success) {
				this.data = (data).stats;
				this.rawInfo = data;
			}
			else {
				toast.error(`Error: ${error}`);
				this.madeChanges = false;
				await this.$router.push("/error");
				loader.hide();
				return;
			}
		}

		document.title = `${this?.data.description.name.substring(0, 16)} | Bestiary Builder`;

		// get bestiary info this creature belongs to so we can get the name of the bestiary
		{
			const { success, data, error } = await useFetch<Bestiary>(`/api/bestiary/${this.rawInfo?.bestiary.toString()}`);
			if (success) {
				this.bestiary = data;
				this.isOwner = store.user?._id === this.bestiary.owner;
				this.isEditor = (this.bestiary?.editors ?? []).includes(store.user?._id ?? "");
				if (this.isOwner || this.isEditor)
					this.shouldShowEditor = true;
			}
			else {
				this.bestiary = null;
				toast.error(error);
			}
		}
		this.innateSpells = {
			0: this.data.spellcasting.innateSpells.spellList[0].map(spell => spell.spell),
			1: this.data.spellcasting.innateSpells.spellList[1].map(spell => spell.spell),
			2: this.data.spellcasting.innateSpells.spellList[2].map(spell => spell.spell),
			3: this.data.spellcasting.innateSpells.spellList[3].map(spell => spell.spell)
		};

		// if the user had changes without saving, stop them from closing the page without confirming.
		window.addEventListener("beforeunload", (event) => {
			// haven't figured out yet how to destroy the event listener upon unmount so for now this confirms that the
			// warning only shows if they are in the statblock editor
			if (this.madeChanges && (this.isOwner || this.isEditor) && location.pathname.split("/")[1] === "statblock-editor") {
				event.preventDefault();
				event.returnValue = true;
			}
		});

		const getClipboardText = async () => {
			if (document.hasFocus()) {
				try {
					this.clipboardText = await navigator.clipboard.readText();
				}
				catch {}
			}
		};
		//call immediately and then check every two seconds.
		await getClipboardText();
		this.clipboardInterval = setInterval(getClipboardText, 2000);

		// watch data only once, as traversing the object deeply is expensive.
		// re-registered upon saving.
		// need a set time out otherwise it triggers upon mounting for some reason
		setTimeout(() => {
			const unwatch = this.$watch(
				"data",
				() => {
					this.madeChanges = true;
					unwatch();
				},
				{ deep: true }
			);
		}, 1);
		loader.hide();
	},
	unmounted() {
		clearInterval(this.clipboardInterval);
	},
	methods: {
		getDraggableKey(item: any) {
			return item;
		},
		async exportStatblock() {
			const text = JSON.stringify({ ...this.data, isBB: true }, null, 2);
			await navigator.clipboard.writeText(text);
			this.clipboardText = text;
			toast.info("Exported this statblock to your clipboard.");
		},
		async importFromPaste() {
			if (!this.canPasteBBStatblock)
				return;
			try {
				const parsed = JSON.parse(this.clipboardText);
				delete parsed.isBB;
				this.data = parsed;
				toast.success("Successfully pasted creature!");
			}
			catch {}
		},
		async import5etools() {
			if (this.toolsjson.startsWith("___")) {
				toast.error("You copied the markdown code, not the JSON.");
				return;
			}
			try {
				const json = JSON.parse(this.toolsjson);
				const { success, data, error } = await useFetch<{ stats: Statblock; notices: { [key: string]: string[] } }>("/api/5etools-import", "POST", json);
				if (!success)
					throw error;
				this.data = data?.stats;
				this.notices = data?.notices;
				this.toolsjson = "";
				toast.success(`Successfully imported ${this.data.description.name}`);
			}
			catch (e) {
				console.error(e);
				toast.error("Failed to import this creature");
			}
		},
		async importBestiaryBuilder() {
			try {
				let creature = JSON.parse(this.bestiaryBuilderJson);
				if (Array.isArray(creature))
					creature = creature[0];
				// Validate input
				const { success, error } = await useFetch("/api/validate/creature", "POST", creature);
				// Succesful?:
				if (success) {
					this.data = creature;
					this.notices = {};
					this.bestiaryBuilderJson = "";
					toast.success(`Successfully imported ${this.data.description.name}`);
				}
				else {
					toast.error(error.replaceAll("\n", "<br />"), {
						duration: 0
					});
				}
				this.showImportModal = false;
			}
			catch (e) {
				console.error(e);
				toast.error("Failed to import this creature");
			}
		},
		showSlides(n: number): void {
			if (this.slideIndex === n)
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

			this.slideIndex = n;
		},
		moveSlide(event: KeyboardEvent): void {
			const currentSlide = this.slideIndex;
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
				this.showSlides(moveToSlide);
			}
		},
		changeCR(isIncrease: boolean): void {
			let cr = this.data.description.cr;

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

			this.data.description.cr = cr;
		},
		addNewSkill(): void {
			if (!this.newSkillName) {
				this.$toast.error("No skill chosen.");
				return;
			}
			if (this.data.abilities.skills.some(obj => obj.skillName === this.newSkillName)) {
				this.$toast.error("You already have this skill.");
				return;
			}

			this.data.abilities.skills.push({
				skillName: this.newSkillName,
				isHalfProficient: false,
				isProficient: true,
				isExpertise: false,
				override: null
			});

			this.newSkillName = "";
		},
		addNewSpeed() {
			if (!this.newSpeedName) {
				this.$toast.error("No speed chosen.");
				return;
			}
			if (this.data.core.speed.some(obj => obj.name === this.newSpeedName)) {
				this.$toast.error("You already have this speed.");
				return;
			}
			this.data.core.speed.push({ name: this.newSpeedName, value: 30, unit: "ft", comment: "" });
			this.newSpeedName = "";
		},
		addNewSense() {
			if (!this.newSenseName) {
				this.$toast.error("No sense chosen.");
				return;
			}
			if (this.data.core.senses.some(obj => obj.name === this.newSenseName)) {
				this.$toast.error("You already have this sense.");
				return;
			}
			this.data.core.senses.push({ name: this.newSenseName, value: 30, unit: "ft", comment: "" });
			this.newSenseName = "";
		},
		disableOtherSkills(index: number, type: "prof" | "exp" | "halfprof", value: boolean): void {
			if (!value && this.data.abilities.skills) {
				if (type === "prof") {
					this.data.abilities.skills[index].isExpertise = false;
					this.data.abilities.skills[index].isHalfProficient = false;
				}
				if (type === "exp") {
					this.data.abilities.skills[index].isProficient = false;
					this.data.abilities.skills[index].isHalfProficient = false;
				}
				if (type === "halfprof") {
					this.data.abilities.skills[index].isExpertise = false;
					this.data.abilities.skills[index].isProficient = false;
				}
			}
		},
		deleteSkill(index: number): void {
			this.data.abilities.skills?.splice(index, 1);
		},
		deleteFeature(type: "features" | "actions" | "bonus" | "reactions" | "legendary" | "mythic" | "lair" | "regional", index: number): void {
			this.data.features[type].splice(index, 1);
		},
		createNewFeature(type: "features" | "actions" | "bonus" | "reactions" | "legendary" | "mythic" | "lair" | "regional"): void {
			this.data.features[type][this.data.features[type].length] = {
				name: `New Feature ${this.data.features[type].length + 1}`,
				description: "",
				automation: null
			};
		},
		spellLevelList(): number[] {
			const sClass = this.data.spellcasting.casterSpells.castingClass;
			const slots = this.data.spellcasting.casterSpells.spellSlotList;

			if (sClass === "Warlock" && slots) {
				// @ts-expect-error It's complicated
				return Array.from({ length: Object.keys(slots)[0] }, (_, index) => index + 1);
			}
			if (slots)
				return Object.keys(slots).map(str => Number.parseInt(str));
			return [];
		},
		getSpellsByLevel(level: number): string[] {
			// this function is needed for typescript.
			if (level < 0 || level > 9)
				return [];
			return spellList[level as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9];
		},
		clearCasting() {
			this.data.spellcasting.casterSpells.castingClass = null;
			this.data.spellcasting.casterSpells.casterLevel = null;
			this.data.spellcasting.casterSpells.spellList = [[], [], [], [], [], [], [], [], [], []];
			this.data.spellcasting.casterSpells.spellSlotList = {};
			this.data.spellcasting.casterSpells.spellCastingAbility = null;
			this.data.spellcasting.casterSpells.spellBonusOverride = null;
			this.data.spellcasting.casterSpells.spellDcOverride = null;
		},
		async saveStatblock() {
			if (!this.rawInfo)
				return;
			this.rawInfo.stats = this.data;
			const loader = $loading.show();
			// Send to backend
			const { success, error } = await useFetch<Creature>(`/api/creature/${this.rawInfo._id?.toString()}/update`, "POST", this.rawInfo);
			if (success) {
				toast.success("Saved stat block");
				this.madeChanges = false;
				// watch data only once, as traversing the object deeply is expensive.
				const unwatch = this.$watch(
					"data",
					() => {
						this.madeChanges = true;
						unwatch();
					},
					{ deep: true }
				);
			}
			else {
				toast.error(`Error: ${error}`, { duration: 10000 });
			}
			loader.hide();
		},
		async exportToImage() {
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
					link.download = `${this.data.description.name} from BestiaryBuilder.jpg`;
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
		},
		getSpellSlots
	}
});
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
											<!-- <font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" /> -->
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add speed" takes-custom-text-input for="addspeed">
									<v-select v-model="newSpeedName" :options="['Walk', 'Swim', 'Fly', 'Climb', 'Burrow']" :taggable="true" :push-tags="true" input-id="addspeed" placeholder="Select speed" />
									<button class="btn" @click="addNewSpeed">
										Create
									</button>
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
											<!-- <font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle button-icon" /> -->
										</span>
									</div>
								</LabelledComponent>
							</template>
							<template #footer>
								<LabelledComponent title="Add sense" takes-custom-text-input for="addsense">
									<v-select v-model="newSenseName" :options="['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense']" :taggable="true" :push-tags="true" input-id="addsense" placeholder="Select sense" />
									<button class="btn" @click="data.core.senses.push({ name: newSenseName, value: 30, unit: 'ft', comment: '' })">
										Create
									</button>
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
									v-model="newSkillName"
									placeholder="Select skill"
									:options="['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Initiative', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival']"
									input-id="addnewskill"
								/>
								<button class="btn editor-field__plus-button" @click="addNewSkill()">
									New Skill
								</button>
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
											<!-- <font-awesome-icon :icon="['fas', 'grip-vertical']" class="handle" /> -->
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
							<LabelledComponent title="At will" takes-custom-text-input for="atwill">
								<v-select v-model="innateSpells[0]" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="atwill" :taggable="true" :push-tags="true" />
							</LabelledComponent>
							<LabelledComponent title="1/day" takes-custom-text-input for="1/day">
								<v-select v-model="innateSpells[1]" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="1/day" :taggable="true" :push-tags="true" />
							</LabelledComponent>
							<LabelledComponent title="2/day" takes-custom-text-input for="2/day">
								<v-select v-model="innateSpells[2]" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="2/day" :taggable="true" :push-tags="true" />
							</LabelledComponent>
							<LabelledComponent title="3/day" takes-custom-text-input for="3/day">
								<v-select v-model="innateSpells[3]" :options="spellListFlattened" multiple :deselect-from-dropdown="true" :close-on-select="false" input-id="3/day" :taggable="true" :push-tags="true" />
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
					<button class="btn confirm" @click="saveStatblock()">
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
			margin-bottom: 0.5rem;
			border-bottom: 1px solid orangered;
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

.editor hr {
	border-color: orangered;
}

.buttons {
	display: grid;
	gap: 1rem;
	grid-template-columns: 1fr;
	margin: 1rem 25%;
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
</style>
