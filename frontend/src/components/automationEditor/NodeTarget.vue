<template>
<LabelledComponent title="Target type">
    <v-select
        v-model="data.target"
        :options="options"
        inputId="targettype"
        :clearable="false"
    />
</LabelledComponent>
<LabelledComponent title="Sort by">
    optional
    <v-select
        v-model="data.sortBy"
        :options="[{label: 'No sorting', code: null}, {label: 'Hp Ascending', code: 'hp_asc'}, {label: 'Hp Descending', code: 'hp_desc'}]"
        :reduce="(opt : any) => opt.code"
        inputId="sortby"
        :clearable="false"
    />
</LabelledComponent>
<LabelledComponent title="Target self">
    optional
    <span>
        toggle <input type="checkbox" v-model="data.self_target" id="targetself"/> 
    </span>
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
        isIeffectButton: {
            type: Boolean,
            default: false
        }
    },
    components: {
        LabelledComponent
    },
    computed: {
        options() {
            if (this.isIeffectButton) return ['all', 'each', 'int', 'self', 'parent', 'children'];
            return ['all', 'each', 'int', 'self'];
        }
    },
    data() {
        return {

        }
    }
})
</script>