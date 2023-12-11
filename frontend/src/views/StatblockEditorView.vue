<template>
	This is a page to edit a specific creature in a bestiary

<div class="content-container">
	<div class="content-container__inner editor"> 
        <div class="editor-nav">
            <div @click="currentSlide(1)" :class="{'active-slide': slideIndex === 1}" class="editor-nav__tab">
                <span> Description </span>
            </div>
            <div @click="currentSlide(2)" :class="{'active-slide': slideIndex === 2}" class="editor-nav__tab">
                <span> Core </span>
            </div>
            <div @click="currentSlide(3)" :class="{'active-slide': slideIndex === 3}" class="editor-nav__tab">
                <span> Stats </span>
            </div>
            <div @click="currentSlide(4)" :class="{'active-slide': slideIndex === 4}" class="editor-nav__tab">
                <span> Defense </span>
            </div>
            <div @click="currentSlide(5)" :class="{'active-slide': slideIndex === 5}" class="editor-nav__tab">
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
                    <v-select 
                        placeholder="Select Alignment or type one yourself" 
                        v-model="data.description.alignment"
                        :options='["Unaligned", "Good", "Neutral", "Evil", "Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil", "Any Alignment", "Typically Good", "Typically Neutral", "Typically Evil", "Typically Lawful Good", "Typically Neutral Good", "Typically Chaotic Good", "Typically Lawful Neutral", "Typically Chaotic Neutral", "Typically Lawful Evil", "Typically Neutral Evil", "Typically Chaotic Evil"]'
                        :taggable="true"
                        :pushTags="true"
                    />
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
                    <v-select 
                        placeholder="Select Race or type one yourself" 
                        v-model="data.core.race"
                        :options='["Aberration", "Beast", "Celestial", "Construct", "Dragon", "Elemental", "Fey", "Fiend", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead"]'
                        :taggable="true"
                        :pushTags="true"
                    />
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Size
                    </span>
                    <v-select 
                        placeholder="Select Size or type one yourself" 
                        v-model="data.core.size"
                        :options='["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"]'
                        :taggable="true"
                        :pushTags="true"
                    />
                </div>
                <h2> Speed </h2>
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
                <h2> Senses </h2>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Darkvision
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type senses..." v-model="data.core.senses.darkvision" step="5">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Blindsight
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.core.senses.blindsight" step="5">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Blind beyond this radius?
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.core.senses.isBlind">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Truesight
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.core.senses.truesight" step="5">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Tremorsense
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.core.senses.tremorsense" step="5">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Passive Perception Override
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" placeholder="Type senses..." v-model="data.core.senses.passivePerceptionOverride">
                    </div>
                </div>
                <h2> Languages </h2>
                <v-select 
                    placeholder="Select a Language or type one yourself" 
                    v-model="data.core.languages"
                    multiple
                    :options='languages'
                    :taggable="true"
                    :pushTags="true"
                />
                <h2> Telepathy </h2>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        Telepathy
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.core.senses.telepathy" step="5" min="0">
                    </div>
                </div>
            </div>
            <div class="editor-content__tab-inner fade">
                <h2> Ability Scores </h2>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        STR
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.str" min="1" max="30">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        DEX
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.dex" min="1" max="30">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CON
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.con" min="1" max="30">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        WIS
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.wis" min="1" max="30">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CHA
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.cha" min="1" max="30">
                    </div>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        INT
                    </span>
                    <div class="editor-field__contents">
                        <input type="number" v-model="data.abilities.stats.int" min="1" max="30">
                    </div>
                </div>
                <h2> Saving Throws </h2>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        STR
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.str.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.str.override" step=1 > <span @click="data.abilities.saves.str.override = null"> reset </span> </p>
                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        DEX
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.dex.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.dex.override" step=1 > <span @click="data.abilities.saves.dex.override = null"> reset </span> </p>

                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CON
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.con.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.con.override" step=1 > <span @click="data.abilities.saves.con.override = null"> reset </span> </p>

                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        WIS
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.wis.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.wis.override" step=1 > <span @click="data.abilities.saves.wis.override = null"> reset </span> </p>

                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        CHA
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.cha.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.cha.override" step=1 > <span @click="data.abilities.saves.cha.override = null"> reset </span> </p>

                </div>
                <div class="editor-field__slim">
                    <span class="editor-field__title">
                        INT
                    </span>
                    <div class="editor-field__contents">
                        <input type="checkbox" v-model="data.abilities.saves.int.isProficient">
                    </div>
                    <p>Override = <input type="number" placeholder="0" v-model="data.abilities.saves.int.override" step=1 > <span @click="data.abilities.saves.int.override = null"> reset </span> </p>

                </div>
                <h2> Skills </h2>
                <div class="editor-field__slim">
                    <div v-for="skill, index in data.abilities.skills">
                        <v-select 
                            placeholder="Select a skill" 
                            v-model="skill.skillName"
                            :options='["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"]'
                            :clearable="false"
                        />
                        <div class="editor-field__contents">
                        <p> Is Proficient? <input type="checkbox" v-model="skill.isProficient" @click="disableOtherSkills(index, 'prof', skill.isProficient)"> </p>
                        <p>Is Expertise? <input type="checkbox" v-model="skill.isExpertise" @click="disableOtherSkills(index, 'exp', skill.isExpertise)"> </p>
                        <p>Is Half Proficient? <input type="checkbox" v-model="skill.isHalfProficient" @click="disableOtherSkills(index, 'halfprof', skill.isHalfProficient)"> </p>
                        <p>Skill Override = <input type="number" placeholder="0" v-model="skill.override" step=1 > <span @click="skill.override = null"> reset </span> </p>
                        </div>
                        <button @click="deleteSkill(index)"> Delete </button>
                        <hr>
                    </div>
                    <div>
                        <button class="editor-field__plus-button" @click="addNewSkill()"> +
                        </button>
                    </div>
                </div>
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
                <h2> Vulnerabilities </h2>
                <v-select 
                    placeholder="Select a Vulnerability or type one yourself" 
                    v-model="data.defenses.vulnerabilities"
                    multiple
                    :options='["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Pyschic", "Radiant", "Slashing", "Thunder", "Nonmagical Nonsilvered Bludgeoning", "Nonmagical Nonsilvered Piercing", "Nonmagical Nonsilvered Slashing"]'
                    :taggable="true"
                    :pushTags="true"
                />
                <h2> Resistances </h2>
                <v-select 
                    placeholder="Select a Resistance or type one yourself" 
                    v-model="data.defenses.resistances"
                    multiple
                    :options='["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Pyschic", "Radiant", "Slashing", "Thunder", "Nonmagical Nonsilvered Bludgeoning", "Nonmagical Nonsilvered Piercing", "Nonmagical Nonsilvered Slashing"]'
                    :taggable="true"
                    :pushTags="true"
                />
                <h2> Immunities </h2>
                <v-select 
                    placeholder="Select an Immunity or type one yourelf" 
                    v-model="data.defenses.immunities"
                    multiple
                    :options='["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Pyschic", "Radiant", "Slashing", "Thunder", "Nonmagical Nonsilvered Bludgeoning", "Nonmagical Nonsilvered Piercing", "Nonmagical Nonsilvered Slashing"]'
                    :taggable="true"
                    :pushTags="true"
                />
                <h2> Condition Immunities </h2>
                <v-select 
                    placeholder="Select a Condition Immunity or type one yourelf" 
                    v-model="data.defenses.conditionImmunities"
                    multiple
                    :options='["Blinded", "Charmed", "Deafened", "Disease", "Exhaustion", "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious"]'
                    :taggable="true"
                    :pushTags="true"
                />
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
import type { SkillsEntity, Statblock } from "@/widgets/types";
import { defaultStatblock } from "@/widgets/types"
export default defineComponent({
	components: {
		StatblockRenderer
	},
    data() {
        return {
            slideIndex: 1,
            data: defaultStatblock as Statblock,
            list: [] as string[],
            languages: ["All", "All languages it knew in life", "Abyssal", "Aarakocra", "Aquan", "Auran", "Celestial", "Common", "Deep Speech", "Draconic", "Druidic", "Dwarvish", "Elvish", "Giant", "Gith", "Gnomish", "Goblin", "Halfling", "Ignan", "Infernal", "Orc", "Primordial", "Sylvan", "Terran", "Thieves' Cant", "Undercommon", "Understands the languages of its creator but can't speak"]
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
        },
        addNewSkill() : void {
            let index = 0;
            if (this.data.abilities.skills?.length) index  = this.data.abilities.skills?.length
            if (!this.data.abilities.skills) this.data.abilities.skills = []
            this.data.abilities.skills[index] = {
                "skillName": "" as string, 
                "isHalfProficient": false,
                "isProficient": true,
                "isExpertise": false ,
                "override": null
            } as SkillsEntity
        },
        disableOtherSkills(index: number, type: "prof" | "exp" | "halfprof", value: boolean) : void {
            if (!value && this.data.abilities.skills) {
                if (type == "prof") {
                    this.data.abilities.skills[index].isExpertise = false;
                    this.data.abilities.skills[index].isHalfProficient = false;
                }
                if (type == "exp") {
                    this.data.abilities.skills[index].isProficient = false;
                    this.data.abilities.skills[index].isHalfProficient = false;
                }
                if (type == "halfprof") {
                    this.data.abilities.skills[index].isExpertise = false;
                    this.data.abilities.skills[index].isProficient = false;
                }
            }
        },
        deleteSkill(index: number) : void {
            this.data.abilities.skills?.splice(index, 1)
        },
        skillList() : void {
            let list = ["acrobatics", "animal handling", "arcana", "athletics", "deception", "history", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleight of hand", "stealth", "survival"]
            let skills = this.data.abilities.skills
            if (!skills) this.list = list
            for (let skill = 0; skill++; skill < skills!.length) {
                list = list.filter(s => s !== skills![skill].skillName)
            }
            console.log(list)
            this.list = list
        }
    },
    mounted() {
        this.showSlides(1)

        this.skillList()
    },
    watch: {
        'data.abilities.skills'(newVal, oldVal) {
            this.skillList()
        }
    }


})
</script>

<style scoped lang="less">
.content-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
    width: 90vw;
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
