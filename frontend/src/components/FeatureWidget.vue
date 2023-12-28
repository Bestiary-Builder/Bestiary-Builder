<template>
	<button class="btn" @click="openModal" :id="type + index">Edit Feature</button>
	<Teleport to="#modal">
		<Transition name="modal">
			<div class="modal__bg" v-if="isModalOpen">
				<section class="modal__content" ref="modal">
					<button @click="isModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
					<p>NAME:</p>
					<input type="text" placeholder="Enter name" v-model="feat.name" @change="hasEditedName = true" />
					<hr />
					<p>DESCRIPTION:</p>
					<!-- <textarea rows="4" type="text" placeholder="Enter description" v-model="feat.description" /> -->
					<CodeEditor height="100px" v-model="feat.description" width="100%" :wrap="true" :languages="[['markdown', 'Markdown']]" theme="obsidian" />
					<hr />
					<div class="import-container">
						<span class="import-container__title"> Import Basic Example </span>
						<div class="import-container__selector"><v-select :options="basicExamples" label="name" v-model="importedBasicExample" /></div>
						<button class="import-container__button" @click="importExample">Load</button>
					</div>
					<hr />
					<div class="import-container">
						<span class="import-container__title"> Import SRD Feature </span>
						<div class="import-container__selector"><v-select :options="srdFeatures" label="name" v-model="importedSrdFeature" /></div>
						<button class="import-container__button" @click="importSrdAction">Load</button>
					</div>
					<hr />
					<p>AUTOMATION</p>
					<button @click="saveAutomation(true)">Save Automation!</button>
					<button @click="automationString = 'null'">Clear</button>
					<hr />
					<div class="automation-editor">
						<span class="error"> {{ errorMessage }} </span>
						<CodeEditor width="100%" :wrap="true" :languages="[['yaml', 'YAML']]" v-model="automationString" theme="obsidian" height="600px" font-size="12px"> </CodeEditor>
					</div>
				</section>
			</div>
		</Transition>
	</Teleport>
</template>


<script lang="ts">
// @ts-ignore
import CodeEditor from "simple-code-editor";
import {ref} from "vue";
import {onClickOutside} from "@vueuse/core";
// highlight.js
import "highlight.js";
import "highlight.js/styles/obsidian.css";

