<template>
<div class="wrapper" @click.stop="clickHandler">
    <h3 v-if="depth == 0">Attack Tree</h3>
    <h3 v-else :style="'margin-left:'+depth.toString()+'rem'"> {{ depth }} {{title ? title : data.type || `${data.label} (Button)`}}</h3>
    <Node v-if="Array.isArray(data)" v-for="level, index in data" :data="level" :depth="depth+1" :traverse-info="traverseInfo.concat([index])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-else-if="data.effects || null" :data="d" v-for="d, index in data['effects']" :depth="depth+1" :index="index" :traverse-info="traverseInfo.concat(['effects', index])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-else-if="data.buttons || null" :data="d" v-for="d, index in data['buttons']" :depth="depth+1" :index="index" :traverse-info="traverseInfo.concat(['buttons', index])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.success || null" :data="data.success" :depth="depth+1" title="success" :traverse-info="traverseInfo.concat(['success'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.fail || null" :data="data.fail" :depth="depth+1" title="fail" :traverse-info="traverseInfo.concat(['fail'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.hit || null" :data="data.hit" :depth="depth+1" title="hit" :traverse-info="traverseInfo.concat(['hit'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.miss || null" :data="data.miss" :depth="depth+1" title="miss" :traverse-info="traverseInfo.concat(['miss'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.onTrue || null" :data="data.onTrue" :depth="depth+1" title="onTrue" :traverse-info="traverseInfo.concat(['onTrue'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
    <Node v-if="data.onFalse || null" :data="data.onFalse" :depth="depth+1" title="onFalse" :traverse-info="traverseInfo.concat(['onFalse'])" :root-data="rootData" @changeCurrent="(current: any) => $emit('changeCurrent', current)"/>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: "Node",
    emits: ["changeCurrent"],
    props: {
        data: {
            type: Object,
            required: true
        },
        rootData: {
            type: Object,
            required: true
        },
        traverseInfo: {
            type: Array<any>,
            default: []
        },
        depth: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            default: ""
        }
    },
    methods: {
        clickHandler() {
            let current = this.rootData;
            let path = this.traverseInfo;

            for (const step of path) {
                if (typeof step === 'number') {
                    current = current[step];
                } else if (typeof step === 'string') {
                    current = current[step];
                }
            }
            this.$emit('changeCurrent', current)
            return current;
        },
    }

})
</script>

<style lang="less" scoped>
</style>