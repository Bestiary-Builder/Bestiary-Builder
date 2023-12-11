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
        <div v-if="Object.values(data.abilities.saves).some(val => val)" class="stat-block__save-container"> 
            <b> Saving Throws </b>
            <span v-if="data.abilities.saves.str"> Str {{ saveSign("str") }}{{statCalc("str")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="data.abilities.saves.dex"> Dex {{ saveSign("dex") }}{{statCalc("dex")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="data.abilities.saves.con"> Con {{ saveSign("con") }}{{statCalc("con")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="data.abilities.saves.int"> Int {{ saveSign("int") }}{{statCalc("int")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="data.abilities.saves.wis"> Wis {{ saveSign("wis") }}{{statCalc("wis")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
            <span v-if="data.abilities.saves.cha"> Cha {{ saveSign("cha") }}{{statCalc("cha")+data.core.proficiencyBonus  }}<span class="ending-comma">,</span></span>
        </div>
        <div class="stat-block__skills-container" v-if="showSkills()">
            <b> Skills </b>
            {{ skillOutput() }}
        </div>
        <div ckass="stat-block__senses-container">
            <b> Senses </b>
            <span v-if="data.core.senses.darkvision"> darkvision {{ data.core.senses.darkvision}}ft.<span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.blindsight"> blindsight {{ data.core.senses.blindsight}}ft.<span v-if="data.core.senses.isBlind"> (blind beyond this radius)</span><span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.truesight"> truesight {{ data.core.senses.truesight}}ft.<span class="ending-comma">,</span></span>
            <span v-if="data.core.senses.tremorsense"> tremorsense {{ data.core.senses.tremorsense}}ft.<span class="ending-comma">,</span></span>
            <span> passive Perception {{ ppCalc() }}</span>
        </div>
        <div>
            <b> Challenge </b> {{ data.description.cr }} (1000 xp)
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
import type { SkillsEntity, Statblock } from './types';
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
        ppCalc(): number { 
            if (this.data.core.senses.passivePerceptionOverride) return this.data.core.senses.passivePerceptionOverride
            else return 10 + this.statCalc("dex")
        },
        statSign(stat: string): string {
            if (this.statCalc(stat) >=0) {
                return "+"
            }
            return ""
        },
        saveSign(stat: string): string {
            if (this.statCalc(stat)+this.data.core.proficiencyBonus >= 0) {
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
            for (let skill in skills) {
                index++
                if (!skills[skill].isExpertise && !skills[skill].isHalfProficient && !skills[skill].isProficient && !skills[skill].override) continue

                let bonus = 0
                for (let stat in SKILLS_BY_STAT) {
                    if (SKILLS_BY_STAT[stat].includes(skills[skill].skillName.replace(" ", "").toLowerCase())) {
                        output += skills[skill].skillName.charAt(0).toUpperCase() + skills[skill].skillName.slice(1).toLowerCase()
                        if (skills[skill].override) {
                            output += ` ${skills[skill].override >= 0 ? '+' : ''}${skills[skill].override}, `
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

.stat-block__senses-container > span:last-of-type > .ending-comma,
.stat-block__speed-container > span:last-of-type > .ending-comma,
.stat-block__save-container > span:last-of-type > .ending-comma {
    display: none;
}

#bla {
    display: block;
    margin-top: 10rem;
}


</style>