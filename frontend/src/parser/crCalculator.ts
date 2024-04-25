import type { FeatureEntity, Saves } from "../../../shared"
import { parseDescIntoAutomation } from "./utils"

export function scrapeFeatures(features: FeatureEntity[] = []): number[]{
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

        if (bonus && !isNaN(bonus)){
            bonuses.push(bonus)
        }

        if (damage && !isNaN(damage)){
            damages.push(damage)
        }

        if (dc && !isNaN(dc)){
            saveDC.push(dc)
        }
    }

    const averageAttackBonus = averageValue(bonuses)
    const averageDPR = averageValue(bonuses)
    const averageDC = averageValue(saveDC)

    return [averageAttackBonus, averageDPR, averageDC]
}

export function countProficientSaves(saves: Saves): number {
    let totalCount = 0

    for (const [key, save] of Object.entries(saves)){
        if (save.isProficient) totalCount ++
    }

    return totalCount
}

export function averageValue(values: number[] = []): number{
    return Math.round(values
        .filter(value => !isNaN(value))
        .reduce((runningTotal, currentValue) => runningTotal + currentValue,0) / values.filter(value => !isNaN(value)).length)
}

function findAttackBonus(obj: any): number | undefined{
    if (typeof obj === "object" && obj !== null){
        if ('attackBonus' in obj){
            return parseInt(obj.attackBonus)
        } else {
            for (const key in obj){
                const result = findAttackBonus(obj[key])
                if (result !== undefined){
                    return result
                }
            }
        }  
    } else return undefined
}

function findAttackDamage(obj: any): number | undefined{
    if (typeof obj === 'object' && obj !== null){
        if ('damage' in obj){
            return averageDamage(obj.damage)
        } else {
            for (const key in obj){
                const result = findAttackDamage(obj[key])
                if (result !== undefined){
                    return result
                }
            }
        }
    } else return undefined
}

function findDC(obj: any): any{
    if (typeof obj === 'object' && obj !== null){
        if ('dc' in obj){
            return obj.dc
        } else {
            for (const key in obj){
                const result = findDC(obj[key])
                if (result !== undefined){
                    return result
                }
            }
        }
    } return undefined
}

function averageDamage(damageString: string): number{
    const dmgString = damageString.replace(/\s*\[.*?\]\s*/g, '')
    const [roll, mod] = dmgString.includes("+")  ? dmgString.split("+") : [dmgString,0]
    const [numDie, dieSize] = roll.split("d").map(Number)
    const averageRoll = (dieSize+1)/2
    const averageDmg = (averageRoll * numDie) + (mod ? Number(mod) : 0)
    return Math.floor(averageDmg)
}