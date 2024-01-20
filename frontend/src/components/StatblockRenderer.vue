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
            <span v-else> {{ hpCalc() }} ({{ data.defenses.hp.numOfHitDie }}d{{data.defenses.hp.sizeOfHitDie }}{{ hitDieBonus() }})</span>
        </div>
        <div class="stat-block__speed-container">
            <b> Speed </b>
            {{ displaySpeedOrSenses(data.core.speed) }}
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
    <div class="stat-block__row">
        <div v-if="Object.values(data.abilities.saves).some((val : any )=> (val.isProficient === true || val.override !== null))" class="stat-block__save-container"> 
            <b> Saving Throws </b>
            <span v-if="null !== data.abilities.saves.str.override"> Str {{ saveSign("str") }}{{data.abilities.saves.str.override }}<span class="ending-comma">,</span> </span> <span v-else-if="data.abilities.saves.str.isProficient"> Str {{ saveSign("str") }}{{statCalc("str")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="null !== data.abilities.saves.dex.override"> Dex {{ saveSign("dex") }}{{data.abilities.saves.dex.override }}<span class="ending-comma">,</span> </span> <span v-if="data.abilities.saves.dex.isProficient"> Dex {{ saveSign("dex") }}{{statCalc("dex")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="null !== data.abilities.saves.con.override"> Con {{ saveSign("con") }}{{data.abilities.saves.con.override }}<span class="ending-comma">,</span> </span> <span v-if="data.abilities.saves.con.isProficient"> Con {{ saveSign("con") }}{{statCalc("con")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="null !== data.abilities.saves.int.override"> Int {{ saveSign("int") }}{{data.abilities.saves.int.override }}<span class="ending-comma">,</span> </span> <span v-if="data.abilities.saves.int.isProficient"> Int {{ saveSign("int") }}{{statCalc("int")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="null !== data.abilities.saves.wis.override"> Wis {{ saveSign("wis") }}{{data.abilities.saves.wis.override }}<span class="ending-comma">,</span> </span> <span v-if="data.abilities.saves.wis.isProficient"> Wis {{ saveSign("wis") }}{{statCalc("wis")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="null !== data.abilities.saves.cha.override"> Cha {{ saveSign("cha") }}{{data.abilities.saves.cha.override }}<span class="ending-comma">,</span> </span> <span v-if="data.abilities.saves.cha.isProficient"> Cha {{ saveSign("cha") }}{{statCalc("cha")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
        </div>
        <div class="stat-block__skills-container" v-if="showSkills()">
            <b> Skills </b>
            {{ skillOutput() }}
        </div>
        <div class="stat-block__vuln-container" v-if="data.defenses.vulnerabilities && data.defenses.vulnerabilities.length > 0">
            <b> Vulnerabilities </b>
            <span v-for="vuln in alphaSort(data.defenses.vulnerabilities)">
                <span>{{vuln.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__res-container" v-if="data.defenses.resistances && data.defenses.resistances.length > 0">
            <b> Resistances </b>
            <span v-for="res in alphaSort(data.defenses.resistances)">
                <span>{{res.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__imm-container" v-if="data.defenses.immunities && data.defenses.immunities.length > 0">
            <b> Immunities </b>
            <span v-for="imm in alphaSort(data.defenses.immunities)">
                <span>{{imm.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__imm-container" v-if="data.defenses.conditionImmunities && data.defenses.conditionImmunities.length > 0">
            <b> Condition Immunities </b>
            <span v-for="con in alphaSort(data.defenses.conditionImmunities)">
                <span>{{con.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div ckass="stat-block__senses-container">
            <b> Senses </b>
            {{ displaySpeedOrSenses(data.core.senses, true) }}
            <span> passive Perception {{ ppCalc() }}</span>
        </div>
        <div class="stat-block__language-container"> 
            <b> Languages </b>
            <span v-if="data.core.languages && data.core.languages.length == 0 && !data.misc.telepathy"> — </span>
            <span v-else v-for="lang in data.core.languages?.sort()">
                <span> {{ lang }}<span class="ending-comma">, </span></span>
            </span>
            <span v-if="data.misc.telepathy"> telepathy {{ data.misc.telepathy}}ft.</span>

        </div>
        <div class="challenge-prof">
            <span> <b> Challenge </b> {{ displayCR(data.description.cr) }} ({{ data.description.xp}} xp) </span>
            <span> <b> Proficiency Bonus </b> +{{ data.core.proficiencyBonus }}</span>
        </div>
    </div>
    <div class="stat-block__row" v-if="showFeatures() || showCasting() || showInnateCasting()">
        <div class="feature-container"  v-if="data.features.features.length > 0 || showCasting() || showInnateCasting()">
            <p v-if="data.misc.featureHeaderTexts.features"> {{ data.misc.featureHeaderTexts.features }} </p>
            <p v-for="feature in data.features.features">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup> </b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>


            <p v-if="showInnateCasting() && !data.spellcasting.innateSpells.displayAsAction">
                <b><i>Innate Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span> </i></b> 
                <span class="feature-container__desc">
                    <span v-if="!data.description.isProperNoun"> The </span> {{ data.description.name }}'s spellcasting ability is {{ fullSpellAbilityName(true) }} (spell save DC {{ spellDc(true) }}, {{ spellAttackBonus(true) }} to hit with spell attacks). <span v-if="!data.description.isProperNoun"> It </span><span v-else> {{ data.description.name }}</span> can innately cast the following spells<span v-if="data.spellcasting.innateSpells.noComponentsOfType.length ==0">:</span>
                    <span v-else> {{ componentsString() }} </span>

                    <div class="spell-list">
                        <div v-if="data.spellcasting.innateSpells.spellList[0].length > 0"> 
                            <span> At will: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[0].map(x => x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell).sort().join(", ").toLowerCase() }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[3].length > 0"> 
                            <span> 3/day{{ data.spellcasting.innateSpells.spellList[3].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[3].map(x => x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell).sort().join(", ").toLowerCase() }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[2].length > 0"> 
                            <span> 2/day{{ data.spellcasting.innateSpells.spellList[2].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[2].map(x => x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell).sort().join(", ").toLowerCase() }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[1].length > 0"> 
                            <span> 1/day{{ data.spellcasting.innateSpells.spellList[1].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[1].map(x => x.comment.length > 0 ? `${x.spell} (${x.comment})` : x.spell).sort().join(", ").toLowerCase() }} </i> 
                        </div>
                    </div>
                </span>
            </p>

            <p v-if="showCasting() && data.spellcasting.casterSpells.castingClass && data.spellcasting.casterSpells.casterLevel &&  data.spellcasting.casterSpells.spellSlotList">
                <b><i>Spellcasting</i></b> 
                <span class="feature-container__desc">
                    <span v-if="!data.description.isProperNoun"> The </span> {{ data.description.isProperNoun ? data.description.name : data.description.name.toLowerCase() }} is a {{ nthSuffix(data.spellcasting.casterSpells.casterLevel) }}-level spellcaster. <span v-if="data.description.isProperNoun"> Their </span><span v-else> Its </span> spellcasting ability is {{ fullSpellAbilityName() }} (spell save DC {{ spellDc() }}, {{ spellAttackBonus() }} to hit with spell attacks). <span v-if="!data.description.isProperNoun"> It </span><span v-else> {{ data.description.name }}</span><span v-if='["Sorcerer", "Bard", "Ranger", "Warlock"].includes(data.spellcasting.casterSpells.castingClass)'> knows the following {{ data.spellcasting.casterSpells.castingClass.toLowerCase()}} spells: </span> 
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

        <div class="feature-container" v-if="data.features.actions.length > 0 || (showInnateCasting() && data.spellcasting.innateSpells.displayAsAction)">
            <h3 class="feature-container__title"> Actions </h3>
            <p v-if="data.misc.featureHeaderTexts.actions"> {{ data.misc.featureHeaderTexts.actions }} </p>
            <p v-for="feature in data.features.actions">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>

            <p v-if="showInnateCasting() && data.spellcasting.innateSpells.displayAsAction">
                <b><i>Spellcasting<span v-if="data.spellcasting.innateSpells.isPsionics"> (Psionics)</span> </i></b> 
                <span class="feature-container__desc">
                    <span v-if="!data.description.isProperNoun"> The </span> {{ data.description.isProperNoun ? data.description.name : data.description.name.toLowerCase() }} casts one of the following spells{{ componentsString(false) }} and using {{ fullSpellAbilityName(true) }} as the spellcasting ability (spell save DC {{ spellDc(true) }}, {{ spellAttackBonus(true) }} to hit with spell attacks).

                    <div class="spell-list">
                        <div v-if="data.spellcasting.innateSpells.spellList[0].length > 0"> 
                            <span> At will: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[0].map(x => x.comment.length > 0 ? `${x.spell.toLowerCase()} (${x.comment})` : x.spell.toLowerCase()).sort().join(", ") }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[3].length > 0"> 
                            <span> 3/day{{ data.spellcasting.innateSpells.spellList[3].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[3].map(x => x.comment.length > 0 ? `${x.spell.toLowerCase()} (${x.comment})` : x.spell.toLowerCase()).sort().join(", ") }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[2].length > 0"> 
                            <span> 2/day{{ data.spellcasting.innateSpells.spellList[2].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[2].map(x => x.comment.length > 0 ? `${x.spell.toLowerCase()} (${x.comment})` : x.spell.toLowerCase()).sort().join(", ") }} </i> 
                        </div>
                        <div v-if="data.spellcasting.innateSpells.spellList[1].length > 0"> 
                            <span> 1/day{{ data.spellcasting.innateSpells.spellList[1].length > 1 ? ' each' : "" }}: </span>
                            <i> {{ data.spellcasting.innateSpells.spellList[1].map(x => x.comment.length > 0 ? `${x.spell.toLowerCase()} (${x.comment})` : x.spell.toLowerCase()).sort().join(", ") }} </i> 
                        </div>
                    </div>
                </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.bonus.length > 0">
            <h3 class="feature-container__title"> Bonus Actions </h3>
                <p v-if="data.misc.featureHeaderTexts.bonus"> {{ data.misc.featureHeaderTexts.bonus }} </p>
                <p v-for="feature in data.features.bonus">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.reactions.length > 0">
            <h3 class="feature-container__title"> Reactions </h3>
                <p v-if="data.misc.featureHeaderTexts.reactions"> {{ data.misc.featureHeaderTexts.reactions }} </p>
                <p v-for="feature in data.features.reactions">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.legendary.length > 0">
            <h3 class="feature-container__title"> Legendary Actions </h3>
                <p v-if="data.misc.featureHeaderTexts.legendary"> {{ data.misc.featureHeaderTexts.legendary.replace("$NUM$", data.misc.legActionsPerRound.toString()) }} </p>
                <p v-for="feature in data.features.legendary">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.mythic.length > 0">
            <h3 class="feature-container__title"> Mythic Actions </h3>
                <p v-if="data.misc.featureHeaderTexts.mythic"> {{ data.misc.featureHeaderTexts.mythic }} </p>
                <p v-for="feature in data.features.mythic">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.lair.length > 0">
            <h3 class="feature-container__title"> Lair Actions </h3>
                <p v-if="data.misc.featureHeaderTexts.lair"> {{ data.misc.featureHeaderTexts.lair }} </p>
                <p v-for="feature in data.features.lair">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.regional.length > 0">
            <h3 class="feature-container__title"> Regional Effects </h3>
                <p v-if="data.misc.featureHeaderTexts.regional"> {{ data.misc.featureHeaderTexts.regional }} </p>
                <p v-for="feature in data.features.regional">
                <b> <i>{{ feature.name }}.</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc" v-html="sanitizeAndFormat(feature.description)"> </span>
            </p>
        </div>
    </div>
    <div v-if="data.description.description" class="description">
        <h2 class="feature-container__title"> Description </h2>
        <div v-html="md.render(data.description.description)"></div>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Stat, SaveEntity, SkillsEntity, Statblock, InnateSpells, CasterSpells } from '../generic/types'
import { stringify } from 'yaml'
import { displayCR, displaySpeedOrSenses } from '@/generic/displayFunctions';
import markdownit from "markdown-it"
const md = markdownit()
export default defineComponent({
    props: {
        data: {
            type: Object as ()=>Statblock,
            required: true
        }
    },
    data() {
        return {
            displayCR: displayCR,
            md
        }
    },
    methods: {
        hpCalc(): number {
            return Math.floor(this.data.defenses.hp.numOfHitDie * ( (this.data.defenses.hp.sizeOfHitDie + 1)/2 + this.statCalc("con")))
        },
        statCalc(stat: Stat) : number {
            return Math.floor(this.data.abilities.stats[stat]/2)-5
        },
        ppCalc(): number { 
            if (this.data.misc.passivePerceptionOverride !== null) return this.data.misc.passivePerceptionOverride
            else { 
                let skills = this.data.abilities.skills
                if (skills) {
                    for (let skill of skills) {
                        if (skill.skillName == "Perception") {
                            if (skill.override || skill.override==0) return 10 + skill.override
                            if (skill.isHalfProficient) return 10 + this.statCalc("wis") + Math.floor(this.data.core.proficiencyBonus/2)
                            if (skill.isProficient) return 10 + this.statCalc("wis") + this.data.core.proficiencyBonus
                            if (skill.isExpertise) return 10 + this.statCalc("wis") + this.data.core.proficiencyBonus*2
                            break;
                        }
                    }
                } 
            }
            return 10 + this.statCalc("wis")
        },
        statSign(stat: Stat): string {
            if (this.statCalc(stat) >=0) {
                return "+"
            }
            return ""
        },
        saveSign(stat: Stat): string {
            if (!this.data.abilities.saves) return "";
            if (this.statCalc(stat)+this.data.core.proficiencyBonus >= 0 || (this.data.abilities.saves[stat] && this.data.abilities.saves[stat].override)) {
                return "+"
            }
            return ""
        },
        hitDieBonus(): string {
            let hp = this.data.defenses.hp.numOfHitDie * this.statCalc("con")
            if (hp != 0) {
                if (hp > 0) return "+" + hp.toString()
                else return hp.toString()
            }
            return ""
        },
        skillOutput() {
            let skills : SkillsEntity[] = Array.from(this.data.abilities.skills)
            skills.sort((a : SkillsEntity, b  : SkillsEntity) => {
                return a.skillName.localeCompare(b.skillName)
            })

            const SKILLS_BY_STAT = {
                "str": ["athletics"],
                "dex": ["acrobatics", "sleightofhand", "stealth"],
                "con": [],
                "int": ["arcana", "history", "investigation", "nature", "religion"],
                "wis": ["animalhandling", "insight", "medicine", "perception", "survival"],
                "cha": ["deception", "intimidation", "performance", "persuasion"]
            } as any


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
                    if (SKILLS_BY_STAT[stat].includes(skill.skillName.replaceAll(" ", "").toLowerCase())) {
                        if (skill.override && skill.override !== null) {
                            let over = skill.override
                            output.push(`${skill.skillName} ${over ?? 0 >= 0 ? '+' : ''}${over}`)
                        } else {
                            // @ts-ignore
                            bonus = this.statCalc(stat)
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
        alphaSort(list: string[]) : string[] {
            const sortByLastWord = (a :string , b :string) => {
                const lastWordA = a.split(' ').pop();
                const lastWordB = b.split(' ').pop();
                // @ts-ignore
                return lastWordA.localeCompare(lastWordB);
                };
            return list.sort(sortByLastWord)
        },
        langSort(list: string[]) : string[] {
            return list
        },
        yamlString() {
            return stringify(this.data)
        },
        sanitizeAndFormat(input: string) {
            // Replace *italic*, **bold**, and ***italic bold*** with HTML markup
            const formattedText = input
                .replace(/\*{3}([^*]+)\*{3}/g, '<i><b>$1</b></i>')// ***italic bold***
                .replace(/\*{2}([^*]+)\*{2}/g, '<b>$1</b>') // **bold**
                .replace(/\*{1}([^*]+)\*{1}/g, '<i>$1</i>'); // *italic*

            
            return formattedText ;
        },
        nthSuffix(number: number) : string {
            switch (number) {
                case 1:
                    return '1st'
                case 2:
                    return '2nd'
                case 3:
                    return '3rd'
                default:
                    return number.toString() + 'th'
            }
        },
        fullSpellAbilityName(innate = false) : string {
            let abi;
            if (innate) abi = this.data.spellcasting.innateSpells.spellCastingAbility
            else abi = this.data.spellcasting.casterSpells.spellCastingAbilityOverride ?? this.data.spellcasting.casterSpells.spellCastingAbility

            if (abi == 'str') return "Strength"
            if (abi == 'dex') return "Dexterity"
            if (abi == 'con') return "Constitution"
            if (abi == 'wis') return "Wisdom"
            if (abi == 'int') return "Intelligence"
            if (abi == 'cha') return "Charisma"
            return "Spellcasting Ability not found."
        },
        spellDc(innate = false) : number {
            let castingData;
            if (innate) castingData = this.data.spellcasting.innateSpells
            else castingData = this.data.spellcasting.casterSpells

            if (castingData.spellDcOverride) return castingData.spellDcOverride
            else {
                if (innate && castingData.spellCastingAbility) return 8 + this.statCalc(castingData.spellCastingAbility) + this.data.core.proficiencyBonus
                // @ts-ignore
                else return 8 + this.statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility) + this.data.core.proficiencyBonus
            }
        },
        spellAttackBonus(innate = false): string {
            let castingData;
            if (innate) castingData = this.data.spellcasting.innateSpells as InnateSpells
            else castingData = this.data.spellcasting.casterSpells as CasterSpells

            let bonus = 0;
            if (castingData.spellBonusOverride || castingData.spellBonusOverride === 0) bonus = castingData.spellBonusOverride
            else {
                if (innate && castingData.spellCastingAbility) bonus = this.statCalc(castingData.spellCastingAbility) + this.data.core.proficiencyBonus
                // @ts-ignore
                else bonus = this.statCalc(castingData.spellCastingAbilityOveride ?? castingData.spellCastingAbility) + this.data.core.proficiencyBonus
            }

            if (bonus >= 0) return '+' + bonus
            return bonus.toString()
        },
        componentsString(hasColon = true) : string {
            let comp = this.data.spellcasting.innateSpells.noComponentsOfType.sort()
            let colon = hasColon ? ':' : ''
            if (comp.length == 0) return ""
            if (comp.length == 3) return ", requiring no components" + colon
            if (comp.length == 2) {
                let only = "material";
                if (!comp.includes("Verbal")) only = "verbal"
                if (!comp.includes("Somatic")) only = "somatic"

                return `, requiring only ${only} components` + colon
            }
            return `, requiring no ${comp[0].toLowerCase()} components` + colon 
        },
        displaySpeedOrSenses
    }

})
</script>

<style scoped lang="less">
.stat-block {
    width: 100%;

    background-color: var(--color-surface-1);
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
    padding: .4rem;

    font-family:  'Convergence', monospace;
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
.stat-block__language-container > span:last-of-type > span > .ending-comma,

.stat-block__cond-container > span:last-of-type > span > .ending-comma,

.stat-block__vuln-container > span:last-of-type > span > .ending-comma,
.stat-block__res-container > span:last-of-type > span > .ending-comma,
.stat-block__imm-container > span:last-of-type > span > .ending-comma,

.stat-block__senses-container > span:last-of-type > .ending-comma,
.stat-block__speed-container > span:last-of-type > .ending-comma,
.stat-block__save-container > span:last-of-type > .ending-comma {
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
</style>
