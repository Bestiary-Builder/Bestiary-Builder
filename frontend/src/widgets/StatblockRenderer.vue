<template>
<div class="stat-block">
    <div class="stat-block__row"> 
        <span class="stat-block__name-container"> {{ data.description.name }}</span>
        <span class="stat-block__core"> {{ data.core.size }} {{ data.core.race }}, {{ data.description.alignment }}</span>
    </div>
    <div class="stat-block__row">
        <div>  
            <b> Armor Class </b> {{ data.defenses.ac.ac }} <span v-if="data.defenses.ac.acSource"> ({{data.defenses.ac.acSource}}) </span> 
        </div>
        <div>
            <b> Hit Points </b>
            <span v-if="data.defenses.hp.override"> {{ data.defenses.hp.override  }}</span>
            <span v-else> {{ hpCalc() }} ({{ data.defenses.hp.numOfHitDie }}d{{data.defenses.hp.sizeOfHitDie }})</span>
        </div>
        <div>
            <b> Speed </b>
            <span> {{ data.core.speed.walk }} ft.</span>
            <span v-if="data.core.speed.fly">
                / fly {{ data.core.speed.fly }} ft.
                <span v-if="data.core.speed.isHover">
                    ({{data.core.speed.isHover }})
                </span>
            </span>
            <span v-if="data.core.speed.swim">
                / swim {{ data.core.speed.swim }} ft.
            </span>
            <span v-if="data.core.speed.burrow">
                / burrow {{ data.core.speed.burrow }} ft.
            </span>
        </div>
    </div>
    <div class="stat-block__row stat-block__abilities">
        <div>
            <div> <b>STR</b> </div>
            <span> {{ data.abilities.stats.str }}  ({{ statSign("str")}}{{ statCalc("str") }})</span>
        </div>
        <div>
            <div> <b>DEX</b> </div>
            <span> {{ data.abilities.stats.dex }}  ({{ statSign("dex")}}{{ statCalc("dex") }})</span>
        </div>
        <div>
            <div> <b>CON</b> </div>
            <span> {{ data.abilities.stats.con }}  ({{ statSign("con")}}{{ statCalc("con") }})</span>
        </div>
        <div>
            <div> <b>INT</b> </div>
            <span> {{ data.abilities.stats.int }}  ({{ statSign("int")}}{{ statCalc("int") }})</span>
        </div>
        <div>
            <div> <b>WIS</b> </div>
            <span> {{ data.abilities.stats.wis }}  ({{ statSign("wis")}}{{ statCalc("wis") }})</span>
        </div>
        <div>
            <div> <b>CHA</b> </div>
            <span> {{ data.abilities.stats.cha }}  ({{ statSign("cha")}}{{ statCalc("cha") }})</span>
        </div>

    </div>
</div>

<div class="stat-block-description">
    {{ data.description.description }}
</div>
<span id="bla"> {{  data  }} </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Statblock } from './types';
export default defineComponent({
    props: ["data"],
    data() {
        return {
            
        }
    },
    methods: {
        hpCalc(): number {
            let conMod = this.statCalc("con")
            return Math.floor(this.data.defenses.hp.numOfHitDie * ( (this.data.defenses.hp.sizeOfHitDie + 1)/2 + this.statCalc("con")))
        },
        statCalc(stat: string) : number {
            return Math.floor(this.data.abilities.stats[stat]/2)-5
        },
        statSign(stat: string) {
            if (this.statCalc(stat) >=0) {
                return "+"
            }
            return ""
        }
    }

})
</script>

<style scoped lang="less">
.stat-block {
    width: 100%;
    height: 30rem;
    margin: .1rem
}

.stat-block__row {
    display: block;
    width: 100%;
    border-bottom: 2px solid yellowgreen;
    margin-left: .3rem;
    margin-bottom: .6rem;
    margin-top: .6rem;
}

.stat-block__name-container {
    font-size: 2rem;
    width: 100%;
    margin: .2rem;
    margin-bottom: 0;
    display: block;
}

.stat-block__core {
    font-style: italic;
}
.stat-block__abilities {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    text-align: center;
}


#bla {
    display: block;
    margin-top: 10rem;
}


</style>