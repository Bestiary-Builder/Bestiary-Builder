<template>
<div class="stat-block">
    <div class="stat-block__row"> 
        <h1 class="stat-block__name-container"> {{ data.description.name }}</h1>
        <span class="stat-block__core"> {{ data.core.size }} {{ data.core.race }}{{ data.description.alignment ? ',' : '' }} {{ data.description.alignment }}</span>
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
            <span> {{ data.core.speed.walk }} ft.<span class="ending-comma">,</span></span>
            <span v-if="data.core.speed.fly">
                fly {{ data.core.speed.fly }} ft.<span v-if="data.core.speed.isHover"> (hover)</span><span class="ending-comma">,</span>
            </span>
            <span v-if="data.core.speed.swim">
                swim {{ data.core.speed.swim }} ft.<span class="ending-comma">,</span>
            </span>
            <span v-if="data.core.speed.burrow">
                burrow {{ data.core.speed.burrow }} ft.<span class="ending-comma">,</span>
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
        <div class="stat-block__vuln-container" v-if="data.defenses.vulnerabilities.length > 0">
            <b> Vulnerabilities </b>
            <span v-for="vuln in alphaSort(data.defenses.vulnerabilities)">
                <span>{{vuln.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__res-container" v-if="data.defenses.resistances.length > 0">
            <b> Resistances </b>
            <span v-for="res in alphaSort(data.defenses.resistances)">
                <span>{{res.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__imm-container" v-if="data.defenses.immunities.length > 0">
            <b> Immunities </b>
            <span v-for="imm in alphaSort(data.defenses.immunities)">
                <span>{{imm.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div class="stat-block__imm-container" v-if="data.defenses.conditionImmunities.length > 0">
            <b> Condition Immunities </b>
            <span v-for="con in alphaSort(data.defenses.conditionImmunities)">
                <span>{{con.toLowerCase()}}<span class="ending-comma">, </span> </span>
            </span>
        </div>
        <div ckass="stat-block__senses-container">
            <b> Senses </b>
            <span v-if="data.core.senses.darkvision"> darkvision {{ data.core.senses.darkvision}}ft.<span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.blindsight"> blindsight {{ data.core.senses.blindsight}}ft.<span v-if="data.core.senses.isBlind"> (blind beyond this radius)</span><span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.truesight"> truesight {{ data.core.senses.truesight}}ft.<span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.tremorsense"> tremorsense {{ data.core.senses.tremorsense}}ft.<span class="ending-comma">,</span></span>
            <span> passive Perception {{ ppCalc() }}</span>
        </div>
        <div class="stat-block__language-container"> 
            <b> Languages </b>
            <span v-if="data.core.languages.length == 0 && !data.core.senses.telepathy"> — </span>
            <span v-else v-for="lang in langSort(data.core.languages)">
                <span> {{ lang }}<span class="ending-comma">,</span></span>
            </span>
            <span v-if="data.core.senses.telepathy"> telepathy {{ data.core.senses.telepathy}}ft.</span>

        </div>
        <div>
            <b> Challenge </b> {{ data.description.cr }} (1000 xp)
        </div>
    </div>
    <div class="stat-block__row" v-if="showFeatures()">
        <div class="feature-container"  v-if="data.features.features.length > 0">
            <p v-for="feature in data.features.features">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup> </b>
                <span class="feature-container__desc">  {{ feature.description }} </span>
            </p>
        </div>


        <div class="feature-container" v-if="data.features.actions.length > 0">
            <h3 class="feature-container__title"> Actions </h3>
                <p v-for="feature in data.features.actions">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.bonus.length > 0">
            <h3 class="feature-container__title"> Bonus Actions </h3>
                <p v-for="feature in data.features.bonus">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.reaction.length > 0">
            <h3 class="feature-container__title"> Reactions </h3>
                <p v-for="feature in data.features.reaction">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.legendary.length > 0">
            <h3 class="feature-container__title"> Legendary Actions </h3>
                <p v-for="feature in data.features.legendary">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.lair.length > 0">
            <h3 class="feature-container__title"> Lair Actions </h3>
                <p v-for="feature in data.features.lair">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>

        <div class="feature-container" v-if="data.features.regional.length > 0">
            <h3 class="feature-container__title"> Regional Effects </h3>
                <p v-for="feature in data.features.regional">
                <b> <i>{{ feature.name }}</i><sup class="feature-container__automation-icon" v-if="feature.automation" v-tooltip="'Has Automation'">†</sup></b>
                <span class="feature-container__desc"> {{ feature.description }} </span>
            </p>
        </div>
    </div>
</div>
<div id="bla"> 
    <highlightjs language='yaml' :code="yamlString()" />
</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SaveEntity, SkillsEntity, Statblock } from './types'
import { stringify } from 'yaml'


export default defineComponent({
    props: ["data"],
    data() {
        return {
            
        }
    },
    methods: {
        hpCalc(): number {
            return Math.floor(this.data.defenses.hp.numOfHitDie * ( (this.data.defenses.hp.sizeOfHitDie + 1)/2 + this.statCalc("con")))
        },
        statCalc(stat: string) : number {
            return Math.floor(this.data.abilities.stats[stat]/2)-5
        },
        ppCalc(): number { 
            if (this.data.core.senses.passivePerceptionOverride) return this.data.core.senses.passivePerceptionOverride
            else { 
                let skills = this.data.abilities.skills
                if (skills) {
                    for (let skill in skills) {
                        if (skills[skill].skillName == "Perception") {
                            if (skills[skill].override) return 10 + skills[skill].override
                            if (skills[skill].isHalfProficient) return 10 + this.statCalc("wis") + Math.floor(this.data.core.proficiencyBonus/2)
                            if (skills[skill].isProficient) return 10 + this.statCalc("wis") + this.data.core.proficiencyBonus
                            if (skills[skill].isExpertise) return 10 + this.statCalc("wis") + this.data.core.proficiencyBonus*2
                            break;
                        }
                    }
                } 
            }
            return 10 + this.statCalc("wis")
        },
        statSign(stat: string): string {
            if (this.statCalc(stat) >=0) {
                return "+"
            }
            return ""
        },
        saveSign(stat: string): string {
            if (this.statCalc(stat)+this.data.core.proficiencyBonus >= 0 || this.data.abilities.saves[stat].override >= 0) {
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
            let output = ""
            let index = 0;

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

            for (let skill in skills) {
                index++
                if (!skills[skill].isExpertise && !skills[skill].isHalfProficient && !skills[skill].isProficient && !skills[skill].override) continue

                let bonus = 0
                for (let stat in SKILLS_BY_STAT) {
                    if (SKILLS_BY_STAT[stat].includes(skills[skill].skillName.replace(" ", "").toLowerCase())) {
                        output += skills[skill].skillName
                        if (skills[skill].override && skills[skill].override !== null) {
                            let over = skills[skill].override
                            output += ` ${over ?? 0 >= 0 ? '+' : ''}${over}${index == skills.length ? '' : ','} `
                        } else {
                            bonus = this.statCalc(stat)
                            if (skills[skill].isHalfProficient) {
                                bonus += Math.floor(this.data.core.proficiencyBonus/2)
                            } else if (skills[skill].isProficient) {
                                bonus += this.data.core.proficiencyBonus
                            } else if (skills[skill].isExpertise) {
                                bonus += this.data.core.proficiencyBonus*2
                            }
                            output += ` ${bonus >= 0 ? '+' : ''}${bonus}${index == skills.length ? '' : ','} `
                        }
                        break;
                    } else continue;
                    
                }

            }
            return output
        },
        showSkills() : boolean {
            for (let skill in this.data.abilities.skills) {
                let sk = this.data.abilities.skills[skill]
                if (sk.isProficient || sk.isHalfProficient || sk.isExpertise || sk.override) return true
            }
            return false
        },
        showFeatures() : boolean {
            for (let f in this.data.features) {
                if (this.data.features[f].length > 0) return true
            }
            return false
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
        }
    }

})
</script>

<style scoped lang="less">
#bla {
    margin-top: 20rem;
}
.stat-block {
    width: 100%;
    height: 30rem;
    margin: .1rem
}

.stat-block__row {
    display: block;
    width: 100%;
    border-bottom: 2px solid orangered;
    margin-left: .3rem;
    margin-bottom: .6rem;
    margin-top: .6rem;
}

.stat-block__name-container {
    color: orangered;
    font-family: 'Times New Roman', Times, serif;
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
        border-bottom: 1px solid orangered
    }

    :has(.feature__automation-icon)&__desc {
        margin-left: .2rem;
    }
}

.feature-container:has(sup)  .feature-container__desc {
    margin-left: .2rem;
}
</style>