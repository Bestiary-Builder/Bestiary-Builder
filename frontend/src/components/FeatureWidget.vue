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
                <p> DESCRIPTION: </p> <textarea rows="8" type="text" placeholder="Enter description" v-model="feat.description" />
                <p> AUTOMATION </p>
                <button @click="saveAutomation()"> Save Automation! </button>
                <button @click="automationString = 'null'"> Clear </button>
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
export default defineComponent({
    props: ["type", "index", "data"],
    data() {
        return {
            isModalOpen: false,
            feat: this.data.features[this.type][this.index],
            automationString: "" as string,
            errorMessage: null as null | string
        }
    },
    components: {
        CodeEditor
    },
    mounted() {
        this.automationString = stringify(null)
        //this.feat = this.data.features[this.type][this.index]   

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
        saveAutomation() {
            try {
                YAML.parse(this.automationString)
                this.feat.automation = YAML.parse(this.automationString)
                toast.success("Saved Automation!")
            }
            catch(err) {
                // @ts-ignore
                toast.error("YAML contains Error, did not save automation")
            }            
        }

    },
    watch: {
        automationString(newVal, oldVal) {
            this.validateYaml()

            if (this.feat.name == "New Feature" || this.feat.description == "") {
                try {
                    const parsedAutomation = YAML.parse(this.automationString)
                    console.log(parsedAutomation)

                    if (parsedAutomation.name && this.feat.name == "New Feature") this.feat.name = parsedAutomation.name

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
</style>