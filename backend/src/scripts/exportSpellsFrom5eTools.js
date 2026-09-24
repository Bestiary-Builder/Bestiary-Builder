/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// This script extracts 5e.tools spells data from the spells page. Should not require manual cleanup.
const els = document.querySelectorAll(".ve-lst__row a")
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let output = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []}

for (el of els) {
    const spell = el.querySelector("span:first-of-type").innerText
    const levelText = el.querySelector("span:nth-of-type(2)").innerText.replace(" (rit.)", "")
    let level = -1;
    switch (levelText) {
        case "Cantrip":
            level = 0
            break
        case "1st":
            level = 1
            break
        case "2nd":
            level =2
            break
        case "3rd":
            level = 3
            break
        case "4th":
            level = 4
            break
        case "5th":
            level = 5
            break
        case "6th":
            level = 6
            break
        case "7th":
            level = 7
            break
        case "8th":
            level = 8
            break
        case "9th":
            level = 9
            break
    }
    output[level].push(spell)
}

console.log(output)