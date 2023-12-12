<template>
<button @click="isModalOpen = true">
    Edit Feature
</button>
<Teleport to="#modal">
    <Transition name="modal"> 
        <div class="modal__bg" v-if="isModalOpen"> 
            <section class="modal__content" ref="modal">  
                <button @click="isModalOpen = false" class="modal__close-button" aria-label="Close Modal" type="button"><font-awesome-icon icon="fa-solid fa-xmark" /></button>
                <p> Name: </p> <input type="text" placeholder="Enter name" v-model="feat.name">
                <p> Description: </p> <input type="text" placeholder="Enter description" v-model="feat.description">

            </section>
        </div>
    </Transition>
</Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core';

const isModalOpen = ref(false)
const modal = ref<HTMLDivElement | null>(null)
onClickOutside(modal, () => (isModalOpen.value = false))
defineEmits(['createFeature'])

</script>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SaveEntity, SkillsEntity, Statblock } from './types'
import { stringify, parse } from 'yaml'

export default defineComponent({
    props: ["type", "index", "data"],
    data() {
        return {
            isModalOpen: false,
            feat: this.data.features[this.type][this.index]
        }
    },
    methods: {
        addFeature() :void {
            console.log("this hit?")
            this.$emit('createFeature', this.type, {})
        }
    }
})
</script>

<style scoped lang="less">
</style>