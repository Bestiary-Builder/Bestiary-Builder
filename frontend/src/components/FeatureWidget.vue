<template>
<button @click="openModal">
    {{feat.name }}: Edit Feature
</button>
<Teleport to="#modal">
    <Transition name="modal"> 
        <div class="modal__bg" v-if="isModalOpen"> 
            <section class="modal__content" ref="modal">  
                <button @click="isModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
                <p> NAME: </p> <input type="text" placeholder="Enter name" v-model="feat.name">
                <hr>
                <p> DESCRIPTION: </p> <textarea rows="4" type="text" placeholder="Enter description" v-model="feat.description" />
                <hr>
                <div class="import-container"> 
                    <span class="import-container__title"> Import Basic Example </span> 
                    <div class="import-container__selector"> <v-select :options="basicExamples" label="name" v-model="importedBasicExample"/> </div>                
                    <button class="import-container__button" @click="importExample"> Load </button>
                    
                </div>
                <hr>
                <div class="import-container"> 
                    <span class="import-container__title"> Import SRD Feature </span> 
                    <div class="import-container__selector"> <v-select :options="srdFeatures" label="name" v-model="importedSrdFeature"/> </div>                
                    <button class="import-container__button" @click="importSrdAction"> Load </button>
                </div>
                <hr>
                <p> AUTOMATION </p>
                <button @click="saveAutomation(true)"> Save Automation! </button>
                <button @click="automationString = 'null'"> Clear </button>
                <hr>
                <div class="automation-editor">

                    <span class="error"> {{  errorMessage }} </span>
                    <CodeEditor 
                        width="100%" 
                        :wrap="true"  
                        :languages="[['yaml', 'YAML']]" 
                        v-model="automationString"
                        theme="obsidian"
                        height="600px"
                        font-size="10px"
                    >
                    </CodeEditor>
                </div>
            </section>
        </div>
    </Transition>
</Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core';
// highlight.js
import "highlight.js";
import 'highlight.js/styles/obsidian.css'

// @ts-ignore
import CodeEditor from 'simple-code-editor';
const isModalOpen = ref(false)
const modal = ref<HTMLDivElement | null>(null)
// @ts-ignore
onClickOutside(modal, () => (isModalOpen.value = false))
defineEmits(['createFeature'])

const openModal = () => {
    isModalOpen.value = true
    let els = document.querySelectorAll('.language-yaml') as NodeListOf<HTMLElement>
    for (let e in els) {
        if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = ""
    }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import YAML, { stringify, parse, YAMLParseError, Parser } from 'yaml'
// @ts-ignore
import CodeEditor from "simple-code-editor";
import { toast } from '@/main';
import { basicExamples, srdFeatures, type FeatureEntity } from './types';
export default defineComponent({
    props: ["type", "index", "data"],
    data() {
        return {
            isModalOpen: false,
            feat: this.data.features[this.type][this.index],
            automationString: "" as string,
            errorMessage: null as null | string,
            basicExamples: basicExamples,
            srdFeatures: srdFeatures,
            importedBasicExample: null as FeatureEntity | null,
            importedSrdFeature: null as FeatureEntity | null,
        }
    },
    components: {
        CodeEditor
    },
    mounted() {
        this.automationString = stringify(null)
        console.log(srdFeatures.length)
    },
    methods: {
        validateYaml() : boolean {
            try {
                YAML.parse(this.automationString)
                this.errorMessage = null
                return true
            }
            catch(err) {
                // @ts-ignore
                this.errorMessage = err
                return false
            }
        },
        saveAutomation(shouldNotify: boolean = false) {
            try {
                YAML.parse(this.automationString)
                this.feat.automation = YAML.parse(this.automationString)
                if (shouldNotify) toast.success("Saved Automation!")
            }
            catch(err) {
                // @ts-ignore
                if (shouldNotify) toast.error("YAML contains Error, did not save automation")
            }            
        },
        importExample() {
            if (!this.importedBasicExample) return
            this.feat.name = this.importedBasicExample.name
            this.feat.description = this.importedBasicExample.description
            this.automationString = stringify(this.importedBasicExample.automation)
            setTimeout(() => {
                let els = document.querySelectorAll('.language-yaml') as NodeListOf<HTMLElement>
                for (let e in els) {
                    if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = ""
                }
            }, 100);

            toast.success("Successfully loaded: " + this.importedBasicExample.name)
        },
        importSrdAction() {
            if (!this.importedSrdFeature) return
            this.feat.name = this.importedSrdFeature.name
            this.feat.description = this.importedSrdFeature.description
            this.automationString = stringify(this.importedSrdFeature.automation)
            setTimeout(() => {
                let els = document.querySelectorAll('.language-yaml') as NodeListOf<HTMLElement>
                for (let e in els) {
                    if (els[e].dataset?.highlighted == "yes") els[e].dataset.highlighted = ""
                }
            }, 100);

            toast.success("Successfully loaded: " + this.importedSrdFeature.name)
        }
    },
    watch: {
        automationString(newVal, oldVal) {
            this.validateYaml()

            if (this.feat.name == "New Feature" || this.feat.description == "") {
                try {
                    let parsedAutomation = YAML.parse(this.automationString)
                    if (Array.isArray(parsedAutomation)) {
                        if (parsedAutomation.length>0) parsedAutomation = parsedAutomation[0]
                        else return
                    } 
                    console.log(parsedAutomation)

                    if (parsedAutomation.name && this.feat.name == "New Feature") this.feat.name = parsedAutomation.name.replace(" (1H)", "").replace(" (2H)", "")

                    if (parsedAutomation.automation &&  this.feat.description == "") {
                        for (let type in parsedAutomation.automation) {
                            console.log(parsedAutomation.automation[type])
                            if (parsedAutomation.automation[type]['type'] == "text") {
                                console.log(parsedAutomation.automation[type]['text'])
                                this.feat.description = parsedAutomation.automation[type]['text']
                                break
                            } 
                           
                        }
                    }
                }
                catch {}
            }
        }
    },

})
</script>

<style scoped lang="less">
.error {
    color: red;
    font-weight: bold;
}

textarea {
    width: 100%
}

input {
    min-width: 20rem;
    width: fit-content;
}

.import-container {
    display: flex;
    gap: 1rem;

    &__title {
        width: 10rem
    }
    &__selector {
        width: 30rem
    }

}
.selector-container {
    width: 20rem;
}
</style>