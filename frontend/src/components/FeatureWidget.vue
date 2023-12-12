<template>
<span> {{feat.name }} </span>
<button @click="isModalOpen = true">
    Edit Feature
</button>
<Teleport to="#modal">
    <Transition name="modal"> 
        <div class="modal__bg" v-if="isModalOpen"> 
            <section class="modal__content" ref="modal">  
                <button @click="isModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
                <p> NAME: </p> <input type="text" placeholder="Enter name" v-model="feat.name">
                <p> DESCRIPTION: </p> <input type="text" placeholder="Enter description" v-model="feat.description">
                <h3> AUTOMATION </h3>
                <div class="automation-editor">

                    <span class="error"> {{  errorMessage }} </span>
                    <CodeEditor 
                        width="100%" 
                        :wrap="true"  
                        :languages="[['yaml', 'YAML']]" 
                        v-model="automationString"
                        theme="obsidian"
                        height="500px"
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
</script>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SaveEntity, SkillsEntity, Statblock } from './types'
import YAML, { stringify, parse, YAMLParseError, Parser } from 'yaml'
// @ts-ignore
import yaml from 'js-yaml'
// @ts-ignore
import CodeEditor from "simple-code-editor";
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
        this.automationString = stringify(this.feat.automation)

    },
    methods: {
        validateYaml() {
            let value = ""
            try {
                value = yaml.load(this.automationString)
                this.errorMessage = null
            }
            catch(err) {
                // @ts-ignore
                this.errorMessage = err
            }
        }

    },
    watch: {
        automationString(newVal, oldVal) {
            this.validateYaml()
        }
    }
})
</script>

<style scoped lang="less">
.error {
    color: red;
    font-weight: bold;
}
</style>