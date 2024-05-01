import { BPS, type Defenses, type FeatureEntity, type Saves } from "../../../shared"
import { parseDescIntoAutomation } from "./utils"

export function scrapeFeatures(features: FeatureEntity[] = []): number[]{
    if (features.length == 0) return [NaN,NaN,NaN]
    let bonuses: number[] = []
    let damages: number[] = []
    let saveDC: number[] = []

    for (const feature of features){
        let automation: object | null

        if (feature.automation){
            automation = feature.automation
        } else {
            automation = parseDescIntoAutomation(feature.description, feature.name ,1)[0]
        }

        const bonus = automation ?  findAttackBonus(automation) : undefined
        const damage = automation ? findAttackDamage(automation) : undefined
        const dc = automation ? findDC(automation): undefined

        if (bonus){
            bonuses.push(bonus)
        }

        if (damage && !isNaN(damage)){
            damages.push(damage)
        }

        if (dc && !isNaN(dc)){
            saveDC.push(dc)
        }
    }

    const averageAttackBonus = bonuses.length == 0 ? NaN :  averageValue(bonuses)
    const averageDPR = damages.length == 0 ? NaN :  averageValue(damages) 
    const averageDC = saveDC.length == 0 ? NaN : averageValue(saveDC)
    return [averageAttackBonus, averageDPR, averageDC]
}

export function resistImmuneModifier(cr: number = 0, defenses: Defenses): number {
    let allResistances: string[] = [...defenses.immunities, ...defenses.resistances].map(value => value.toLowerCase())
    if (cr >= 10) allResistances = stripBPS(allResistances)
    let multiplier = 1

    let adjustor = 0

    if (allResistances.length > 0){
        if (cr >= 0 && cr <= 4){
            adjustor = .2
        } else if (cr <= 10){
            adjustor = .15
        } else if (cr <= 16 ){
            adjustor = .1
        }
    }

    multiplier = parseFloat((1+(allResistances.length * adjustor)).toFixed(1))

    return multiplier
}

function stripBPS(resistanceArray: string[] = []): string[]{
    for (const type of BPS){
        const index = resistanceArray.indexOf(type)
        if ( index >= 0) resistanceArray.splice(index, 1)
    }

    return resistanceArray
}

export function countProficientSaves(saves: Saves): number {
    let totalCount = 0

    for (const save of Object.values(saves)){
        if (save.isProficient) totalCount ++
    }

    return totalCount
}

export function averageValue(values: number[] = []): number{
    const filteredValues: number[] = values.filter(value => !isNaN(value))
    return Math.round(filteredValues
        .reduce((runningTotal, currentValue) => runningTotal + currentValue,0) / filteredValues.length) | 0
}

function findAttackBonus(obj: any): number | undefined{
    if (typeof obj !== "object" || obj == null) return undefined

    if ('attackBonus' in obj) return parseInt(obj.attackBonus)

    for (const key in obj){
        const result = findAttackBonus(obj[key])
        if (result !== undefined){
            return result
        }
    }
}

function findAttackDamage(obj: any): number | undefined{
    if (typeof obj !== "object" || obj == null) return undefined

    if ('damage' in obj) return averageDamage(obj.damage)

    for (const key in obj){
        const result = findAttackDamage(obj[key])
        if (result !== undefined){
            return result
        }
    }
}

function findDC(obj: any): any{
    if (typeof obj !== "object" || obj == null) return undefined

    if ('dc' in obj) return obj.dc

    for (const key in obj){
        const result = findDC(obj[key])
        if (result !== undefined){
            return result
        }
    }
}

function averageDamage(damageString: string): number{
    const dmgString = damageString.replace(/\s*\[.*?\]\s*/g, '')
    const [roll, mod] = dmgString.includes("+")  ? dmgString.split("+") : [dmgString,0]
    const [numDie, dieSize] = roll.split("d").map(Number)
    const averageRoll = (dieSize+1)/2
    const averageDmg = (averageRoll * numDie) + (mod ? Number(mod) : 0)
    return Math.floor(averageDmg)
}