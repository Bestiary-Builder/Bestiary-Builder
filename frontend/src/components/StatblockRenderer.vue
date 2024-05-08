<template>
<div class="stat-block">
    <div class="stat-block__row"> 
        <h1 class="stat-block__name-container"> {{ data.description.name }}</h1>
        <span class="stat-block__core"> {{ data.core.size }} {{ data.core.race }}{{ data.description.alignment ? ',' : '' }} {{ data.description.alignment }}</span>
        <img class="stat-block__image" :src="data.description.image" v-if="data.description.image"/>
    </div>
    <div class="stat-block__row">
        <div>  
            <b> Armor Class </b> {{ data.defenses.ac.ac }} <span v-if="data.defenses.ac.acSource"> ({{data.defenses.ac.acSource}}) </span> 
        </div>
        <div>
            <b> Hit Points </b>
            <span v-if="data.defenses.hp.override"> {{ data.defenses.hp.override  }}</span>
            <span v-else> {{ hpCalc(data) }} ({{ data.defenses.hp.numOfHitDie }}d{{data.defenses.hp.sizeOfHitDie }}{{ hitDieBonus }})</span>
        </div>
        <div class="stat-block__speed-container">
            <b> Speed </b>
            {{ displaySpeedOrSenses(data.core.speed) }}
        </div>
    </div>
    <div class="stat-block__row stat-block__abilities">
        <div v-for="stat in stats" :key="stat">
            <div> <b> {{ stat.toUpperCase()}} </b></div>
            <span> {{ data.abilities.stats[stat]}} ({{signedNumber(statCalc(stat, data)) }})</span>
        </div>
    </div>
    <div class="stat-block__row">
        <div v-if="Object.values(data.abilities.saves).some((val : any )=> (val.isProficient === true || val.override !== null))" class="stat-block__save-container"> 
            <b> Saving Throws </b>
            <template v-for="stat in stats" :key="stat">
                <span v-if="data.abilities.saves[stat].override !== null"> {{ capitalizeFirstLetter(stat) }} {{ signedNumber(data.abilities.saves[stat].override || 0) }} </span>
                <span v-else-if="data.abilities.saves[stat].isProficient"> {{ capitalizeFirstLetter(stat) }} {{ signedNumber(data.core.proficiencyBonus + statCalc(stat, data)) }} </span>
                <span v-if="data.abilities.saves[stat].override !== null || data.abilities.saves[stat].isProficient" class="ending-comma">, </span> 
            </template>
        </div>
        <div class="stat-block__skills-container" v-if="showSkills">
            <b> Skills </b>
            {{ skillOutput }}
        </div>
        <template v-for="title, resType of resistanceGenerator">
            <div class="stat-block__res-container" v-if="data.defenses[resType].length > 0">
                <b> {{ title }}  </b>
                <span> {{  alphaSort(data.defenses[resType]).join(", ") }} </span>
            </div>
        </template>
        <div ckass="stat-block__senses-container">
            <b> Senses </b>
            {{ displaySpeedOrSenses(data.core.senses, true) }}
            <span> passive Perception {{ ppCalc(data) }}</span>
        </div>
        <div class="stat-block__language-container"> 
            <b> Languages </b>
            <span v-if="data.core.languages && data.core.languages.length == 0 && !data.misc.telepathy"> — </span>
            <span v-else> {{ data.core.languages?.sort().join(", ") }} </span>
            <span v-if="data.misc.telepathy"> telepathy {{ data.misc.telepathy}}ft.</span>
        </div>
        <div class="challenge-prof">
            <span> <b> Challenge </b> {{ crAsString(data.description.cr) }} ({{ data.description.xp}} xp) </span>
            <span> <b> Proficiency Bonus </b> +{{ data.core.proficiencyBonus }}</span>
        </div>
    </div>
    <div class="stat-block__row" v-if="showFeatures || showCasting || showInnateCasting">
        <div class="feature-container"  v-if="data.features.features.length > 0 || showCasting || showInnateCasting">
            <p v-if="data.misc.featureHeaderTexts.features"> {{ data.misc.featureHeaderTexts.features }} </p>
            <p v-for="feature in data.features.features">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup> </b>
                <Markdown class="feature-container__desc" :text="feature.description" tag="span"/>
            </p>

            <p v-if="showInnateCasting && !data.spellcasting.innateSpells.displayAsAction">
                <b><i>Innate Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span>.</i></b> 
                <Markdown class="feature-container__desc" :text="displayInnateCasting(data)" tag="span"/>
            </p>

            <p v-if="showCasting && data.spellcasting.casterSpells.castingClass && data.spellcasting.casterSpells.casterLevel &&  data.spellcasting.casterSpells.spellSlotList">
                <b><i>Spellcasting</i></b> 
                <span class="feature-container__desc">
                    <span v-if="!data.description.isProperNoun"> The </span> {{ data.description.isProperNoun ? data.description.name : data.description.name.toLowerCase() }} is a {{ nthSuffix(data.spellcasting.casterSpells.casterLevel) }}-level spellcaster. <span v-if="data.description.isProperNoun"> Their </span><span v-else> Its </span> spellcasting ability is {{ fullSpellAbilityName(data.spellcasting.casterSpells.spellCastingAbilityOverride ?? data.spellcasting.casterSpells.spellCastingAbility) }} (spell save DC {{ spellDc(false, data) }}, {{ spellAttackBonus(false, data) }} to hit with spell attacks). <span v-if="!data.description.isProperNoun"> It </span><span v-else> {{ data.description.name }}</span><span v-if='["Sorcerer", "Bard", "Ranger", "Warlock"].includes(data.spellcasting.casterSpells.castingClass)'> knows the following {{ data.spellcasting.casterSpells.castingClass.toLowerCase()}} spells: </span> 
                        <span v-else> has the following {{ data.spellcasting.casterSpells.castingClass.toLowerCase()}} spells prepared: </span>

                    <div class="spell-list">
                        <p v-for="spells, level in data.spellcasting.casterSpells.spellList"> 
                            <div v-if="(level == 0 && !['Ranger', 'Paladin'].includes(data.spellcasting.casterSpells.castingClass) )|| Object.keys(data.spellcasting.casterSpells.spellSlotList).includes(level.toString())"> 
                                <span v-if="level==0 && spells.length > 0"> Cantrips (at will): </span>
                                <span v-else-if="spells.length > 0"> {{ nthSuffix(level) }} level ({{ data.spellcasting.casterSpells.spellSlotList[level] }} slots): </span>
                                <i> {{ spells.sort().join(", ") }} </i>
                            </div>
                        </p>
                    </div>
                </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.actions.length > 0 || (showInnateCasting && data.spellcasting.innateSpells.displayAsAction)">
            <h3 class="feature-container__title"> Actions </h3>
            <p v-if="data.misc.featureHeaderTexts.actions"> {{ data.misc.featureHeaderTexts.actions }} </p>
            <p v-for="feature in data.features.actions">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <Markdown class="feature-container__desc" :text="feature.description" tag="span"/>
            </p>

            <p v-if="showInnateCasting && data.spellcasting.innateSpells.displayAsAction">
                <b><i>Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span>.</i></b> 
                <Markdown class="feature-container__desc" :text="displayInnateCasting(data)" tag="span"/>
            </p>
        </div>

        <!-- TODO: Add features and actions to the generator here once they no longer need special handling because of spellcasting-->
        <template v-for="title, fType of featureGenerator">
            <div class="feature-container" v-if="data.features[fType].length > 0">
                <h3 class="feature-container__title"> {{ title }}</h3>
                <p v-if="fType == 'legendary' && data.misc.featureHeaderTexts[fType]"> {{ data.misc.featureHeaderTexts[fType].replace("$NUM$", data.misc.legActionsPerRound.toString()) }} </p>
                <p v-else-if="data.misc.featureHeaderTexts[fType]"> {{ data.misc.featureHeaderTexts[fType] }} </p>
                <p v-for="feature in data.features[fType]">
                    <b> <i> {{ feature.name}}.</i></b>
                    <sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup>
                    <Markdown class="feature-container__desc" :text="feature.description" tag="span"/>
                </p>
            </div>
        </template>
    </div>
    <div v-if="data.description.description" class="description">
        <h2 class="feature-container__title"> Description </h2>
        <Markdown :text="data.description.description" />
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Stat, SkillsEntity, Statblock } from "~/shared";
import { SKILLS_BY_STAT, nthSuffix, statCalc, hpCalc, crAsString, ppCalc, fullSpellAbilityName, signedNumber, displaySpeedOrSenses, spellDc, spellAttackBonus } from "~/shared"
import { displayInnateCasting, capitalizeFirstLetter } from '@/utils/displayFunctions';
import { stats, resistanceGenerator, featureGenerator } from '@/utils/constants';
import Markdown from './Markdown.vue';
export default defineComponent({
    props: {
        data: {
            type: Object as ()=>Statblock,
            required: true
        }
    },
    components: {
        Markdown
    },
    data() {
        return {
            stats,
            resistanceGenerator,
            featureGenerator
        }
    },
    methods: {
        saveSign(stat: Stat): string {
            if (!this.data.abilities.saves) return "";
            if (statCalc(stat, this.data)+this.data.core.proficiencyBonus >= 0 || (this.data.abilities.saves[stat] && this.data.abilities.saves[stat].override)) {
                return "+"
            }
            return ""
        },
        alphaSort(list: string[]) : string[] {
            const sortByLastWord = (a :string , b :string) => {
                const lastWordA = a.split(' ').pop();
                const lastWordB = b.split(' ').pop();
                return lastWordA!.localeCompare(lastWordB!);
            };
            return list.sort(sortByLastWord).map(v => v.toLowerCase())
        },
        displaySpeedOrSenses,
        displayInnateCasting,
        crAsString,
        nthSuffix,
        statCalc,
        hpCalc,
        ppCalc,
        fullSpellAbilityName,
        signedNumber,
        spellDc,
        spellAttackBonus,
        capitalizeFirstLetter
    },
    computed: {
        showSkills() : boolean {
            for (let skill of this.data.abilities.skills) {
                if (skill.isProficient || skill.isHalfProficient || skill.isExpertise || skill.override || skill.override == 0) return true
            }
            return false
        },
        showCasting() : boolean {
            return !!((this.data.spellcasting.casterSpells.casterLevel ) && this.data.spellcasting.casterSpells.castingClass ) 
        },
        showInnateCasting() : boolean {
            return (this.data.spellcasting.innateSpells.spellCastingAbility != null) && (
                this.data.spellcasting.innateSpells.spellList[0].length>0 ||
                this.data.spellcasting.innateSpells.spellList[1].length>0 ||
                this.data.spellcasting.innateSpells.spellList[2].length>0 ||
                this.data.spellcasting.innateSpells.spellList[3].length>0 
            )
        },
        showFeatures() : boolean {
            return Object.values(this.data.features).some(v => v.length > 0)
        },
        skillOutput() {
            let skills : SkillsEntity[] = Array.from(this.data.abilities.skills)
            skills.sort((a : SkillsEntity, b  : SkillsEntity) => {
                return a.skillName.localeCompare(b.skillName)
            })


            let seenSkillNames = new Set();

            // Use the filter method to create a new array without duplicates
            skills = skills.filter(obj => {
                if (seenSkillNames.has(obj.skillName)) {
                    // If the skill name is already seen, filter it out
                    return false;
                } else {
                    // Otherwise, add it to the set and include it in the result
                    seenSkillNames.add(obj.skillName);
                    return true;
                }
            });

            let output = []
            for (let skill of skills) {
                if (!skill.isExpertise && !skill.isHalfProficient && !skill.isProficient && !skill.override) continue

                let bonus = 0
                for (let stat in SKILLS_BY_STAT) {
                    if (SKILLS_BY_STAT[stat as Stat].includes(skill.skillName.replaceAll(" ", "").toLowerCase())) {
                        if (skill.override && skill.override !== null) {
                            let over = skill.override
                            output.push(`${skill.skillName} ${over ?? 0 >= 0 ? '+' : ''}${over}`)
                        } else {
                            bonus = statCalc(stat as Stat, this.data)
                            if (skill.isHalfProficient) {
                                bonus += Math.floor(this.data.core.proficiencyBonus/2)
                            } else if (skill.isProficient) {
                                bonus += this.data.core.proficiencyBonus
                            } else if (skill.isExpertise) {
                                bonus += this.data.core.proficiencyBonus*2
                            }
                            output.push(`${skill.skillName} ${bonus >= 0 ? '+' : ''}${bonus}`)
                        }
                        break;
                    } else continue;
                    
                }
            }
            return output.join(", ")
        },
        hitDieBonus(): string {
            let hp = this.data.defenses.hp.numOfHitDie * statCalc("con", this.data)
            if (hp != 0) {
                if (hp > 0) return "+" + hp.toString()
                else return hp.toString()
            }
            return ""
        },
    }
})
</script>

