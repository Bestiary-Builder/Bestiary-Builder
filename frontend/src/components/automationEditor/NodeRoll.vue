<template>
    <LabelledComponent title="Dice roll">
        <input type="text" v-model="data.dice" id="diceroll" />
    </LabelledComponent>
    <LabelledComponent title="Variable name">
        <input type="text" v-model="data.name" id="variablename" />
    </LabelledComponent>
    <LabelledComponent title="Display name">
        optional
        <input type="text" v-model="data.displayName" id="displayname" />
    </LabelledComponent>
    <LabelledComponent title="Scale like a cantrip">
        optional
        <span>
            toggle <input type="checkbox" v-model="data.cantripScale" id="scalelikeacantrip"/> 
        </span>
    </LabelledComponent>
    <LabelledComponent title="Hidden">
        optional
        <span>
            toggle <input type="checkbox" v-model="data.hidden" id="hidden"/> 
        </span>
    </LabelledComponent>
    <LabelledComponent title="Fixed value">
        optional
        <span>
            toggle <input type="checkbox" v-model="data.fixedValue" id="fixedvalue"/> 
        </span>
    </LabelledComponent>
    to implement: higher levels. maybe?
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