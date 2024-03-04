<template>
	<button class="btn open-btn" @click="showFeatureModal = true" :id="type + index">Edit Feature</button>
	<Modal :show="showFeatureModal" @close="showFeatureModal = false" :full-screen="true">
		<template #header> Feature Editor </template>
		<template #body>
			<div class="two-wide uneven">
				<LabelledComponent title="Information">
					<input type="text" id="information" placeholder="Enter name" v-model="feat.name" @change="hasEditedName = true" />
					<div> 
						<a href="https://avrae.readthedocs.io/en/stable/automation_ref.html"> Documentation</a> <br>
						<a href="https://avrae.io/dashboard/characters" v-tooltip="'Edit automation on a character to get access to the full fledged automation builder.'"> Automation Editor</a>
					</div>

				</LabelledComponent>
				<LabelledComponent title="Feature description">
					<textarea rows="4" id="featuredescription" placeholder="Enter description" v-model="feat.description" />
				</LabelledComponent>
			</div>
			<hr />
			<div class="two-wide uneven" v-if="showDescriptionButtons">
				<div class="two-wide">
					<LabelledComponent title="Update from automation">
						<button class="btn" @click="updateFeatureDescFromAutomationDesc"> Update </button>
					</LabelledComponent>
					<LabelledComponent title="Update from description">
						<button class="btn" @click="updateAutomationDescFromFeatureDesc"> Update </button>
					</LabelledComponent>
				</div>
				<div>
					<p class="warning"> Feature description and last automation text node do not match. </p>
					<p> You can update the other with the buttons here.</p>
				</div>
			</div>
			<hr v-if="showDescriptionButtons"/>
			<div class="three-wide">
				<LabelledComponent title="Options">
					<div class="buttons">
						<button class="btn confirm" @click="saveAutomation(true)">Save Automation!</button>
						<button class="btn danger" @click="automationString = 'null'">Clear</button>
						<button class="btn" @click="generateAutomation" v-tooltip="'Generate automation from description. May be incomplete or inaccurate.'">Generate from description</button>
					</div>
				</LabelledComponent>
				<LabelledComponent title="Import basic example">
					<v-select :options="basicExamples" v-model="importedBasicExample" inputId="importbasicexample" />
					<button class="btn move-down" @click="importExample">Load</button>
				</LabelledComponent>
				<LabelledComponent title="Import SRD feature">
					<v-select :options="srdFeatures" v-model="importedSrdFeature" inputId="importsrdfeature" />
					<button class="btn move-down" @click="importSrdAction">Load</button>
				</LabelledComponent>
			</div>

			<hr />
			<div class="automation-editor">
				<span class="yaml-error" v-html="errorMessage"> </span>
				<CodeEditor width="100%" :wrap="true" :languages="[['yaml', 'YAML']]" v-model="automationString" theme="obsidian" height="380px" font-size="12px"> </CodeEditor>
			</div>
		</template>
	</Modal>
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
import {type FeatureEntity} from "@/../../shared";
import LabelledComponent from "./LabelledComponent.vue";
import Modal from "./Modal.vue";
import {parseDescIntoAutomation} from "@/parser/utils";
export default defineComponent({
	props: ["type", "index", "data"],
	data() {
		return {
			feat: this.data.features[this.type][this.index],
			automationString: "" as string,
			errorMessage: null as null | string,
			basicExamples: [] as string[],
			srdFeatures: [] as string[],
			importedBasicExample: null as string | null,
			importedSrdFeature: null as string | null,
			showFeatureModal: false,
			hasEditedName: false
		};
	},
	components: {
		CodeEditor,
		LabelledComponent,
		Modal
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
				let parsed = YAML.parse(this.automationString);
				if (parsed) {
					fetch("/api/validate/automation", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							data: parsed
						})
					})
						.then((response) => response.json())
						.then((data) => {
							if (!data.success) {
								toast.error("YAML contains Error, did not save automation");
								this.errorMessage = data.error;
							} else {
								this.feat.automation = YAML.parse(this.automationString);
								if (shouldNotify) toast.success("Saved Automation!");
							}
						});
				} else {
					this.feat.automation = YAML.parse(this.automationString);
					if (shouldNotify) toast.success("Saved Automation!");
				}
			} catch (err) {
				if (shouldNotify) toast.error("YAML contains Error, did not save automation");
			}
		},
		async importExample() {
			if (!this.importedBasicExample) return;
			//Fetch
			let example = null as FeatureEntity | null;
			await fetch("/api/basic-example/" + encodeURIComponent(this.importedBasicExample)).then(async (response: any) => {
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
			await fetch("/api/srd-feature/" + encodeURIComponent(this.importedSrdFeature)).then(async (response: any) => {
				let result = await handleApiResponse<FeatureEntity>(response);
				if (result.success) feature = result.data as FeatureEntity;
				else {
					toast.error("Error: " + (result.data as error).error);
					feature = null;
				}
			});
			if (!feature) return;
			//Add info to feat, making sure to clean it all up.
			if (this.feat.name == "New Feature" || !this.hasEditedName) this.feat.name = feature.name.split('-').slice(1).join('-').trim();
			this.feat.description = feature.description.replace("$NAME$", this.data.description.name) ?? "";

			if (Array.isArray(feature.automation)) {
				for (let feat of feature.automation) {
					feat['name'] = feat['name'].split('-').slice(1).join('-').trim();
				}
			} else if (feature.automation != null) {
				// @ts-ignore
				feature.automation['name'] = feature.automation['name'].split('-').slice(1).join('-').trim();
			}
			this.automationString = YAML.stringify(feature.automation);
			this.saveAutomation(false);
			setTimeout(() => {
				let els = document.querySelectorAll(".language-yaml") as NodeListOf<HTMLElement>;
				for (let e in els) {
					if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = "";
				}
			}, 100);

			toast.success("Successfully loaded: " + feature.name);
		},
		generateAutomation() {
			const result = parseDescIntoAutomation(this.feat.description, this.feat.name, 0)[0];
			if (result) {
				try {
					this.automationString = YAML.stringify(result);
					this.saveAutomation(false);
				} catch {
					toast.error("Something went when generating automation!");
				}
			}
		},
		getAutomationDescription() : string | false {
			let auto;
			try {
				auto = YAML.parse(this.automationString)
			} catch {
				return false;
			}
			if (Array.isArray(auto)) return false;
			if (!this.feat.automation || !auto || auto.automation.length == 0) return false
			for (let field of auto.automation.reverse()) {
				if (field["type"] == "text") {
					return field["text"]
				}
			}
			return ""
		},
		updateFeatureDescFromAutomationDesc() : void {
			let auto;
			try {
				auto = YAML.parse(this.automationString)
			} catch {
				return;
			}			if (Array.isArray(auto)) return;
			for (let field of auto.automation.reverse()) {
				if (field["type"] == "text") {
					this.feat.description = field["text"]
					return;
				}
			}
		},
		updateAutomationDescFromFeatureDesc() : void { 
			let auto;
			try {
				auto = YAML.parse(this.automationString)
			} catch {
				return;
			}			if (Array.isArray(auto)) return;
			for (let field of auto.automation.reverse()) {
				if (field["type"] == "text") {
					field["text"] = this.feat.description
					auto.automation.reverse()
					this.automationString = YAML.stringify(auto)
					return;
				}
			}
		}
	},
	computed: {
		showDescriptionButtons() : boolean {
			const desc = this.feat.description
			const autoDesc = this.getAutomationDescription()
			if (Array.isArray(this.feat.automation) || !desc || !autoDesc) return false
			if (desc != autoDesc) return true
			return false
		},
	},
	watch: {
		automationString() {
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
		},
	}
});
</script>