import {defineComponent} from "vue";
import YAML from "yaml";
import {toast, handleApiResponse, type error} from "@/main";
import {type FeatureEntity} from "../generic/types";
export default defineComponent({
	setup() {
		const isModalOpen = ref(false);
		const modal = ref<HTMLDivElement | null>(null);

		const outside = onClickOutside(modal, () => (isModalOpen.value = false));

		const openModal = () => {
			isModalOpen.value = true;
			let els = document.querySelectorAll(".language-yaml") as NodeListOf<HTMLElement>;
			for (let e in els) {
				if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
			}
		};

		return {
			modal,
			isModalOpen,
			openModal,
		}
	},
	props: ["type", "index", "data"],
	data() {
		return {
			isModalOpen: false,
			feat: this.data.features[this.type][this.index],
			automationString: "" as string,
			errorMessage: null as null | string,
			basicExamples: [] as string[],
			srdFeatures: [] as string[],
			importedBasicExample: null as string | null,
			importedSrdFeature: null as string | null,

			hasEditedName: false
		};
	},
	components: {
		CodeEditor
	},
	mounted() {
		this.automationString = YAML.stringify(this.feat.automation) ?? YAML.stringify(null);

		//Fetch example and feature names
		fetch("/api/basic-examples/list").then(async (response: any) => {
			let result = await handleApiResponse<string[]>(response);
			if (result.success) this.basicExamples = result.data as string[];
			else this.basicExamples = [];
		});
		fetch("/api/srd-features/list").then(async (response: any) => {
			let result = await handleApiResponse<string[]>(response);
			if (result.success) this.srdFeatures = result.data as string[];
			else this.basicExamples = [];
		});
	},
	methods: {
		validateYaml(): boolean {
			try {
				YAML.parse(this.automationString);
				this.errorMessage = null;
				return true;
			} catch (err) {
				// @ts-ignore
				this.errorMessage = err;
				return false;
			}
		},
		saveAutomation(shouldNotify: boolean = false) {
			try {
				YAML.parse(this.automationString);
				this.feat.automation = YAML.parse(this.automationString);
				if (shouldNotify) toast.success("Saved Automation!");
			} catch (err) {
				// @ts-ignore
				if (shouldNotify) toast.error("YAML contains Error, did not save automation");
			}
		},
		async importExample() {
			if (!this.importedBasicExample) return;
			//Fetch
			let example = null as FeatureEntity | null;
			await fetch("/api/basic-example/" + this.importedBasicExample).then(async (response: any) => {
				let result = await handleApiResponse<FeatureEntity>(response);
				if (result.success) example = result.data as FeatureEntity;
				else {
					toast.error("Error: " + (result.data as error).error);
					example = null;
				}
			});
			if (!example) return;
			//Add info to feat
			if (this.feat.name == "New Feature" || !this.hasEditedName) this.feat.name = example.name;
			this.feat.description = example.description ?? "";
			this.automationString = YAML.stringify(example.automation);
			this.saveAutomation(false);
			setTimeout(() => {
				let els = document.querySelectorAll(".language-yaml") as NodeListOf<HTMLElement>;
				for (let e in els) {
					if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
				}
			}, 100);

			toast.success("Successfully loaded: " + example.name);
		},
		async importSrdAction() {
			if (!this.importedSrdFeature) return;
			//Fetch
			let feature = null as FeatureEntity | null;
			await fetch("/api/srd-feature/" + this.importedSrdFeature).then(async (response: any) => {
				let result = await handleApiResponse<FeatureEntity>(response);
				if (result.success) feature = result.data as FeatureEntity;
				else {
					toast.error("Error: " + (result.data as error).error);
					feature = null;
				}
			});
			if (!feature) return;
			//Add info to feat
			if (this.feat.name == "New Feature" || !this.hasEditedName) this.feat.name = feature.name;
			this.feat.description = feature.description ?? "";
			this.automationString = YAML.stringify(feature.automation);
			this.saveAutomation(false);
			setTimeout(() => {
				let els = document.querySelectorAll(".language-yaml") as NodeListOf<HTMLElement>;
				for (let e in els) {
					if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
				}
			}, 100);

			toast.success("Successfully loaded: " + feature.name);
		}
	},
	watch: {
		automationString(newVal, oldVal) {
			this.validateYaml();

			if (this.feat.name == "New Feature" || this.feat.description == "") {
				try {
					let parsedAutomation = YAML.parse(this.automationString);
					if (Array.isArray(parsedAutomation)) {
						if (parsedAutomation.length > 0) parsedAutomation = parsedAutomation[0];
						else return;
					}
					///console.log(parsedAutomation);

					if (parsedAutomation.name && this.feat.name == "New Feature") this.feat.name = parsedAutomation.name.replace(" (1H)", "").replace(" (2H)", "");

					if (parsedAutomation.automation && this.feat.description == "") {
						for (let type in parsedAutomation.automation) {
							if (parsedAutomation.automation[type]["type"] == "text") {
								///console.log(parsedAutomation.automation[type]["text"]);
								this.feat.description = parsedAutomation.automation[type]["text"];
								break;
							}
						}
					}
				} catch {}
			}

			// I hate this.
			let els = document.querySelectorAll(".language-yaml") as NodeListOf<HTMLElement>;
			for (let e in els) {
				if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
			}
		},
		"feat.description"() {
			// I hate this.
			let els = document.querySelectorAll(".language-markdown") as NodeListOf<HTMLElement>;
			for (let e in els) {
				if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
			}
		}
	}
});
</script>

<style scoped lang="less">
.btn {
	width: 100%;
}

.error {
	color: red;
	font-weight: bold;
}

textarea {
	width: 100%;
}

input {
	min-width: 20rem;
	width: fit-content;
}

.import-container {
	display: flex;
	gap: 1rem;

	&__title {
		width: 10rem;
	}
	&__selector {
		width: 30rem;
	}
}
.selector-container {
	width: 20rem;
}
</style>
