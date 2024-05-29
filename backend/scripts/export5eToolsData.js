/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// This script extracts 5e.tools creature data from the bestiary page. Should not require manual cleanup.
const els = document.querySelectorAll(".lst__row-inner")
async function sleep(ms) { 
    return new Promise(resolve => setTimeout(resolve, ms));
}

let output = []

for (el of els) {
    el.click()
    await sleep(100)
    const codeButton = document.querySelector('[title="Popout Window (SHIFT for Source Data; CTRL for Markdown Render)"]')

    const shiftClick = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        shiftKey: true 
    })
    codeButton.dispatchEvent(shiftClick)
    await sleep(100)

    const dataElement = document.querySelector("div.hwin__wrp-table > div > pre")
    output.push(JSON.parse(dataElement.innerText))
    const closeButton = document.querySelector('[title="Close (CTRL to Close All)"]')
    closeButton.click()                                               
} 
console.log(output)

