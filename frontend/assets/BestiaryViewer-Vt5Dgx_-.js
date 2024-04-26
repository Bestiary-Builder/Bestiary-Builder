import{t as f,d as ce,A as ue,U as pe,M as he,R as fe,u as me,x as te,V as se,h as E,_ as be,r as D,B as re,o as l,c as h,G as F,C as m,D as b,a as u,i as k,b as i,Q as ye,E as I,e as T,f as _,O as ae,w as N,F as oe,H as ne,T as ge,W as ve,p as Ce,j as we}from"./index-5v66Jwhn.js";import{B as ke}from"./Breadcrumbs-j9HdtXij.js";import{S as Be}from"./StatusIcon-VKX65apg.js";import{c as le,d as R,a as K,s as de,h as Le,S as Oe,L as Se,b as $e}from"./LabelledNumberInput-eqlFMsSk.js";import{M as Me}from"./Modal-M6OEg8Cc.js";import{M as Ae}from"./index-5Jdbla-E.js";let Ee=[{}];function Te(e=Ee[0]){let t={};if(!e.flavor||!e.stats)return f.error("This creature is missing key elements of its statblock. Failed to import."),[t,null];t.description={name:e.name,description:e.flavor.description.replaceAll("<i>","*").replaceAll("</i>","*").replaceAll("<b>","**").replaceAll("</b>","**"),isProperNoun:e.flavor.nameIsProper,faction:e.flavor.faction,environment:e.flavor.environment,image:e.flavor.imageUrl,alignment:e.stats.alignment,cr:e.stats.challengeRating??0,xp:e.stats.experiencePoints??0},t.core={proficiencyBonus:e.stats.proficiencyBonus||Math.max(2,Math.min(9,Math.floor((t.description.cr+3)/4))+1),race:e.stats.race,size:e.stats.size,languages:e.stats.languages,senses:(()=>{let o=[];for(let d of e.stats.senses??[]){let c=parseInt(d.replace(/[a-zA-Z]/g,"")),y="",S=!1;d.toLowerCase().includes("dark")?y="Darkvision":d.toLowerCase().includes("blind")?(y="Blindsight",S=!!(e.stats.senses??[]).find(w=>w.includes("blind beyond this radius"))):d.toLowerCase().includes("true")?y="Truesight":d.toLowerCase().includes("tremor")&&(y="Tremorsense"),y&&o.push({name:y,value:c,unit:"ft",comment:S?"blind beyond this radius":""})}return o})(),speed:(()=>{let o=[],d=parseInt((e?.stats.speed.match(/fly\s*(\d+)\s*ft\.?/)||[])[1])||0,c=e?.stats?.speed.toLowerCase().includes("hover"),y=parseInt((e?.stats.speed.match(/swim\s*(\d+)\s*ft\.?/)||[])[1])||0,S=parseInt((e?.stats.speed.match(/burrow\s*(\d+)\s*ft\.?/)||[])[1])||0,w=parseInt((e?.stats.speed.match(/climb\s*(\d+)\s*ft\.?/)||[])[1])||0,M=parseInt((e?.stats.speed.match(/^(\d+)\s*ft\.?/)||[])[1])||0;return M&&o.push({name:"Walk",value:M,comment:"",unit:"ft"}),d&&o.push({name:"Fly",value:d,comment:c?"hover":"",unit:"ft"}),w&&o.push({name:"Climb",value:w,comment:"",unit:"ft"}),y&&o.push({name:"Swim",value:y,comment:"",unit:"ft"}),S&&o.push({name:"Burrow",value:S,comment:"",unit:"ft"}),o})()},t.abilities={stats:{},saves:{},skills:[]},t.abilities.stats={str:e.stats.abilityScores.strength||10,dex:e.stats.abilityScores.dexterity||10,con:e.stats.abilityScores.constitution||10,int:e.stats.abilityScores.intelligence||10,wis:e.stats.abilityScores.wisdom||10,cha:e.stats.abilityScores.charisma||10},t.abilities.saves={str:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="strength")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})(),dex:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="dexterity")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})(),con:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="constitution")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})(),int:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="intelligence")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})(),wis:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="wisdom")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})(),cha:(()=>{for(let o of e.stats.savingThrows)if(o.ability=="charisma")return{isProficient:o.proficient,override:o?.value||null};return{isProficient:!1,override:null}})()},t.abilities.skills=(()=>{let o=[];const d={str:["athletics"],dex:["acrobatics","sleightofhand","stealth"],con:[],int:["arcana","history","investigation","nature","religion"],wis:["animalhandling","insight","medicine","perception","survival"],cha:["deception","intimidation","performance","persuasion"]};for(let c of e.stats.skills){let y=le(c.name),S=y.replace(" ","").toLowerCase(),w;for(let V in d)if(d[V].includes(S)){w=V;break}if(!w)continue;let M=c.proficient,v=c.value||NaN,A=v==Math.floor(t.core.proficiencyBonus*2)+(Math.floor(t.abilities.stats[w]/2)-5),P=v==Math.floor(t.core.proficiencyBonus/2)+(Math.floor(t.abilities.stats[w]/2)-5);o.push({skillName:y,isProficient:M,isExpertise:A,isHalfProficient:P,override:!M&&!A&&!P&&c.value||null})}return o})(),t.defenses={hp:{numOfHitDie:e.stats.numHitDie||1,sizeOfHitDie:e.stats.hitDieSize||6,override:null},ac:{ac:e.stats.armorClass,acSource:e.stats.armorType??""},conditionImmunities:e.stats.conditionImmunities||[],immunities:ie(e.stats.damageImmunities),resistances:ie(e.stats.damageResistances),vulnerabilities:ie(e.stats.damageVulnerabilities)},t.misc={legActionsPerRound:e.stats.legendaryActionsPerRound||3,telepathy:(()=>{if(!e.stats.languages)return 0;for(let o of e.stats.languages??[])if(o.toLowerCase().includes("telepathy"))return parseInt(o.replace(/[a-zA-Z]/g,""));return 0})(),passivePerceptionOverride:null,featureHeaderTexts:{features:"",actions:"",bonus:"",reactions:"",legendary:e.stats.legendaryActionsDescription.replace("3","$NUM$").replace("2","$NUM$").replace("1","$NUM$")??R.misc.featureHeaderTexts.legendary,lair:R.misc.featureHeaderTexts.lair,mythic:R.misc.featureHeaderTexts.mythic,regional:R.misc.featureHeaderTexts.regional}},t.spellcasting={},t.spellcasting.casterSpells=(()=>{let o=!1,d=null;for(let L of e.stats.actions)L.name.toLowerCase().includes("spellcasting")&&!L.name.toLowerCase().includes("innate")&&(d=L.description,o=!1);if(!d)for(let L of e.stats.additionalAbilities)L.name.toLowerCase().includes("spellcasting")&&!L.name.toLowerCase().includes("innate")&&(d=L.description);if(!d)return R.spellcasting.casterSpells;d=d.replaceAll("<i>","").replaceAll("</i>","").replaceAll("<b>","").replaceAll("</b>","");const c=d.match(/spellcasting ability is (\w+) \(spell save DC (\d+), [+\-](\d+) to hit/);if(!c)return R.spellcasting.casterSpells;let y=c?parseInt(c[2]):null,S=c?parseInt(c[3]):null;const w=c?c[1].toLowerCase().slice(0,3):null;let M=d.match(/(\d+)[stndrh]{2}-level/);if(!M)return R.spellcasting.casterSpells;M=parseInt(M[1]);let v=null;d.toLowerCase().includes("wizard")?v="Wizard":d.toLowerCase().includes("sorcerer")?v="Sorcerer":d.toLowerCase().includes("bard")?v="Bard":d.toLowerCase().includes("druid")?v="Druid":d.toLowerCase().includes("artificer")?v="Artificer":d.toLowerCase().includes("cleric")?v="Cleric":d.toLowerCase().includes("warlock")?v="Warlock":d.toLowerCase().includes("paladin")?v="Paladin":d.toLowerCase().includes("ranger")&&(v="Ranger");let A=null;switch(v){case"Artificer":case"Wizard":A="int";break;case"Cleric":case"Druid":case"Ranger":A="wis";break;default:A="cha"}let P=t.core.proficiencyBonus,V=Math.floor(t.abilities.stats[A==w?A:w]/2)-5;y===8+P+V&&(y=null),S===P+V&&(S=null);let G=[[],[],[],[],[],[],[],[],[],[]],z={};const Y=new RegExp(/(?:(?<level>\d)[stndrh]{2}\slevel \((?<slots>\d+) slots?\)|Cantrip(?:s)? \(at will\)): (?<spells>.+)$/,"gmi");let Z=Array.from(d.matchAll(Y));for(let L of Z)G[L.groups?.level||0]=De(L.groups?.spells),L.groups?.level&&L.groups?.slots&&(z[parseInt(L.groups.level)]=parseInt(L.groups?.slots));return{casterLevel:M,castingClass:v,spellCastingAbility:A,spellCastingAbilityOverride:A==w?null:w,spellBonusOverride:S,spellDcOverride:y,spellList:G,spellSlotList:z,displayAsAction:o}})(),t.spellcasting.innateSpells=(()=>{let o=!1,d=!1,c=null;for(let O of e.stats.actions)(O.name.toLowerCase().includes("innate spellcasting")||O.name.toLowerCase().includes("spellcasting")&&!O.description.match(/(\d+)[stndrh]{2}-level/))&&(c=O.description,d=O.name.toLowerCase().includes("psionics"),o=!0);if(!c)for(let O of e.stats.additionalAbilities)O.name.toLowerCase().includes("innate spellcasting")&&(c=O.description,d=O.name.toLowerCase().includes("psionics"));if(!c)return R.spellcasting.innateSpells;c=c.replaceAll("<i>","").replaceAll("</i>","").replaceAll("<b>","").replaceAll("</b>","");const y=c.match(/spellcasting ability is (\w+) \(spell save DC (\d+), [+\-](\d+) to hit/i);if(!y)return R.spellcasting.innateSpells;let S=y?parseInt(y[2]):null,w=y?parseInt(y[3]):null;const M=y?y[1].toLowerCase().slice(0,3):null;let v=["Material","Somatic","Verbal"];(c.includes("requiring no components")||c.includes("requiring no spell components"))&&(v=["Material","Somatic","Verbal"]),c.includes("requiring only verbal")&&(v=["Material","Somatic"]),c.includes("requiring only somatic")&&(v=["Material","Verbal"]),c.includes("requiring only material")&&(v=["Somatic","Verbal"]),c.includes("requiring no material")&&(v=["Material"]),c.includes("requiring no somatic")&&(v=["Somatic"]),c.includes("requiring no verbal")&&(v=["Verbal"]);let A=t.core.proficiencyBonus,P=Math.floor(t.abilities.stats[M]/2)-5;S===8+A+P&&(S=null),w===A+P&&(w=null);const V=c.match(/At will: (?<spells>.+)$/im),G=new RegExp(/(?<times>\d+)\/day(?: each)?: (?<spells>.+)$/,"gmi"),z=Array.from(c.matchAll(G));let Y=[],Z=[],L=[];if(z)for(let O of z)"123".includes(O?.groups?.times)&&(O?.groups?.times=="1"&&(Y=Q(O?.groups?.spells)),O?.groups?.times=="2"&&(Z=Q(O?.groups?.spells)),O?.groups?.times=="3"&&(L=Q(O?.groups?.spells)));return{spellList:{0:Q(V?.groups?.spells||"")||[],1:Y,2:Z,3:L},displayAsAction:o,isPsionics:d,spellCastingAbility:M,spellBonusOverride:w,spellDcOverride:S,noComponentsOfType:v}})();let[s,a]=K(e.stats.additionalAbilities,2),[n,g]=K(e.stats.actions,1),[C,p]=[[],[]],[U,q]=K(e.stats.reactions,4),[X,J]=K(e.stats.legendaryActions,9),[x,j]=[[],[]],[ee,W]=[[],[]],[$,H]=[[],[]];const r={features:a,actions:g,bonus:p,reactions:q,legendary:J,lair:j,mythic:W,regional:H};return t.features={features:s,actions:n,bonus:C,reactions:U,legendary:X,lair:x,mythic:ee,regional:$},[t,r]}function ie(e){let t=[];for(let s of e){let a=s.trim().toLowerCase();if(a.includes(" ")&&a.includes("bludgeoning")&&a.includes("slashing")&&a.includes("piercing")){let n="";a.includes("nonmagical")&&(n+="Nonmagical "),a.includes("nonsilvered")&&(n+="Nonsilvered "),a.includes("nonadamantine")&&(n+="Nonadamantine "),a.includes(" aren't magical")&&(n+="Nonmagical "),a.includes(" aren't silvered")&&(n+="Nonsilvered "),a.includes(" aren't adamantine")&&(n+="Nonadamantine ");for(let g of["Bludgeoning","Piercing","Slashing"])t.push(`${n}${g}`)}else t.push(le(s))}return t}function De(e){return e.split(", ").map(t=>de.find(s=>s.toLowerCase()===t.trim().replace(/[.$*_]/g,"").replace(/\(.+\)/,"").toLowerCase())||t.trim().replaceAll(/[.$*_]/g,"").replace(/\(.+\)/,""))}function Q(e){if(e=="")return[];let t=[],s=e.split(", ");for(let a of s){let n=a.match(/\((.*?)\)/i),g=n?n[1]:"",C=de.find(p=>p.toLowerCase()===a.trim().replace(/[.$*_]/g,"").replace(/\(.+\)/,"").trim())||a.trim().replace(/[.$*_]/g,"").replace(/\(.+\)/,"").trim();t.push({spell:C,comment:g})}return t}const Ie=Ae(),Re=ce({data(){return{bestiary:null,savedBestiary:null,creatures:null,searchCreatureList:[],editors:[],user:null,lastHoveredCreature:null,lastClickedCreature:null,hasPinnedBefore:!1,limits:{},allTags:[],bookmarked:!1,isOwner:!1,isEditor:!1,editorToAdd:"",showWarning:!1,critterDbId:"",bestiaryBuilderJson:"",searchOptions:{text:"",tags:[],minCr:0,maxCr:30,env:"",faction:""},sortMode:"Alphabetically",displayCR:Le,md:Ie,isMobile:ue,isExpanded:!1,showEditorModal:!1,showImportModal:!1,selectedCreature:null}},components:{UserBanner:pe,StatblockRenderer:Oe,Breadcrumbs:ke,StatusIcon:Be,LabelledComponent:Se,LabelledNumberInput:$e,Modal:Me},async created(){this.limits=await he??{},fe.then(e=>{this.allTags=e??[]})},async beforeMount(){const e=this.$loading.show();this.user=await me,await this.getBestiary(),e.hide(),this?.bestiary?.name&&(document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`)},setup(){const e=te(""),t=se(e,500),s=te(""),a=se(s,500),n=te(""),g=se(n,500);return{searchText:e,debouncedSearch:t,searchEnv:s,debouncedEnv:a,searchFaction:n,debouncedFaction:g}},computed:{searchCreatures(){if(this.creatures==null)return null;const e=this.$loading.show();let t=this.creatures?.filter(this.filterCreature)||null;return this.sortMode=="Alphabetically"?t.sort((s,a)=>{const n=s.stats.description.name.toLowerCase(),g=a.stats.description.name.toLowerCase();return n<g?-1:n>g?1:0}):this.sortMode=="Creature Type"?t.sort((s,a)=>{const n=s.stats.core.race.toLowerCase(),g=a.stats.core.race.toLowerCase();return n<g?-1:n>g?1:0}):this.sortMode=="CR Descending"?t.sort((s,a)=>a.stats.description.cr-s.stats.description.cr):this.sortMode=="CR Ascending"&&t.sort((s,a)=>s.stats.description.cr-a.stats.description.cr),e.hide(),t}},methods:{filterCreature(e){let t=[];return this.searchOptions.text!=""&&t.push(e.stats.description.name.toLowerCase().includes(this.searchOptions.text.toLowerCase().trim())),this.searchOptions.env!=""&&t.push(e.stats.description.environment.toLowerCase().includes(this.searchOptions.env.toLowerCase().trim())),this.searchOptions.faction!=""&&t.push(e.stats.description.faction.toLowerCase().includes(this.searchOptions.faction.toLowerCase().trim())),this.searchOptions.tags.length>0&&t.push(this.searchOptions.tags.some(s=>e.stats.core.race.toLowerCase().includes(s.toLowerCase()))),(this.searchOptions.minCr!=0||this.searchOptions.maxCr!=30)&&t.push(this.searchOptions.minCr<=e.stats.description.cr&&e.stats.description.cr<=this.searchOptions.maxCr),t.every(s=>s)},exportBestiary(e){if(e){const t=new File([JSON.stringify(this.creatures?.map(n=>n.stats),null,2)],"Creatures.txt",{type:"text/plain"}),s=document.createElement("a"),a=URL.createObjectURL(t);s.href=a,s.download=t.name,document.body.appendChild(s),s.click(),document.body.removeChild(s),window.URL.revokeObjectURL(a)}else navigator.clipboard.writeText(JSON.stringify(this.creatures?.map(t=>t.stats),null,2)),f.info("Exported this bestiary to your clipboard.")},async importBestiaryFromCritterDB(){let e=this.critterDbId.trim(),t=e.includes("publishedbestiary");if(!e.startsWith("https://critterdb.com")&&!e.startsWith("critterdb.com")){f.error("Could not recognize link as a link to a CritterDB bestiary");return}let s=e.split("/");e=s[s.length-1];let a={},n=!1;f.info("Fetching bestiary data has started. This may take a while.");let g=this.$loading.show();if(await fetch(`/api/critterdb/${e}/${t}`).then(p=>E(p)).then(p=>{p.success?a=p.data:(f.error(p.data.error),n=!0),g.hide()}),n)return;g=this.$loading.show(),f.info("Importing creatures has started. This may take a while.");let C=a.creatures.map(p=>Te(p)[0]);await fetch("/api/bestiary/"+this.bestiary?._id+"/addcreatures",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({data:C})}).then(p=>E(p)).then(p=>{p.data.error&&f.error(p.data.error)}),await this.getBestiary(),g.hide(),f.success("Importing has finished!"),this.showImportModal=!1},async importCreaturesFromBestiaryBuilder(){let e;const t=this.$loading.show();try{e=JSON.parse(this.bestiaryBuilderJson)}catch(s){console.error(s),f.error("Something is wrong with the format of your JSON"),t.hide();return}f.info("Importing creatures has started. This may take a while."),await fetch("/api/bestiary/"+this.bestiary?._id+"/addcreatures",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({data:e})}).then(s=>E(s)).then(s=>{s.data.error&&f.error(s.data.error),s.success&&f.success("Importing has finished!")}),await this.getBestiary(),t.hide(),this.showImportModal=!1},async createCreature(e=R,t=!0,s=!0){let a;s&&(a=this.$loading.show());let n={stats:e,bestiary:this.bestiary?._id};if(await fetch("/api/creature/update",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({data:n})}).then(async g=>{let C=await E(g);if(C.success){let p=C.data;this.$router.push(`../statblock-editor/${p._id}`)}else f.error(C.data.error)}),t){const g=document.getElementsByClassName("tile-container")[0];g.scrollTop=g.scrollHeight}s&&a&&a.hide()},async deleteCreature(e){const t=this.$loading.show();await fetch(`/api/creature/${e._id}/delete`).then(async s=>{let a=await E(s);if(a.success){if(f.success("Deleted creature succesfully"),!this.bestiary)return;this.bestiary.creatures=this.bestiary.creatures.filter(n=>n!=e._id),this.creatures=this.creatures?.filter(n=>n._id!=e._id)??[]}else f.error(a.data.error)}),t.hide()},async addEditor(){if(!this.bestiary)return;let e=this.editorToAdd;const t=this.$loading.show();await fetch(`/api/bestiary/${this.bestiary._id}/editors/add/${e}`).then(async s=>{let a=await E(s);a.success?f.success("Added editor succesfully"):f.error(a.data.error)}),await this.getBestiary(),t.hide()},async removeEditor(e){if(!this.bestiary)return;const t=this.$loading.show();await fetch(`/api/bestiary/${this.bestiary._id}/editors/remove/${e}`).then(async s=>{let a=await E(s);a.success?f.success("Removed editor succesfully"):f.error(a.data.error)}),await this.getBestiary(),t.hide()},async getBestiary(){let e=this.$route.params.id;await fetch("/api/bestiary/"+e).then(async t=>{let s=await E(t);if(s.success){this.bestiary=s.data,this.savedBestiary=this.bestiary,this.isOwner=this.user?._id==this.bestiary.owner,this.isEditor=(this.bestiary?.editors??[]).includes(this.user?._id??""),await fetch("/api/bestiary/"+this.bestiary._id+"/creatures").then(async a=>{let n=await E(a);n.success?this.creatures=n.data:(this.creatures=null,f.error(n.data.error))}),this.editors=[];for(let a of this.bestiary?.editors??[])await fetch("/api/user/"+a).then(n=>E(n)).then(n=>{n.success?this.editors.push(n.data):f.error(n.data.error)});this.user?await fetch(`/api/bestiary/${this.bestiary._id}/bookmark/get`).then(async a=>{let n=await E(a);n.success?this.bookmarked=n.data.state:(this.bookmarked=!1,f.error(n.data.error))}):this.bookmarked=!1}else this.bestiary=null,f.error(s.data.error)})},async updateBestiary(){if(!this.bestiary)return;const e=this.$loading.show();fetch(`/api/bestiary/${this.bestiary._id}/update`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({data:this.bestiary})}).then(async t=>{let s=await E(t);s.success?(f.success("Saved bestiary"),this.savedBestiary=this.bestiary,this.showEditorModal=!1):f.error(s.data.error)}),e.hide()},async toggleBookmark(){if(!this.bestiary)return;const e=this.$loading.show();await fetch(`/api/bestiary/${this.bestiary._id}/bookmark/toggle`).then(async t=>{let s=await E(t);s.success?(this.bookmarked=s.data.state,this.bookmarked?f.success("Successfully bookmarked this bestiary!"):f.success("Successfully unbookmarked this bestiary!")):(this.bookmarked=!1,f.error(s.data.error))}),e.hide()},setSelectedCreature(e){this.lastHoveredCreature=e},changeCR(e,t){let s;t?s=this.searchOptions.minCr:s=this.searchOptions.maxCr,s==0&&e?s=.125:s==.125&&e?s=.25:s==.25&&e?s=.5:s==.5&&e?s=1:s==.125&&!e?s=0:s==.25&&!e?s=.125:s==.5&&!e?s=.25:s==1&&!e?s=.5:e?s=Math.min(30,s+1):s=Math.max(0,s-1),t?this.searchOptions.minCr=s:this.searchOptions.maxCr=s}},watch:{lastClickedCreature(){this.hasPinnedBefore||(this.hasPinnedBefore||(this.hasPinnedBefore=!0),f.info("Pinned creature to the view. Click unpin there to go back to hover behaviour."))},"bestiary.status"(e,t){e=="private"&&(this.showWarning=!1),e=="public"&&(this.showWarning=!0)},"bestiary.name"(){document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`},debouncedSearch(){this.searchOptions.text=this.searchText},debouncedEnv(){this.searchOptions.env=this.searchEnv},debouncedFaction(){this.searchOptions.faction=this.searchFaction}}}),B=e=>(Ce("data-v-90efc866"),e=e(),we(),e),Pe={"aria-label":"Filter bestiary"},_e={class:"v-popper__custom-menu"},Ve=B(()=>i("option",null,"Alphabetically",-1)),Fe=B(()=>i("option",null,"CR Ascending",-1)),Ne=B(()=>i("option",null,"CR Descending",-1)),Ue=B(()=>i("option",null,"Creature Type",-1)),qe=[Ve,Fe,Ne,Ue],He={style:{"min-width":"300px"}},ze={class:"two-wide"},Je={class:"flow-vertically"},je=B(()=>i("label",{class:"editor-field__title",for:"challengerating"},[i("span",{class:"text"}," Minimum CR")],-1)),We={class:"quantity"},Ge={class:"quantity-nav"},Ye={class:"flow-vertically"},Ze=B(()=>i("label",{class:"editor-field__title",for:"challengerating"},[i("span",{class:"text"}," Maximum CR")],-1)),Ke={class:"quantity"},Qe={class:"quantity-nav"},Xe={key:0,class:"warning",style:{"text-align":"center"}},xe={"aria-label":"Export bestiary"},et={class:"v-popper__custom-menu"},tt=B(()=>i("span",null,[T(" Export this Bestiary as JSON"),i("br"),T(" to clipboard or to file ")],-1)),st={class:"content"},it={key:0,class:"bestiary"},rt={class:"left-side-container"},at={class:"content-tile header-tile"},ot=["innerHTML"],nt=B(()=>i("hr",null,null,-1)),lt={key:0,class:"bookmark-enabled"},dt={key:1,class:"bookmark-disabled"},ct={class:"tile-container list-tiles"},ut=["onMouseover","onClick"],pt={class:"left-side"},ht={class:"right-side"},ft=["aria-label"],mt={class:"v-popper__custom-menu"},bt=B(()=>i("span",null," Are you sure you want to delete this creature? ",-1)),yt=["onClick"],gt=["aria-label"],vt={class:"cr"},Ct={key:0,class:"create-tile"},wt={key:0,class:"statblock-container"},kt={key:0,class:"pin-notice"},Bt=B(()=>i("b",null,"unpin",-1)),Lt=[Bt],Ot={key:1,class:"statblock-container"},St=B(()=>i("div",{class:"no-creature-text"},[i("p",null,"Hover or click on a creature to see its statblock")],-1)),$t=[St],Mt=B(()=>i("p",null,"Insert a link to a critterDB bestiary to import all its creatures.",-1)),At=B(()=>i("p",null,"Make sure the bestiary is public or has link sharing enabled.",-1)),Et={class:"flow-horizontally"},Tt=B(()=>i("hr",null,null,-1)),Dt=B(()=>i("p",null,"Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.",-1)),It={class:"flow-horizontally"},Rt=["minlength","maxlength"],Pt=B(()=>i("p",null,"Supports markdown",-1)),_t=["maxlength"],Vt={key:0,class:"two-wide"},Ft={class:"editor-block"},Nt=B(()=>i("h3",null,"Editors",-1)),Ut={key:0},qt={class:"editor-container"},Ht={class:"editor-list"},zt=["onClick"],Jt=B(()=>i("span",null,"🗑️",-1)),jt=[Jt],Wt={class:"button-container"},Gt={key:1,class:"warning"};function Yt(e,t,s,a,n,g){const C=D("font-awesome-icon"),p=D("LabelledComponent"),U=D("v-select"),q=D("VDropdown"),X=D("Breadcrumbs"),J=D("UserBanner"),x=D("StatusIcon"),j=D("RouterLink"),ee=D("StatblockRenderer"),W=D("Modal"),$=re("tooltip"),H=re("close-popper");return l(),h("div",null,[e.bestiary?(l(),F(X,{key:0,routes:[{path:e.isOwner||e.isEditor?"../my-bestiaries/":"../bestiaries",text:e.isOwner||e.isEditor?"My Bestiaries":"Bestiaries",isCurrent:!1},{path:"",text:e.bestiary?.name,isCurrent:!0}]},{default:m(()=>[e.isOwner||e.isEditor?b((l(),h("button",{key:0,onClick:t[0]||(t[0]=r=>e.createCreature()),class:"inverted","aria-label":"Create creature"},[u(C,{icon:["fas","plus"]})])),[[$,"Create creature!"]]):k("",!0),e.lastClickedCreature?b((l(),h("button",{key:1,onClick:t[1]||(t[1]=r=>e.lastClickedCreature=null),style:{rotate:"45deg"},"aria-label":"Unpin currently pinned creature"},[u(C,{icon:["fas","thumbtack"]})])),[[$,"Unpin currently pinned creature!"]]):k("",!0),e.isOwner?b((l(),h("button",{key:2,onClick:t[2]||(t[2]=r=>e.showEditorModal=!0),"aria-label":"Edit bestiary"},[u(C,{icon:["fas","pen-to-square"]})])),[[$,"Edit bestiary!"]]):k("",!0),u(q,{distance:6,"positioning-disabled":e.isMobile},{popper:m(()=>[i("div",_e,[u(p,{title:"Sort creatures"},{default:m(()=>[b(i("select",{"onUpdate:modelValue":t[3]||(t[3]=r=>e.sortMode=r),name:"Sort bestiary by attribute",id:"sortcreatures"},qe,512),[[ye,e.sortMode]])]),_:1}),u(p,{title:"Filter"},{default:m(()=>[b(i("input",{type:"text","onUpdate:modelValue":t[4]||(t[4]=r=>e.searchText=r),id:"searchtext",placeholder:"Search by name..."},null,512),[[I,e.searchText]])]),_:1}),u(p,{title:"Creature type"},{default:m(()=>[i("div",He,[u(U,{placeholder:"Search by creature type",modelValue:e.searchOptions.tags,"onUpdate:modelValue":t[5]||(t[5]=r=>e.searchOptions.tags=r),multiple:"",options:["Aberration","Beast","Celestial","Construct","Dragon","Elemental","Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Undead"],inputId:"creaturetype",taggable:!0},null,8,["modelValue"])])]),_:1}),i("div",ze,[i("div",Je,[je,i("div",We,[b(i("input",{type:"number","onUpdate:modelValue":t[6]||(t[6]=r=>e.searchOptions.minCr=r),min:"0",max:"30",inputmode:"numeric",id:"minimumcr"},null,512),[[I,e.searchOptions.minCr]]),i("div",Ge,[i("div",{class:"quantity-button quantity-up",onClick:t[7]||(t[7]=r=>e.changeCR(!0,!0)),"aria-label":"Increase minimum CR"},"+"),i("div",{class:"quantity-button quantity-down",onClick:t[8]||(t[8]=r=>e.changeCR(!1,!0)),"aria-label":"Decrease maximum CR"},"-")])])]),i("div",Ye,[Ze,i("div",Ke,[b(i("input",{type:"number","onUpdate:modelValue":t[9]||(t[9]=r=>e.searchOptions.maxCr=r),min:"0",max:"30",inputmode:"numeric",id:"maximumcr"},null,512),[[I,e.searchOptions.maxCr]]),i("div",Qe,[i("div",{class:"quantity-button quantity-up",onClick:t[10]||(t[10]=r=>e.changeCR(!0,!1)),"aria-label":"Increase minimum CR"},"+"),i("div",{class:"quantity-button quantity-down",onClick:t[11]||(t[11]=r=>e.changeCR(!1,!1)),"aria-label":"Decrease maximum CR"},"-")])])])]),e.searchOptions.minCr>e.searchOptions.maxCr?(l(),h("span",Xe," Min is bigger than max ")):k("",!0),u(p,{title:"Environment"},{default:m(()=>[b(i("input",{type:"text","onUpdate:modelValue":t[12]||(t[12]=r=>e.searchEnv=r),id:"environment",placeholder:"Search by name..."},null,512),[[I,e.searchEnv]])]),_:1}),u(p,{title:"Faction"},{default:m(()=>[b(i("input",{type:"text","onUpdate:modelValue":t[13]||(t[13]=r=>e.searchFaction=r),id:"faction",placeholder:"Search by name..."},null,512),[[I,e.searchFaction]])]),_:1})])]),default:m(()=>[b((l(),h("button",Pe,[u(C,{icon:["fas","tag"]})])),[[$,"Filter bestiary"]])]),_:1},8,["positioning-disabled"]),e.isOwner?b((l(),h("button",{key:3,onClick:t[14]||(t[14]=r=>e.showImportModal=!0),"aria-label":"Import bestiary"},[u(C,{icon:["fas","arrow-right-to-bracket"]})])),[[$,"Import bestiary"]]):k("",!0),u(q,{distance:6,"positioning-disabled":e.isMobile},{popper:m(()=>[i("div",et,[tt,b((l(),h("button",{class:"btn confirm",onClick:t[15]||(t[15]=r=>e.exportBestiary(!1))},[T("Clipboard")])),[[H]]),b((l(),h("button",{class:"btn confirm",onClick:t[16]||(t[16]=r=>e.exportBestiary(!0))},[T("File")])),[[H]])])]),default:m(()=>[b((l(),h("button",xe,[u(C,{icon:["fas","arrow-right-from-bracket"]})])),[[$,"Export bestiary"]])]),_:1},8,["positioning-disabled"])]),_:1},8,["routes"])):k("",!0),i("div",st,[e.bestiary?(l(),h("div",it,[i("div",rt,[i("div",at,[i("h2",null,_(e.bestiary.name?e.bestiary.name:"..."),1),i("p",{class:ae(["description",{expanded:e.isExpanded}]),innerHTML:e.md.render(e.bestiary.description||"No description set.")},null,10,ot),e.bestiary.description.length>0?b((l(),h("button",{key:0,class:"expand-btn",onClick:t[17]||(t[17]=r=>e.isExpanded=!e.isExpanded),"aria-label":"Expand description"},[T(_(e.isExpanded?"▲":"▼"),1)])),[[$,"Expand description"]]):k("",!0),nt,i("div",{class:ae(["footer",{"three-wide":e.isOwner}])},[u(J,{id:e.bestiary.owner},null,8,["id"]),b((l(),h("div",null,[u(x,{icon:e.bestiary.status},null,8,["icon"])])),[[$,e.bestiary.status,void 0,{left:!0}]]),i("div",null,[T(_(e.bestiary.creatures.length),1),u(C,{icon:["fas","skull"]})]),e.isOwner?k("",!0):(l(),h("div",{key:0,role:"button","aria-label":"Toggle bookmark status",onClick:t[18]||(t[18]=N((...r)=>e.toggleBookmark&&e.toggleBookmark(...r),["prevent"])),class:"bookmark"},[e.bookmarked?b((l(),h("span",lt,[u(C,{icon:["fas","star"]})])),[[$,"Unbookmark this bestiary"]]):b((l(),h("span",dt,[u(C,{icon:["fas","star"]})])),[[$,"Bookmark this bestiary"]])]))],2)]),i("div",ct,[u(ge,{name:"slide-fade"},{default:m(()=>[(l(!0),h(oe,null,ne(e.searchCreatures,r=>(l(),h("div",{key:r._id?.toString(),class:"content-tile creature-tile",onMouseover:o=>e.lastHoveredCreature=r.stats,onClick:o=>e.lastClickedCreature=r.stats},[i("div",pt,[i("h3",null,_(r.stats?.description?.name),1),i("span",null,_(r.stats?.core?.size)+" "+_(r.stats?.core?.race)+_(r.stats?.description?.alignment?", "+r.stats?.description?.alignment:""),1)]),i("div",ht,[e.isOwner||e.isEditor?(l(),F(q,{key:0,distance:6,"positioning-disabled":e.isMobile},{popper:m(()=>[i("div",mt,[bt,b((l(),h("button",{class:"btn danger",onClick:N(o=>e.deleteCreature(r),["stop"])},[T("Confirm")],8,yt)),[[H]])])]),default:m(()=>[b((l(),h("button",{onClick:t[19]||(t[19]=N(()=>{},["stop","prevent"])),"aria-label":`Delete ${r.stats.description.name}`},[u(C,{icon:["fas","trash"]})],8,ft)),[[$,"Delete creature"]])]),_:2},1032,["positioning-disabled"])):k("",!0),b((l(),h("button",{"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} ${r.stats.description.name}`,class:"edit-creature",onClick:N(()=>{},["stop"])},[u(j,{class:"creature",to:"/statblock-editor/"+r._id,"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} creature`},{default:m(()=>[e.isOwner||e.isEditor?(l(),F(C,{key:0,icon:["fas","pen-to-square"]})):(l(),F(C,{key:1,icon:["fas","eye"]}))]),_:2},1032,["to","aria-label"])],8,gt)),[[$,`${e.isOwner||e.isEditor?"Edit":"View"} creature`]]),i("span",vt," CR "+_(e.displayCR(r.stats.description.cr)),1)])],40,ut))),128))]),_:1}),e.isOwner||e.isEditor?(l(),h("div",Ct,[i("span",{role:"button",class:"create-text",onClick:t[20]||(t[20]=r=>e.createCreature())},"Add Creature")])):k("",!0)])]),e.creatures&&e.lastHoveredCreature?(l(),h("div",wt,[e.lastClickedCreature?(l(),h("span",kt,[i("span",{class:"unpin-button",onClick:t[21]||(t[21]=r=>e.lastClickedCreature=null),role:"button","aria-label":"unpin currently pinned creature"},Lt),T("📌 ")])):k("",!0),u(ve,{name:"fade",mode:"out-in"},{default:m(()=>[(l(),F(ee,{data:e.lastClickedCreature||e.lastHoveredCreature,key:e.lastClickedCreature?.description.name||e.lastHoveredCreature.description.name},null,8,["data"]))]),_:1})])):(l(),h("div",Ot,$t))])):k("",!0)]),e.bestiary&&e.isOwner?(l(),F(W,{key:1,show:e.showImportModal,onClose:t[26]||(t[26]=r=>e.showImportModal=!1)},{header:m(()=>[T("Import Creatures")]),body:m(()=>[u(p,{title:"CritterDB bestiary link"},{default:m(()=>[Mt,At,i("div",Et,[b(i("input",{type:"text","onUpdate:modelValue":t[22]||(t[22]=r=>e.critterDbId=r),id:"critterdbbestiarylink",placeholder:"CritterDB bestiary link"},null,512),[[I,e.critterDbId]]),i("button",{class:"btn confirm",onClick:t[23]||(t[23]=N((...r)=>e.importBestiaryFromCritterDB&&e.importBestiaryFromCritterDB(...r),["prevent"]))},"Import")])]),_:1}),Tt,u(p,{title:"Bestiary Builder JSON"},{default:m(()=>[Dt,i("div",It,[b(i("input",{type:"text","onUpdate:modelValue":t[24]||(t[24]=r=>e.bestiaryBuilderJson=r),id:"bestiarybuilderjson",placeholder:"Bestiary builder JSON"},null,512),[[I,e.bestiaryBuilderJson]]),i("button",{class:"btn confirm",onClick:t[25]||(t[25]=N((...r)=>e.importCreaturesFromBestiaryBuilder&&e.importCreaturesFromBestiaryBuilder(...r),["prevent"]))},"Import")])]),_:1})]),_:1},8,["show"])):k("",!0),e.bestiary&&e.isOwner?(l(),F(W,{key:2,show:e.showEditorModal,onClose:t[34]||(t[34]=r=>e.showEditorModal=!1)},{header:m(()=>[T("Edit Bestiary")]),body:m(()=>[u(p,{title:"Bestiary name"},{default:m(()=>[b(i("input",{type:"text","onUpdate:modelValue":t[27]||(t[27]=r=>e.bestiary.name=r),minlength:e.limits.nameMin,maxlength:e.limits.nameLength,id:"bestiaryname"},null,8,Rt),[[I,e.bestiary.name]])]),_:1}),u(p,{title:"Description"},{default:m(()=>[Pt,b(i("textarea",{"onUpdate:modelValue":t[28]||(t[28]=r=>e.bestiary.description=r),maxlength:e.limits.descriptionLength,id:"description"},null,8,_t),[[I,e.bestiary.description]])]),_:1}),e.isOwner?(l(),h("div",Vt,[u(p,{title:"Status"},{default:m(()=>[u(U,{modelValue:e.bestiary.status,"onUpdate:modelValue":t[29]||(t[29]=r=>e.bestiary.status=r),options:["public","unlisted","private"],inputId:"status"},null,8,["modelValue"])]),_:1}),u(p,{title:"Tags"},{default:m(()=>[u(U,{placeholder:"Select Tags",modelValue:e.bestiary.tags,"onUpdate:modelValue":t[30]||(t[30]=r=>e.bestiary.tags=r),multiple:"",options:e.allTags,inputId:"tags"},null,8,["modelValue","options"])]),_:1})])):k("",!0),i("div",Ft,[Nt,e.isOwner?(l(),h("p",Ut,"Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time.")):k("",!0),i("div",qt,[(l(!0),h(oe,null,ne(e.editors,r=>(l(),h("div",Ht,[i("p",null,[u(J,{id:r._id},null,8,["id"]),e.isOwner?(l(),h("span",{key:0,role:"button",onClick:o=>e.removeEditor(r._id),class:"delete-creature"},jt,8,zt)):k("",!0)])]))),256))]),u(p,{title:"Add editor"},{default:m(()=>[i("div",Wt,[b(i("input",{type:"text","onUpdate:modelValue":t[31]||(t[31]=r=>e.editorToAdd=r),inputmode:"numeric",placeholder:"Discord user ID",id:"addeditor"},null,512),[[I,e.editorToAdd]]),i("button",{class:"btn",onClick:t[32]||(t[32]=r=>e.addEditor()),id:"add"},"Add")])]),_:1})]),e.showWarning?(l(),h("p",Gt,[T(" By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the "),u(j,{to:"../content-policy"},{default:m(()=>[T("Content Policy")]),_:1}),T(" and agree to be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content policy. ")])):k("",!0)]),footer:m(()=>[i("button",{class:"btn confirm",onClick:t[33]||(t[33]=N((...r)=>e.updateBestiary&&e.updateBestiary(...r),["prevent"]))},"Save changes")]),_:1},8,["show"])):k("",!0)])}const ts=be(Re,[["render",Yt],["__scopeId","data-v-90efc866"]]);export{ts as default};