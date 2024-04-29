import type { Defenses, FeatureEntity, Saves } from "../../../shared"
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

export function expectedCRMultiplier(cr: number = 0, defenses: Defenses): number {
    let multiplier = 1

    if (defenses.immunities.length > 0){
        if (cr >= 0 && cr <= 4){
            multiplier = 2
        } else if (cr <= 10){
            multiplier = 2
        } else if (cr <= 16){
            multiplier = 1.5
        } else {
            multiplier = 1.25
        }
    } else if (defenses.resistances.length > 0){
        if (cr >=0 && cr <=4){
            multiplier = 2
        } else if (cr <= 10){
            multiplier = 1.5
        } else if (cr <= 16){
            multiplier = 1.25
        }
    }

    return multiplier
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