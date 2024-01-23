<template>
    <LabelledComponent title="Description">
        <textarea v-model="data.text" id="description" />
    </LabelledComponent>
    <LabelledComponent title="Title">
        optional
        <input type="text" v-model="data.title" id="title" />
    </LabelledComponent>
{{ data }}
</template>

<script lang="ts">
import  { defineComponent } from 'vue';
import LabelledComponent from '../LabelledComponent.vue';
export default defineComponent({
    props: {
        data: {
            type: Object,
            required: true
        },
    },
    components: {
        LabelledComponent
    },
    computed: {
    },
    data() {
        return {}
    }
})
</script>