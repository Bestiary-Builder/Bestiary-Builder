<img src="/logo-text.svg" width="75%" style="margin: auto">

---

**Welcome to Bestiary Builder, _the_ convenient Bestiary Creator for D&D 5e, designed for incredible integration with [Avrae](https://avrae.io/) and convenience of use!**

<div style="margin: auto; display: flex; justify-content: center; gap: 2rem;">
    <a href="https://www.patreon.com/join/BestiaryBuilder" target="_blank" class="patreon">
    <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512"><path fill="white" d="M489.7 153.8c-.1-65.4-51-119-110.7-138.3C304.8-8.5 207-5 136.1 28.4C50.3 68.9 23.3 157.7 22.3 246.2C21.5 319 28.7 510.6 136.9 512c80.3 1 92.3-102.5 129.5-152.3c26.4-35.5 60.5-45.5 102.4-55.9c72-17.8 121.1-74.7 121-150z"/></svg>
    <span> Become a patreon </span>
    </a>
    <a href="https://discord.gg/a6bwXCSymN" class="patreon discord" target="_blank">
<svg xmlns="http://www.w3.org/2000/svg" height="16" width="20" viewBox="0 0 640 512"><path fill="white" d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z"/></svg>
    <span> Join our discord </span>
    </a>
</div>

## Getting started

By creating an account with us, you agree to our [Terms and Conditions](/terms-and-conditions) and [Privacy Policy](/privacy-policy).

1. Create an account by [logging](/user) in with your Discord Account
2. Create a new [Bestiary](/my-bestiaries), give it a name and optionally a description
3. Create your first creature and save its statblock
4. (optional) Publish your bestiary by changing its status to public
5. (optional) Import your bestiary into [Avrae](https://avrae.io/) by typing `!bestiary import url` into Discord

## Importing a Bestiary from CritterDB

It is possible to import a bestiary from [CritterDB](https://critterdb.com):

1. Create a new [Bestiary](/my-bestiaries), give it a name and optionally a description
2. Press the Import button to open the import dialog
3. Enter the link to the CritterDB bestiary into the text box and press Import
4. It will start importing creatures from CritterDB into your new bestiary
5. (optional) Publish your bestiary by changing its status to public
6. (optional) Import your bestiary into [Avrae](https://avrae.io/) by typing `!bestiary import <url>` into Discord

### Caveats

1. CritterDB stores immunities/resistances/vulnerabilities in a weird manner. It may fail to import these correctly
2. Since CritterDB does not have fields for bonus actions, mythic actions, lair actions, and regional effects, they will be imported as the action type you set on CritterDB
3. It will generate automation for attacks that did not already have automation set through the <code>\<avrae hidden\></code> tag. However, this automation might be incomplete for more complicated attacks, such as attacks that apply an effect on hit

## Importing a creature from 5e.tools

It is possible to import a single creature from [5etools](https://5e.tools), to make it easier to create your own:

1. Navigate to the 5etools page for that creature and shift-click the export button (arrow pointing upright) above the name.
2. Press Copy Code to copy the JSON to your clipboard
3. Create a creature and open the Statblock Editor
4. Press Import at the bottom of the Editor and paste the JSON into the 5e.tools input field, then
5. Press Import again and save your changes

### Caveats

1. It cannot import lair actions and regional effects, as those are not in the JSON data
2. It will attempt to generate automation for attacks, but the generated automation might be incomplete or not there in the case of save based attacks
3. **It is against our [Content Policy](/content-policy) to publish official non-free D&D content. So if you want to publish your bestiary with the imported creature, make sure you modify it to create your own creature out of it!**

## Copying within Bestiary Builder

It is possible to copy creatures or bestiaries from within Bestiary Builder by exporting and importing them as JSON

### Exporting

Press the Export button at the top right of the page. You can choose to copy it to your clipboard or export as a file if it is a bestiary

### Importing a creature

1. Create a creature and open the Statblock Editor.
2. Press Import at the bottom of the Editor and paste the copied JSOn into the Bestiary Builder input field
3. Press Import Again and save your changes

### Importing a Bestiary

1. Create a new [Bestiary](/my-bestiaries) (or edit an existing one)
2. Press the Import button and paste the copied JSON into the Bestiary Builder input field
3. Press Import again. It will start importing the creatures, which might take a while for larger bestiaries.

## Acknowledgements

Sincere thanks go out to the developers of [Avrae](https://avrae.io/), specifically zhudotexe and Croebh. Their code to parse attacks from CritterDB has been modified and used within Bestiary Builder. Without their work, parsing attacks would not have been possible!

## Feedback and issues

You can leave feedback and issues by joining our [Disord Server](https://discord.gg/a6bwXCSymN) or by creating an issue on [Github](https://github.com/Bestiary-Builder/Bestiary-Builder/issues)

## Developers

<div style="display: grid; gap: 6rem; grid-template-columns: 1fr 1fr; margin-top: 1rem; width: 50%; margin: auto; ">
<div>

![VeryGreatFrog](/VeryGreatFrog.png)

### VeryGreatFrog

</div>
<div>

![Stevnbak](/Stevnbak.png)

### Stevnbak

</div>
</div>
