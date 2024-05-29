/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// This scripts extract features (i.e. -> no automation) from the 5e.tools bestiary page. Requires some manual cleanup.
const els = document.querySelectorAll(".lst__row-inner")
let output = {}
async function sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
}

for (el of els) {
    el.click()
    await sleep(100)
    let features = document.querySelector("tr.relative ~ tr td.mon__sect-row-inner")
    for (feat of features.querySelectorAll('.rd__b')) {
        let text = feat.textContent
        let title = text.split('.')[0].trim()
        if (title.toLowerCase().includes("multiattack")) continue
        if (title.toLowerCase().includes("spellcasting")) continue
        if (text.toLowerCase().includes("melee weapon attack:")) continue
        if (text.toLowerCase().includes("ranged weapon attack:")) continue
        if (title.toLowerCase().includes("(recharge")) continue

        let name = (feat.textContent).match(/^.+?(?:the|a) (?!start of each of (?:its|the) |start of (?:its|the) |first round|ground in|\d|bonus|target|creature|DC |curse|remove|poisoned|same du|failed|short |combat|web,)(?<name>.+?)(?: |,|'s |\.)(?:is|learns|or|greatest|makes|has|casts|sheds|wields|turns|dies|can|eyes|until|remains|deals|or |darkvision|exhales|hits|surprises|long jump|senses|starts|innate|weapon|The |knows|sleeps|moves|takes|does|must|and |reduces|babbles|corrodes|returns|sings|ignores|magically|that|adhere|targ|carries|to |regain|who |touches|attaches|trans|fails|spits |uses).+?/i)[1].replace(",", "").trim()
        output[title] = text.slice(1).replace(title + ".", "").trim().replaceAll(name, "$NAME$")
    }
} 
console.log(output)
