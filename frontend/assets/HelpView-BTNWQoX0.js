import{M as a}from"./index-BMSQkwth.js";import{B as n}from"./Breadcrumbs-Cgz29xMC.js";import{d as i,_ as s,r as p,o as e,c as o,a as c,b as h,i as d,F as l}from"./index-CCTs9utp.js";const m=`## Importing a Bestiary from CritterDB

It is possible to import a bestiary from [CritterDB](https://critterdb.com):

1. Create a new [Bestiary](/my-bestiaries), give it a name and optionally a description
2. Press the Import button at the top-right to open the import dialog
3. Enter the link to the CritterDB bestiary into the text box and press Import
4. It will start importing creatures from CritterDB into your new bestiary
5. (optional) Publish your bestiary by changing its status to public
6. (optional) Import your bestiary into [Avrae](https://avrae.io/) by typing \`!bestiary import <url>\` into Discord

### Caveats

1. CritterDB stores damage resistances in a weird manner. It may fail to import these correctly
2. Since CritterDB does not have fields for bonus actions, mythic actions, lair actions, and regional effects, they will be imported as the action type you set on CritterDB
3. It will generate automation for attacks that did not already have automation set through the <code>\\<avrae hidden\\></code> tag. However, this automation might be incomplete for more complicated attacks, such as attacks that apply an effect on hit

## Importing a Creature from 5e.tools

It is possible to import a single creature from [5etools](https://5e.tools), to make it easier to create your own:

1. Navigate to the 5etools page for that creature and shift-click the export button (arrow pointing upright) above the name.
2. Press Copy Code to copy the JSON to your clipboard
3. Create a creature and open the Statblock Editor
4. Press Import at the top-right of the Editor and paste the JSON into the 5e.tools input field, then
5. Press Import again and save your changes

### Caveats

1. It cannot import lair actions and regional effects, as those are not in the JSON data
2. It will attempt to generate automation for attacks, but the generated automation might be incomplete or not there in the case of save based attacks
3. **It is against our [Content Policy](/content-policy) to publish official non-free D&D content. So if you want to publish your bestiary with the imported creature, make sure you modify it to create your own creature out of it!**

## Copying within Bestiary Builder

It is possible to copy creatures or bestiaries from within Bestiary Builder by exporting and importing them as JSON

### Exporting

Press the Export button at the top right of the page. You can choose to copy it to your clipboard or export as a file if it is a bestiary

### Importing a Creature

1. Create a creature and open the Statblock Editor.
2. Press Import at the top-right of the Editor and paste the copied JSON into the Bestiary Builder input field
3. Press Import Again and save your changes

### Importing a Bestiary

1. Create a new [Bestiary](/my-bestiaries) (or edit an existing one)
2. Press the Import button and paste the copied JSON into the Bestiary Builder input field
3. Press Import again. It will start importing the creatures, which might take a while for larger bestiaries.

## Markdown Support
Bestiary, Creature, and Feature descriptions support [Markdown Syntax](https://www.markdownguide.org/basic-syntax/), which will also import into Avrae that way usually. 
A special case is made for Bestiary descriptions, where the first image will be displayed on the card in the Public, Personal, and Bookmarked bestiary list.`,u=a({html:!0,linkify:!0,typographer:!0}),y=i({data(){return{content:u.render(m)}},components:{Breadcrumbs:n}}),g={class:"content markdown less-wide"},f=["innerHTML"];function b(t,w,B,C,I,k){const r=p("Breadcrumbs");return e(),o(l,null,[c(r,{routes:[{path:"",text:"Help",isCurrent:!0}],isLessWide:!0}),h("div",g,[t.content?(e(),o("div",{key:0,innerHTML:t.content},null,8,f)):d("",!0)])],64)}const x=s(y,[["render",b]]);export{x as default};