<style scoped lang="less">
@import "https://fonts.googleapis.com/css2?family=Convergence";

.stat-block {
    width: 100%;

    background-color: var(--color-surface-1);
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
    padding: .4rem;

    font-family:  'Convergence', 'Roboto',  monospace;
}

.stat-block__image {
    margin: 1rem auto;
    max-height: 300px;
}

.stat-block__row {
    display: block;
    width: 100%;
    margin-bottom: .6rem;
    margin-top: .6rem;
    border-bottom: 2px solid orangered;

    &:first-of-type {
        margin-top: 0;
    }

    &:last-of-type {
        border-bottom: unset;
        margin-bottom: 0;
    }

    &.no-bottom-border {
        border-bottom: unset;
    }
}

.stat-block__name-container {
    color: orangered;
    font-family: 'Times New Roman', Times, serif;
    margin-bottom: 0rem;
    text-align: left;
}

.stat-block__core {
    font-style: italic;
}
.stat-block__abilities {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    text-align: center;
}

.feature__has-automation-icodn {
    font-size: .7rem;
}

.stat-block__save-container  .ending-comma:last-of-type {
    display: none;
}

.feature-container {
    &__title {
        color: orangered;
        font-family: 'Times New Roman', Times, serif;
        font-weight: bold;
        border-bottom: 1px solid orangered;
        margin-top: .3rem;
    }

    p:not(:last-of-type) {
        margin-bottom: .2rem;
    }
}

.feature-container__desc {
    margin-left: .3rem;
    white-space: pre-line;
    overflow-wrap: anywhere;
}

.challenge-prof {
    display: flex;
    justify-content: space-between;
}

.description {
    overflow-wrap: anywhere;
}

// styling only for the markdown rendered content which is not inside the vue component scope
:global(.feature-container__desc p) {
    display: inline;
}
:global(.feature-container__desc ul) {
    white-space: normal;
    margin-bottom: 0
}
</style>

