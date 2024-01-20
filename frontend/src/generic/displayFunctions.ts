// Simple global functions used in several places in the UI

import type { SenseEntity, SpeedEntity } from "./types"

export function displayCR(cr: number) : string {
    if (cr == 0.125) return "1/8"
    if (cr == 0.25) return "1/4"
    if (cr == 0.5) return "1/2"
    return cr.toString()
}

export function displaySpeedOrSenses(data: SenseEntity[] | SpeedEntity[], hasEndingComma = false) : string {
    let output = ""
    let filteredLength = data.filter(item => item.name !== 'New speed' && item.name !== 'New sense').length
    for (let [index, item] of data.entries()) {
        if (item.name === "New speed" || item.name === "New sense") continue;
        if (item.name != "Walk") output += item.name.toLowerCase() + " "
        output += item.value
        if (item.unit != "none") output += item.unit + "."
        if (item.comment) output += ` (${item.comment})`
        if (hasEndingComma || ( filteredLength != 1 && index != filteredLength-1)) output += ", "
    }
    return output
}