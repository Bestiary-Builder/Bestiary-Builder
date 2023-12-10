<template>
	This is a page to edit a specific creature in a bestiary

<div class="content-container">
	<div class="content-container__inner editor"> 
        <div class="editor-nav">
            <div @click="currentSlide(1)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Description </span>
            </div>
            <div @click="currentSlide(2)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Core </span>
            </div>
            <div @click="currentSlide(3)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Stats </span>
            </div>
            <div @click="currentSlide(4)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Defense </span>
            </div>
            <div @click="currentSlide(5)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Features </span>
            </div>
        </div>

        <div class="editor-content">
            <div class="editor-content__tab-inner fade">
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Name
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type name..." v-model="data.description.name">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Desc
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type description..." v-model="data.description.description">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Image URL
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type image url..." v-model="data.description.image">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Environment
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type environment..." v-model="data.description.environment">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Faction
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type faction..." v-model="data.description.faction">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Alignment
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type alignment..." v-model="data.description.alignment">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CR 
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="0" v-model="data.description.cr" min="0" max="30" @change="updateCr()">
                    </div>
                </div>
            </div>
            <div class="editor-content__tab-inner fade">
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Race
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type race..." v-model="data.core.race">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Size
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type size..." v-model="data.core.size">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Walk Speed
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type walking speed..." step="5" v-model="data.core.speed.walk">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Fly Speed
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type walking speed..." step="5" v-model="data.core.speed.fly">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Can Hover
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" placeholder="Type walking speed..." step="5" v-model="data.core.speed.isHover">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Swim Speed
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type walking speed..." step="5" v-model="data.core.speed.swim">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Burrow Speed
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type walking speed..." step="5" v-model="data.core.speed.burrow">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Senses
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type senses..." v-model="data.core.senses.darkvision">
                    </div>
                </div>
                Languages
            </div>
            <div class="editor-content__tab-inner fade">
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        STR
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.str">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        DEX
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.dex">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CON
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.con">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        WIS
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.wis">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CHA
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.cha">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        INT
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.int">
                    </div>
                </div>
                Saving Throws
                Skills (prof/exp/JoAT/override)
            </div>
            <div class="editor-content__tab-inner fade">
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Hit Die Size
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="0" v-model="data.defenses.hp.sizeOfHitDie" min="1" >
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Number of Hit Die
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="0" v-model="data.defenses.hp.numOfHitDie" min="1" >
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        HP Override
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="0" v-model="data.defenses.hp.override" min="1" >
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Armor Class
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="0" v-model="data.defenses.ac.ac" min="0" step="1" >
                    </div>
                </div>                
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Armor Type
                    </span>
                    <div class="editor-field__contents">
                        <input type="text" placeholder="Type race..." v-model="data.defenses.ac.acSource">
                    </div>
                </div>
                Vulnerabilities
                Resistances
                Immunities
                Condition Immunities
            </div>
            <div class="editor-content__tab-inner fade">
                Actions
                Bonus Actions
                Reactions
                Legendary Actions
                Lair Actions
                Features
            </div>
        </div>

    </div>
<div class="content-container__inner"> 
    <StatblockRenderer :data='data'/>
</div>
</div>

</template>

<script lang="ts">
import {RouterLink, RouterView} from "vue-router";
import { defineComponent, watch } from "vue";
import StatblockRenderer from "../widgets/StatblockRenderer.vue";
import type { Statblock } from "@/widgets/types";
import { defaultStatblock } from "@/widgets/types"
export default defineComponent({
	components: {
		StatblockRenderer
	},
    data() {
        return {
            slideIndex: 1,
            data: defaultStatblock as Statblock,

            nameVar: ""
        }
    },
    methods: {
        plusSlides(n: number) {
            this.showSlides((this.slideIndex += n));
        },

        currentSlide(n: number) {
            this.showSlides((this.slideIndex = n));
        },

        showSlides(n: number) {
            let i;
            let slides = document.getElementsByClassName("editor-content__tab-inner") as any;
            if (n > slides.length) {
                this.slideIndex = 1;
            }
            if (n < 1) {
                this.slideIndex = slides.length;
            }
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
            }

            slides[this.slideIndex - 1].style.display = "block";
        },
        updateCr() : void {
            let cr = this.data.description.cr
            let bonus = Math.min(9, Math.floor((cr + 3) / 4));

            this.data.core.proficiencyBonus = bonus
        }
    },

})
</script>

<style scoped lang="less">
.content-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
    width: 90vw;
	height: 60rem;
	gap: 2rem;
}

.content-container__inner {
	background-color: rgb(46, 44, 44);
}

.editor-nav {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    text-align: center;
    gap: .5rem;
    height: fit-content;
    &__tab {
        background: var(--color-surface-2);
        padding: .3rem;
        cursor: pointer;
        & span {
            font-size: 1.2rem
        }
    }
}
.fade {
    animation-name: fade-in;
    animation-duration: 1s;
    animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}
@keyframes fade-in {
    from {
        opacity: 0;
        translate: 0 30%;
    }
    to {
        opacity: 1;
        translate: 0 0;
    }
}
</style>
