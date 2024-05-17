import{M as o}from"./index-BMSQkwth.js";import{B as l}from"./Breadcrumbs-C_TjxZoK.js";import{d as c,h as d,_ as u,o as i,c as r,b as e,e as a,f as n,i as h,F as p,p as g,j as m}from"./index-BB4lYkn2.js";const y=`<!-- <img src="/logo-text.svg" width="75%" style="margin: auto">

---

**Welcome to Bestiary Builder, _the_ convenient Bestiary Creator for D&D 5e, designed for incredible integration with [Avrae](https://avrae.io/) and convenience of use!** -->

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
5. (optional) Import your bestiary into [Avrae](https://avrae.io/) by typing \`!bestiary import url\` into Discord

## Acknowledgements

Sincere thanks go out to the developers of [Avrae](https://avrae.io/), specifically zhudotexe and Croebh. Their code to parse attacks from CritterDB has been modified and used within Bestiary Builder. Without their work, parsing attacks would not have been possible!

Front page image from the Monster Manual, illustrated by Raymond Swanland.
## Feedback and issues

You can leave feedback and issues by joining our [Discord Server](https://discord.gg/a6bwXCSymN) or by creating an issue on [Github](https://github.com/Bestiary-Builder/Bestiary-Builder/issues)

## Developers

<div style="display: grid; gap: 2rem; grid-template-columns: 1fr 1fr; margin-top: 1rem; width: 90%; margin: auto; ">
    <div>
        <img src="/VeryGreatFrog.png" alt="VeryGreatFrog" style="width: 25vw;  aspect-ratio: 1; margin: auto;"/>
        <div style="text-align: center">VeryGreatFrog</div>
    </div>
    <div>
        <img src="/Stevnbak.png" alt="Stevnbak" style="width: 25vw; aspect-ratio: 1; margin: auto;">
        <div style="text-align: center">Stevnbak</div>
    </div>
</div>
`,v=o({html:!0,linkify:!0,typographer:!0}),b=c({data(){return{content:v.render(y),stats:null}},components:{Breadcrumbs:l},async beforeMount(){await fetch("/api/stats").then(d).then(t=>{t.success?this.stats=t.data:(console.error("Failed to retrieve global stats."),this.stats=null)})}}),w="/mmcover.jpg",s=t=>(g("data-v-4fb0dae2"),t=t(),m(),t),f={class:"article-header"},_={class:"header-content"},B=s(()=>e("h1",{class:"header-title"},"Bestiary Builder",-1)),k={class:"call-to-action"},C={class:"left"},S=s(()=>e("ul",{class:"right"},[e("li",null,[a("Welcome to Bestiary Builder, "),e("i",null,"the"),a(" convenient Bestiary Creator for "),e("span",{style:{display:"inline-block"}},[e("b",null,"D&D 5e"),a(",")]),a(" designed for incredible integration with "),e("b",null,[e("a",{href:"https://avrae.io/"}," Avrae")]),a(" and convenience of use!")])],-1)),A=s(()=>e("img",{src:w,alt:"",class:"header-image"},null,-1)),F={class:"content markdown less-wide"},D=["innerHTML"];function M(t,x,V,I,j,z){return i(),r(p,null,[e("div",f,[e("div",_,[B,e("div",k,[e("ul",C,[e("li",null,[a(" Join our "),e("b",null,n(t.stats?.users),1),a(" users! ")]),e("li",null,[a(" Flip through our "),e("b",null,n(t.stats?.bestiaries),1),a(" bestiaries! ")]),e("li",null,[a(" Frighten your players with our "),e("b",null,n(t.stats?.creatures),1),a(" creatures! ")])]),S])]),A]),e("div",F,[t.content?(i(),r("div",{key:0,innerHTML:t.content},null,8,D)):h("",!0)])],64)}const $=u(b,[["render",M],["__scopeId","data-v-4fb0dae2"]]);export{$ as default};