<style scoped lang="less">
.open-btn {
	width: 100%;
}
.btn {
	padding-left: 2rem;
	padding-right: 2rem;
}

textarea {
	width: 100%;
}

input {
	min-width: 20rem;
	width: fit-content;
}
.two-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr;

	&.uneven {
		grid-template-columns: 0.48fr 1fr;
	}
}

.three-wide {
	display: grid;
	gap: 2rem;
	grid-template-columns: 1fr 1fr 1fr;
}
@media screen and (max-width: 1080px) {
	.three-wide {
		grid-template-columns: 1fr 1fr;
	}
}

@media screen and (max-width: 950px) {
	.three-wide,
	.two-wide,
	.two-wide.uneven {
		gap: 1rem;
		grid-template-columns: 1fr;
	}
}
.buttons {
	display: grid;
	gap: 0.5rem;
	grid-template-columns: 1fr;
}

.move-down {
	margin-top: 0.4rem;
}

a {
	color: orangered;
}

.external-links {
	display: flex;
	justify-content: space-between;
}
</style>

<style lang="less">
.yaml-error {
	color: var(--color-destructive);
	display: flex;
	flex-direction: column;
}

.validation-error-header {
	margin: 0 0 0.5em 0;
}

.validation-error-list {
	margin: 0 0 0.25em 0;
}

.validation-error-item {
	margin: 0;
}


</style>
