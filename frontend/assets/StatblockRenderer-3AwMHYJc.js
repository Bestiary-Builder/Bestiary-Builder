import{_ as b}from"./Markdown.vue_vue_type_script_setup_true_lang-BvJbr9R6.js";import{e as z,S as A,I as j,o as s,c as t,d as n,t as i,l as r,k as p,i as d,F as f,P as _,J as B,b as S,p as M,m as W,_ as V}from"./index-DYbuaDF_.js";import{f as N,s as w,a as L,b as $,h as q,d as I,e as D,g as T,i as J,c as K,n as G,S as H}from"./LabelledComponent-DkPlCPnf.js";function E(c){const o=c.spellcasting.innateSpells,k=c.description.name;let u="";if(!o.spellCastingAbility)return u;!c.description.isProperNoun&&!o.displayAsAction?u+=`The ${k.toLowerCase()}'s spellcasting ability is ${N(o.spellCastingAbility)} (spell save DC ${w(!0,c)}, ${L(!0,c)} to hit with spell attacks). It can innately cast the following spells${$(o.noComponentsOfType)}:`:!c.description.isProperNoun&&o.displayAsAction?u+=`The ${k.toLowerCase()} casts one of the following spells${$(o.noComponentsOfType)} and using ${N(o.spellCastingAbility)} as the spellcasting ability (spell save DC ${w(!0,c)}, ${L(!0,c)} to hit with spell attacks).`:c.description.isProperNoun&&!o.displayAsAction?u+=`${k}'s spellcasting ability is ${N(o.spellCastingAbility)} (spell save DC ${w(!0,c)}, ${L(!0,c)} to hit with spell attacks). ${k} can innately cast the following spells${$(o.noComponentsOfType)}:`:c.description.isProperNoun&&o.displayAsAction&&(u+=`${k} casts one of the following spells${$(o.noComponentsOfType)} and using ${N(o.spellCastingAbility)} as the spellcasting ability (spell save DC ${w(!0,c)}, ${L(!0,c)} to hit with spell attacks).`);for(const y in o.spellList)o.spellList[y].length!==0&&(Number.parseInt(y)===0?u+=`
At will: `:u+=`
${y}/day${o.spellList[y].length>1?" each":""}: `,u+=o.spellList[y].map(v=>v.comment.length>0?`*${v.spell.toLowerCase()} (${v.comment})*`:`*${v.spell.toLowerCase()}*`).sort().join(", "));return u}function O(c){return c.charAt(0).toUpperCase()+c.slice(1)}const R=["str","dex","con","int","wis","cha"],Y={vulnerabilities:"Vulnerabilities ",resistances:"Resistances ",immunities:"Immunities ",conditionImmunities:"Condition Immunities "},Q={bonus:"Bonus Actions",reactions:"Reactions",legendary:"Legendary Actions",mythic:"Mythic Actions",lair:"Lair Actions",regional:"Regional Effects"},ps={features:"New Feature",actions:"New Action",bonus:"New Bonus Action",reactions:"New Reaction",legendary:"New Legendary Action",lair:"New Lair Action",mythic:"New Mythic Action",regional:"New Regional Effect"},us=["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder","Nonmagical Bludgeoning","Nonmagical Piercing","Nonmagical Slashing","Nonmagical Nonsilvered Bludgeoning","Nonmagical Nonsilvered Piercing","Nonmagical Nonsilvered Slashing"],hs=["Blinded","Charmed","Deafened","Disease","Exhaustion","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"],gs=["All","All languages it knew in life","Abyssal","Aarakocra","Aquan","Auran","Celestial","Common","Deep Speech","Draconic","Druidic","Dwarvish","Elvish","Giant","Gith","Gnomish","Goblin","Halfling","Ignan","Infernal","Orc","Primordial","Sylvan","Terran","Thieves' Cant","Undercommon","Understands the languages of its creator but can't speak"],fs=["Unaligned","Good","Neutral","Evil","Lawful Good","Neutral Good","Chaotic Good","Lawful Neutral","Neutral","Chaotic Neutral","Lawful Evil","Neutral Evil","Chaotic Evil","Any Alignment","Typically Good","Typically Neutral","Typically Evil","Typically Lawful Good","Typically Neutral Good","Typically Chaotic Good","Typically Lawful Neutral","Typically Chaotic Neutral","Typically Lawful Evil","Typically Neutral Evil","Typically Chaotic Evil"],ys=["Tiny","Small","Medium","Large","Huge","Gargantuan"],ms=["Aberration","Beast","Celestial","Construct","Dragon","Elemental","Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Undead"],_s=["Artificer","Bard","Cleric","Druid","Paladin","Ranger","Sorcerer","Warlock","Wizard"],ks=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],h=c=>(M("data-v-1dc65671"),c=c(),W(),c),X={class:"stat-block"},Z={class:"stat-block__row"},x={class:"stat-block__name-container"},ee={class:"stat-block__core"},se=["src"],te={class:"stat-block__row"},ae=h(()=>n("b",null," Armor Class ",-1)),ie={key:0},ne=h(()=>n("b",null," Hit Points ",-1)),le={key:0},oe={key:1},re={class:"stat-block__speed-container"},ce=h(()=>n("b",null," Speed ",-1)),de={class:"stat-block__row stat-block__abilities"},pe={class:"stat-block__row"},ue={key:0,class:"stat-block__save-container"},he=h(()=>n("b",null," Saving Throws ",-1)),ge={key:0},fe={key:1},ye={key:2,class:"ending-comma"},me={key:1,class:"stat-block__skills-container"},_e=h(()=>n("b",null," Skills ",-1)),ke={ckass:"stat-block__senses-container"},ve=h(()=>n("b",null," Senses ",-1)),be={class:"stat-block__language-container"},Se=h(()=>n("b",null," Languages ",-1)),Ce={key:0},Ae={key:1},Ne={key:2},we={class:"challenge-prof"},Le=h(()=>n("b",null," Challenge ",-1)),Pe=h(()=>n("b",null," Proficiency Bonus ",-1)),$e={key:0,id:"yes",class:"stat-block__row"},Te={class:"feature-container"},Be={key:0},De={key:0,class:"feature-container__automation-icon"},He={key:1},Ie={key:0},Ge={key:2},Ee=h(()=>n("b",null,[n("i",null,"Spellcasting")],-1)),Oe={class:"feature-container__desc"},Re={key:0},Fe={key:1},Ue={key:2},ze={key:3},je={key:4},Me={key:5},We={key:6},Ve={class:"spell-list"},qe={key:0},Je={key:0},Ke={key:1},Ye={key:1,class:"feature-container"},Qe=h(()=>n("h3",{class:"feature-container__title"}," Actions ",-1)),Xe={key:0},Ze={key:0,class:"feature-container__automation-icon"},xe={key:1},es={key:0},ss={class:"feature-container__title"},ts={key:0},as={key:1},is={key:0,class:"feature-container__automation-icon"},ns={key:2,class:"description"},ls=h(()=>n("h2",{class:"feature-container__title"}," Description ",-1)),os=z({__name:"StatblockRenderer",props:{data:{}},setup(c){const o=c,k=A(()=>{for(const e of o.data.abilities.skills)if(e.isProficient||e.isHalfProficient||e.isExpertise||e.override||e.override===0)return!0;return!1}),u=A(()=>!!(o.data.spellcasting.casterSpells.casterLevel&&o.data.spellcasting.casterSpells.castingClass)),y=A(()=>o.data.spellcasting.innateSpells.spellCastingAbility!=null&&(o.data.spellcasting.innateSpells.spellList[0].length>0||o.data.spellcasting.innateSpells.spellList[1].length>0||o.data.spellcasting.innateSpells.spellList[2].length>0||o.data.spellcasting.innateSpells.spellList[3].length>0)),v=A(()=>{let e=Array.from(o.data.abilities.skills);e.sort((a,l)=>a.skillName.localeCompare(l.skillName));const C=new Set;e=e.filter(a=>C.has(a.skillName)?!1:(C.add(a.skillName),!0)),console.log(H);const g=[];for(const a of e){if(console.log(a.skillName),!a.isExpertise&&!a.isHalfProficient&&!a.isProficient&&!a.override)continue;let l=0;for(const m in H)if(H[m].includes(a.skillName.replaceAll(" ","").toLowerCase().replace("animalh","animalH").replace("sleightofh","sleightOfH"))){if(a.override&&a.override!==null){const P=a.override;g.push(`${a.skillName} ${(P??0)>=0?"+":""}${P}`)}else l=T(m,o.data),a.isHalfProficient?l+=Math.floor(o.data.core.proficiencyBonus/2):a.isProficient?l+=o.data.core.proficiencyBonus:a.isExpertise&&(l+=o.data.core.proficiencyBonus*2),g.push(`${a.skillName} ${l>=0?"+":""}${l}`);break}else continue}return g.join(", ")}),F=A(()=>{const e=o.data.defenses.hp.numOfHitDie*T("con",o.data);return e!==0?e>0?`+${e.toString()}`:e.toString():""}),U=e=>{const C=(g,a)=>{const l=g.split(" ").pop(),m=a.split(" ").pop();return l.localeCompare(m)};return e.sort(C).map(g=>g.toLowerCase())};return(e,C)=>{const g=j("tooltip");return s(),t("div",X,[n("div",Z,[n("h1",x,i(e.data.description.name),1),n("span",ee,i(e.data.core.size)+" "+i(e.data.core.race)+i(e.data.description.alignment?",":"")+" "+i(e.data.description.alignment),1),e.data.description.image?(s(),t("img",{key:0,class:"stat-block__image",src:e.data.description.image},null,8,se)):r("",!0)]),n("div",te,[n("div",null,[ae,p(" "+i(e.data.defenses.ac.ac)+" ",1),e.data.defenses.ac.acSource?(s(),t("span",ie," ("+i(e.data.defenses.ac.acSource)+") ",1)):r("",!0)]),n("div",null,[ne,e.data.defenses.hp.override?(s(),t("span",le,i(e.data.defenses.hp.override),1)):(s(),t("span",oe,i(d(q)(e.data))+" ("+i(e.data.defenses.hp.numOfHitDie)+"d"+i(e.data.defenses.hp.sizeOfHitDie)+i(F.value)+")",1))]),n("div",re,[ce,p(" "+i(d(I)(e.data.core.speed)),1)])]),n("div",de,[(s(!0),t(f,null,_(d(R),a=>(s(),t("div",{key:a},[n("div",null,[n("b",null,i(a.toUpperCase()),1)]),n("span",null,i(e.data.abilities.stats[a])+" ("+i(d(D)(d(T)(a,e.data)))+")",1)]))),128))]),n("div",pe,[Object.values(e.data.abilities.saves).some(a=>a.isProficient===!0||a.override!==null)?(s(),t("div",ue,[he,(s(!0),t(f,null,_(d(R),a=>(s(),t(f,{key:a},[e.data.abilities.saves[a].override!==null?(s(),t("span",ge,i(d(O)(a))+" "+i(d(D)(e.data.abilities.saves[a].override||0)),1)):e.data.abilities.saves[a].isProficient?(s(),t("span",fe,i(d(O)(a))+" "+i(d(D)(e.data.core.proficiencyBonus+d(T)(a,e.data))),1)):r("",!0),e.data.abilities.saves[a].override!==null||e.data.abilities.saves[a].isProficient?(s(),t("span",ye,", ")):r("",!0)],64))),128))])):r("",!0),k.value?(s(),t("div",me,[_e,p(" "+i(v.value),1)])):r("",!0),(s(!0),t(f,null,_(d(Y),(a,l)=>(s(),t(f,null,[e.data.defenses[l].length>0?(s(),t("div",{key:l,class:"stat-block__res-container"},[n("b",null,i(a),1),n("span",null,i(U(e.data.defenses[l]).join(", ")),1)])):r("",!0)],64))),256)),n("div",ke,[ve,p(" "+i(d(I)(e.data.core.senses,!0))+" ",1),n("span",null," passive Perception "+i(d(J)(e.data)),1)]),n("div",be,[Se,e.data.core.languages&&e.data.core.languages.length===0&&!e.data.misc.telepathy?(s(),t("span",Ce," — ")):(s(),t("span",Ae,i(e.data.core.languages?.sort().join(", ")),1)),e.data.misc.telepathy?(s(),t("span",Ne," telepathy "+i(e.data.misc.telepathy)+"ft.",1)):r("",!0)]),n("div",we,[n("span",null,[Le,p(" "+i(d(K)(e.data.description.cr))+" ("+i(e.data.description.xp)+" xp) ",1)]),n("span",null,[Pe,p(" +"+i(e.data.core.proficiencyBonus),1)])])]),e.data.features.features.length>0||u.value||y.value&&!e.data.spellcasting.innateSpells.displayAsAction?(s(),t("div",$e,[n("div",Te,[e.data.misc.featureHeaderTexts.features?(s(),t("p",Be,i(e.data.misc.featureHeaderTexts.features),1)):r("",!0),(s(!0),t(f,null,_(e.data.features.features,(a,l)=>(s(),t("p",{key:l},[n("b",null,[n("i",null,i(a.name)+".",1),a.automation?B((s(),t("sup",De,[p("†")])),[[g,"Has Automation"]]):r("",!0)]),S(b,{class:"feature-container__desc",text:a.description,tag:"span"},null,8,["text"])]))),128)),y.value&&!e.data.spellcasting.innateSpells.displayAsAction?(s(),t("p",He,[n("b",null,[n("i",null,[p("Innate Spellcasting"),e.data.spellcasting.innateSpells.isPsionics?(s(),t("span",Ie," (Psionics)")):r("",!0),p(".")])]),S(b,{class:"feature-container__desc",text:d(E)(e.data),tag:"span"},null,8,["text"])])):r("",!0),u.value&&e.data.spellcasting.casterSpells.castingClass&&e.data.spellcasting.casterSpells.casterLevel&&e.data.spellcasting.casterSpells.spellSlotList?(s(),t("p",Ge,[Ee,n("span",Oe,[e.data.description.isProperNoun?r("",!0):(s(),t("span",Re," The ")),p(" "+i(e.data.description.isProperNoun?e.data.description.name:e.data.description.name.toLowerCase())+" is a "+i(d(G)(e.data.spellcasting.casterSpells.casterLevel))+"-level spellcaster. ",1),e.data.description.isProperNoun?(s(),t("span",Fe," Their ")):(s(),t("span",Ue," Its ")),p(" spellcasting ability is "+i(d(N)(e.data.spellcasting.casterSpells.spellCastingAbilityOverride??e.data.spellcasting.casterSpells.spellCastingAbility))+" (spell save DC "+i(d(w)(!1,e.data))+", "+i(d(L)(!1,e.data))+" to hit with spell attacks). ",1),e.data.description.isProperNoun?(s(),t("span",je,i(e.data.description.name),1)):(s(),t("span",ze," It ")),["Sorcerer","Bard","Ranger","Warlock"].includes(e.data.spellcasting.casterSpells.castingClass)?(s(),t("span",Me," knows the following "+i(e.data.spellcasting.casterSpells.castingClass.toLowerCase())+" spells: ",1)):(s(),t("span",We," has the following "+i(e.data.spellcasting.casterSpells.castingClass.toLowerCase())+" spells prepared: ",1)),n("div",Ve,[(s(!0),t(f,null,_(e.data.spellcasting.casterSpells.spellList,(a,l)=>(s(),t("div",{key:l},[l===0&&!["Ranger","Paladin"].includes(e.data.spellcasting.casterSpells.castingClass)||Object.keys(e.data.spellcasting.casterSpells.spellSlotList).includes(l.toString())?(s(),t("div",qe,[l===0&&a.length>0?(s(),t("span",Je," Cantrips (at will): ")):a.length>0?(s(),t("span",Ke,i(d(G)(l))+" level ("+i(e.data.spellcasting.casterSpells.spellSlotList[l])+" slots): ",1)):r("",!0),n("i",null,i(a.sort().join(", ")),1)])):r("",!0)]))),128))])])])):r("",!0)])])):r("",!0),e.data.features.actions.length>0||y.value&&e.data.spellcasting.innateSpells.displayAsAction?(s(),t("div",Ye,[Qe,e.data.misc.featureHeaderTexts.actions?(s(),t("p",Xe,i(e.data.misc.featureHeaderTexts.actions),1)):r("",!0),(s(!0),t(f,null,_(e.data.features.actions,(a,l)=>(s(),t("p",{key:l},[n("b",null,[n("i",null,i(a.name)+".",1),a.automation?B((s(),t("sup",Ze,[p("†")])),[[g,"Has Automation"]]):r("",!0)]),S(b,{class:"feature-container__desc",text:a.description,tag:"span"},null,8,["text"])]))),128)),y.value&&e.data.spellcasting.innateSpells.displayAsAction?(s(),t("p",xe,[n("b",null,[n("i",null,[p("Spellcasting"),e.data.spellcasting.innateSpells.isPsionics?(s(),t("span",es," (Psionics)")):r("",!0),p(".")])]),S(b,{class:"feature-container__desc",text:d(E)(e.data),tag:"span"},null,8,["text"])])):r("",!0)])):r("",!0),(s(!0),t(f,null,_(d(Q),(a,l)=>(s(),t(f,null,[e.data.features[l].length>0?(s(),t("div",{key:l,class:"feature-container"},[n("h3",ss,i(a),1),l==="legendary"&&e.data.misc.featureHeaderTexts[l]?(s(),t("p",ts,i(e.data.misc.featureHeaderTexts[l].replace("$NUM$",e.data.misc.legActionsPerRound.toString())),1)):e.data.misc.featureHeaderTexts[l]?(s(),t("p",as,i(e.data.misc.featureHeaderTexts[l]),1)):r("",!0),(s(!0),t(f,null,_(e.data.features[l],(m,P)=>(s(),t("p",{key:P},[n("b",null,[n("i",null,i(m.name)+".",1)]),m.automation?B((s(),t("sup",is,[p("†")])),[[g,"Has Automation"]]):r("",!0),S(b,{class:"feature-container__desc",text:m.description,tag:"span"},null,8,["text"])]))),128))])):r("",!0)],64))),256)),e.data.description.description?(s(),t("div",ns,[ls,S(b,{text:e.data.description.description},null,8,["text"])])):r("",!0)])}}}),vs=V(os,[["__scopeId","data-v-1dc65671"]]);export{vs as S,fs as a,ys as b,O as c,ms as d,_s as e,ks as f,hs as g,gs as l,ps as n,us as r,R as s};
