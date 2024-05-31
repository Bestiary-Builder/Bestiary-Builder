import{U as j,S as G}from"./StatusIcon-BQ29izGF.js";import{_ as Q,t as u}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-DgGZpbr4.js";import{L as K,c as X}from"./LabelledComponent-DkPlCPnf.js";import{_ as Y}from"./Modal.vue_vue_type_style_index_0_lang-Bq2L_rP_.js";import{S as Z,d as x}from"./StatblockRenderer-3AwMHYJc.js";import{e as ee,y as I,Q as F,s as T,C as J,g as C,_ as te,r as w,I as N,o,c as n,A as $,z as c,J as h,b as a,l as b,d as s,O as se,M as g,k,t as B,L as P,w as E,F as L,P as U,U as ie,a5 as re,p as oe,m as ae}from"./index-DYbuaDF_.js";import{_ as ne}from"./Markdown.vue_vue_type_script_setup_true_lang-BvJbr9R6.js";import{$ as O}from"./loading-Dq7zRzU8.js";import"./markdownItAnchor-VSsJ9PWr.js";const le=ee({components:{UserBanner:j,StatblockRenderer:Z,Breadcrumbs:Q,StatusIcon:G,LabelledComponent:K,Modal:Y,Markdown:ne},setup(){const e=I(""),t=F(e,500),r=I(""),l=F(r,500),d=I(""),p=F(d,500);return{searchText:e,debouncedSearch:t,searchEnv:r,debouncedEnv:l,searchFaction:d,debouncedFaction:p}},data(){return{bestiary:null,savedBestiary:null,creatures:null,searchCreatureList:[],editors:[],lastHoveredCreature:null,lastClickedCreature:null,hasPinnedBefore:!1,bookmarked:!1,isOwner:!1,isEditor:!1,editorToAdd:"",showWarning:!1,critterDbId:"",bestiaryBuilderJson:"",notices:{},searchOptions:{text:"",tags:[],minCr:0,maxCr:30,env:"",faction:""},sortMode:"Alphabetically",isExpanded:!1,showEditorModal:!1,showImportModal:!1,selectedCreature:null,store:T,creatureTypes:x,defaultStatblock:J}},computed:{searchCreatures(){if(this.creatures==null)return null;const e=O.show(),t=this.creatures?.filter(r=>this.filterCreature(r))||null;return this.sortMode==="Alphabetically"?t.sort((r,l)=>{const d=r.stats.description.name.toLowerCase(),p=l.stats.description.name.toLowerCase();return d<p?-1:d>p?1:0}):this.sortMode==="Creature Type"?t.sort((r,l)=>{const d=r.stats.core.race.toLowerCase(),p=l.stats.core.race.toLowerCase();return d<p?-1:d>p?1:0}):this.sortMode==="CR Descending"?t.sort((r,l)=>l.stats.description.cr-r.stats.description.cr):this.sortMode==="CR Ascending"&&t.sort((r,l)=>r.stats.description.cr-l.stats.description.cr),e.hide(),t}},watch:{lastClickedCreature(){this.hasPinnedBefore||(this.hasPinnedBefore||(this.hasPinnedBefore=!0),u.info("Pinned creature to the view. Click unpin there to go back to hover behaviour."))},"bestiary.status":function(e,t){e==="private"&&(this.showWarning=!1),e==="public"&&(this.showWarning=!0)},"bestiary.name":function(){document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`},debouncedSearch(){this.searchOptions.text=this.searchText},debouncedEnv(){this.searchOptions.env=this.searchEnv},debouncedFaction(){this.searchOptions.faction=this.searchFaction}},mounted(){const e=O.show();this.getBestiary(),e.hide(),this?.bestiary?.name&&(document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`)},methods:{filterCreature(e){const t=[];return this.searchOptions.text!==""&&t.push(e.stats.description.name.toLowerCase().includes(this.searchOptions.text.toLowerCase().trim())),this.searchOptions.env!==""&&t.push(e.stats.description.environment.toLowerCase().includes(this.searchOptions.env.toLowerCase().trim())),this.searchOptions.faction!==""&&t.push(e.stats.description.faction.toLowerCase().includes(this.searchOptions.faction.toLowerCase().trim())),this.searchOptions.tags.length>0&&t.push(this.searchOptions.tags.some(r=>e.stats.core.race.toLowerCase().includes(r.toLowerCase()))),(this.searchOptions.minCr!==0||this.searchOptions.maxCr!==30)&&t.push(this.searchOptions.minCr<=e.stats.description.cr&&e.stats.description.cr<=this.searchOptions.maxCr),t.every(r=>r)},async exportBestiary(e){if(e){const t=new File([JSON.stringify(this.creatures?.map(d=>d.stats),null,2)],"Creatures.txt",{type:"text/plain"}),r=document.createElement("a"),l=URL.createObjectURL(t);r.href=l,r.download=t.name,document.body.appendChild(r),r.click(),document.body.removeChild(r),window.URL.revokeObjectURL(l)}else await navigator.clipboard.writeText(JSON.stringify(this.creatures?.map(t=>t.stats),null,2)),u.info("Exported this bestiary to your clipboard.")},async importBestiaryFromCritterDB(){let e=this.critterDbId.trim();const t=e.includes("publishedbestiary");if(!e.startsWith("https://critterdb.com")&&!e.startsWith("critterdb.com")){u.error("Could not recognize link as a link to a CritterDB bestiary");return}const r=e.split("/");e=r[r.length-1],u.info("Fetching bestiary data has started. This may take a while.");const l=O.show(),{success:d,data:p,error:f}=await C(`/api/critterdb/${e}/${t}`);if(d){p.failedCreatures.length>0&&u.error(`Failed to parse ${p.failedCreatures.length} creatures, due to invalid data recieved.`);for(const _ of p.failedCreatures)this.notices[_]="Failed to parse, due to unrecognized data."}else{u.error(f),l.hide();return}u.info("Saving creatures has started. This may take a while.");const{success:y,data:S,error:D}=await C(`/api/bestiary/${this.bestiary?._id?.toString()}/addcreatures`,"POST",p.data.creatures);if(!y)this.notices={},u.error(D);else if(S.error){u.error("The import was completed with errors."),this.notices.Errors=S.error;for(const _ of S.ignoredCreatures)this.notices[_.creature]=_.error}await this.getBestiary(),l.hide(),u.success("Importing has finished!"),y&&!S.error&&(this.showImportModal=!1)},async importCreaturesFromBestiaryBuilder(){let e;const t=O.show();try{e=JSON.parse(this.bestiaryBuilderJson)}catch(p){console.error(p),u.error("Something is wrong with the format of your JSON"),t.hide();return}u.info("Importing creatures has started. This may take a while.");const{success:r,data:l,error:d}=await C(`/api/bestiary/${this.bestiary?._id?.toString()}/addcreatures`,"POST",e);if(!r)this.notices={},u.error(d);else if(l.error){u.error("The import was completed with errors."),this.notices.Errors=l.error;for(const p of l.ignoredCreatures)this.notices[p.creature]=p.error}else u.success("Importing has finished!");await this.getBestiary(),t.hide(),r&&!l.error&&(this.showImportModal=!1)},async createCreature(e=J,t=!0){let r;t&&(r=O.show());const l={stats:e,bestiary:this.bestiary?._id},{success:d,data:p,error:f}=await C("/api/creature/add","POST",l);if(d){const y=p;await this.$router.push(`../statblock-editor/${y._id?.toString()}`)}else u.error(f);t&&r&&r.hide()},async deleteCreature(e){const t=O.show(),{success:r,error:l}=await C(`/api/creature/${e._id?.toString()}/delete`);if(r){if(u.success("Deleted creature succesfully"),!this.bestiary)return;this.bestiary.creatures=this.bestiary.creatures.filter(d=>d!==e._id),this.creatures=this.creatures?.filter(d=>d._id!==e._id)??[]}else u.error(l);t.hide()},async addEditor(){if(!this.bestiary)return;const e=this.editorToAdd,t=O.show(),{success:r,error:l}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/editors/add/${e}`);r?u.success("Added editor succesfully"):u.error(l),await this.getBestiary(),t.hide()},async removeEditor(e){if(!this.bestiary)return;const t=O.show(),{success:r,error:l}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/editors/remove/${e}`);r?u.success("Removed editor succesfully"):u.error(l),await this.getBestiary(),t.hide()},async getBestiary(){const e=this.$route.params.id,{success:t,data:r,error:l}=await C(`/api/bestiary/${e.toString()}`);if(!t){this.bestiary=null,u.error(l);return}this.bestiary=r,this.savedBestiary=this.bestiary,this.isOwner=T.user?._id===this.bestiary.owner,this.isEditor=(this.bestiary?.editors??[]).includes(T.user?._id??""),await C(`/api/bestiary/${this.bestiary._id?.toString()}/creatures`).then(async d=>{d.success?this.creatures=d.data:(this.creatures=null,u.error(d.error))}),this.editors=[];for(const d of this.bestiary?.editors??[])await C(`/api/user/${d}`).then(p=>{p.success?this.editors.push(p.data):u.error(p.error)});T.user?await C(`/api/bestiary/${this.bestiary._id?.toString()}/bookmark/get`).then(async d=>{d.success?this.bookmarked=d.data.state:(this.bookmarked=!1,u.error(d.error))}):this.bookmarked=!1},async updateBestiary(){if(!this.bestiary)return;const e=O.show(),{success:t,error:r}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/update`,"POST",this.bestiary);t?(u.success("Saved bestiary"),this.savedBestiary=this.bestiary,this.showEditorModal=!1):u.error(r),e.hide()},async toggleBookmark(){if(!this.bestiary)return;const e=O.show(),{success:t,data:r,error:l}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/bookmark/toggle`);t?(this.bookmarked=r.state,this.bookmarked?u.success("Successfully bookmarked this bestiary!"):u.success("Successfully unbookmarked this bestiary!")):(this.bookmarked=!1,u.error(l)),e.hide()},setSelectedCreature(e){this.lastHoveredCreature=e},changeCR(e,t){let r;t?r=this.searchOptions.minCr:r=this.searchOptions.maxCr,r===0&&e?r=.125:r===.125&&e?r=.25:r===.25&&e?r=.5:r===.5&&e?r=1:r===.125&&!e?r=0:r===.25&&!e?r=.125:r===.5&&!e?r=.25:r===1&&!e?r=.5:e?r=Math.min(30,r+1):r=Math.max(0,r-1),t?this.searchOptions.minCr=r:this.searchOptions.maxCr=r},crAsString:X}}),m=e=>(oe("data-v-763952ad"),e=e(),ae(),e),de={"aria-label":"Filter bestiary"},ue={class:"v-popper__custom-menu"},ce=m(()=>s("option",null,"Alphabetically",-1)),he=m(()=>s("option",null,"CR Ascending",-1)),pe=m(()=>s("option",null,"CR Descending",-1)),me=m(()=>s("option",null,"Creature Type",-1)),be=[ce,he,pe,me],ye={style:{"min-width":"300px"}},fe={class:"two-wide"},Ce={class:"flow-vertically"},ke=m(()=>s("label",{class:"editor-field__title",for:"challengerating"},[s("span",{class:"text"}," Minimum CR")],-1)),ve={class:"quantity"},we={class:"quantity-nav"},ge={class:"flow-vertically"},Be=m(()=>s("label",{class:"editor-field__title",for:"challengerating"},[s("span",{class:"text"}," Maximum CR")],-1)),Oe={class:"quantity"},Se={class:"quantity-nav"},$e={key:0,class:"warning",style:{"text-align":"center"}},Ee={"aria-label":"Export bestiary"},_e={class:"v-popper__custom-menu"},Me=m(()=>s("span",null,[k(" Export this Bestiary as JSON"),s("br"),k(" to clipboard or to file ")],-1)),De={class:"content"},Te={key:0,class:"bestiary"},Ve={class:"left-side-container"},Ie={class:"content-tile header-tile"},Fe=m(()=>s("hr",null,null,-1)),Le={key:0,class:"bookmark-enabled"},Ue={key:1,class:"bookmark-disabled"},Re={class:"tile-container list-tiles"},Ae=["onMouseover","onClick"],qe={class:"left-side"},Je={class:"right-side"},Ne=["aria-label"],Pe={class:"v-popper__custom-menu"},ze=m(()=>s("span",null," Are you sure you want to delete this creature? ",-1)),He=["onClick"],We=["aria-label"],je={class:"cr"},Ge={key:0,class:"create-tile"},Qe={key:0,class:"statblock-container"},Ke={key:0,class:"pin-notice"},Xe=m(()=>s("b",null,"unpin",-1)),Ye=[Xe],Ze={key:1,class:"statblock-container"},xe=m(()=>s("div",{class:"no-creature-text"},[s("p",null,"Hover or click on a creature to see its statblock")],-1)),et=[xe],tt=m(()=>s("p",null,"Insert a link to a critterDB bestiary to import all its creatures.",-1)),st=m(()=>s("p",null,"Make sure the bestiary is public or has link sharing enabled.",-1)),it={class:"flow-horizontally"},rt=m(()=>s("hr",null,null,-1)),ot=m(()=>s("p",null,"Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.",-1)),at={class:"flow-horizontally"},nt=m(()=>s("hr",null,null,-1)),lt={key:0},dt=m(()=>s("p",{class:"warning"},[s("b",null,"Please note the following for this import:")],-1)),ut=["minlength","maxlength"],ct=m(()=>s("p",null,"Supports markdown",-1)),ht=["maxlength"],pt={key:0,class:"two-wide"},mt={class:"editor-block"},bt=m(()=>s("h3",null,"Editors",-1)),yt={key:0},ft={class:"editor-container"},Ct=["onClick"],kt=m(()=>s("span",null,"🗑️",-1)),vt=[kt],wt={class:"button-container"},gt={key:1,class:"warning"};function Bt(e,t,r,l,d,p){const f=w("font-awesome-icon"),y=w("LabelledComponent"),S=w("v-select"),D=w("VDropdown"),_=w("Breadcrumbs"),z=w("Markdown"),R=w("UserBanner"),H=w("StatusIcon"),A=w("RouterLink"),W=w("StatblockRenderer"),q=w("Modal"),v=N("tooltip"),V=N("close-popper");return o(),n("div",null,[e.bestiary?(o(),$(_,{key:0,routes:[{path:e.isOwner||e.isEditor?"../my-bestiaries/":"../bestiaries",text:e.isOwner||e.isEditor?"My Bestiaries":"Bestiaries",isCurrent:!1},{path:"",text:e.bestiary?.name,isCurrent:!0}]},{default:c(()=>[e.isOwner||e.isEditor?h((o(),n("button",{key:0,class:"inverted","aria-label":"Create creature",onClick:t[0]||(t[0]=i=>e.createCreature())},[a(f,{icon:["fas","plus"]})])),[[v,"Create creature!"]]):b("",!0),e.lastClickedCreature?h((o(),n("button",{key:1,style:{rotate:"45deg"},"aria-label":"Unpin currently pinned creature",onClick:t[1]||(t[1]=i=>e.lastClickedCreature=null)},[a(f,{icon:["fas","thumbtack"]})])),[[v,"Unpin currently pinned creature!"]]):b("",!0),e.isOwner?h((o(),n("button",{key:2,"aria-label":"Edit bestiary",onClick:t[2]||(t[2]=i=>e.showEditorModal=!0)},[a(f,{icon:["fas","pen-to-square"]})])),[[v,"Edit bestiary!"]]):b("",!0),a(D,{distance:6,"positioning-disabled":e.store.isMobile},{popper:c(()=>[s("div",ue,[a(y,{title:"Sort creatures",for:"sortcreatures"},{default:c(()=>[h(s("select",{id:"sortcreatures","onUpdate:modelValue":t[3]||(t[3]=i=>e.sortMode=i),name:"Sort bestiary by attribute"},be,512),[[se,e.sortMode]])]),_:1}),a(y,{title:"Filter",for:"searchtext"},{default:c(()=>[h(s("input",{id:"searchtext","onUpdate:modelValue":t[4]||(t[4]=i=>e.searchText=i),type:"text",placeholder:"Search by name..."},null,512),[[g,e.searchText]])]),_:1}),a(y,{title:"Creature type",for:"creatureType"},{default:c(()=>[s("div",ye,[a(S,{modelValue:e.searchOptions.tags,"onUpdate:modelValue":t[5]||(t[5]=i=>e.searchOptions.tags=i),placeholder:"Search by creature type",multiple:"",options:e.creatureTypes,"input-id":"creaturetype",taggable:!0},null,8,["modelValue","options"])])]),_:1}),s("div",fe,[s("div",Ce,[ke,s("div",ve,[h(s("input",{id:"minimumcr","onUpdate:modelValue":t[6]||(t[6]=i=>e.searchOptions.minCr=i),type:"number",min:"0",max:"30",inputmode:"numeric"},null,512),[[g,e.searchOptions.minCr]]),s("div",we,[s("div",{class:"quantity-button quantity-up","aria-label":"Increase minimum CR",onClick:t[7]||(t[7]=i=>e.changeCR(!0,!0))}," + "),s("div",{class:"quantity-button quantity-down","aria-label":"Decrease maximum CR",onClick:t[8]||(t[8]=i=>e.changeCR(!1,!0))}," - ")])])]),s("div",ge,[Be,s("div",Oe,[h(s("input",{id:"maximumcr","onUpdate:modelValue":t[9]||(t[9]=i=>e.searchOptions.maxCr=i),type:"number",min:"0",max:"30",inputmode:"numeric"},null,512),[[g,e.searchOptions.maxCr]]),s("div",Se,[s("div",{class:"quantity-button quantity-up","aria-label":"Increase minimum CR",onClick:t[10]||(t[10]=i=>e.changeCR(!0,!1))}," + "),s("div",{class:"quantity-button quantity-down","aria-label":"Decrease maximum CR",onClick:t[11]||(t[11]=i=>e.changeCR(!1,!1))}," - ")])])])]),e.searchOptions.minCr>e.searchOptions.maxCr?(o(),n("span",$e," Min is bigger than max ")):b("",!0),a(y,{title:"Environment",for:"environment"},{default:c(()=>[h(s("input",{id:"environment","onUpdate:modelValue":t[12]||(t[12]=i=>e.searchEnv=i),type:"text",placeholder:"Search by name..."},null,512),[[g,e.searchEnv]])]),_:1}),a(y,{title:"Faction",for:"faction"},{default:c(()=>[h(s("input",{id:"faction","onUpdate:modelValue":t[13]||(t[13]=i=>e.searchFaction=i),type:"text",placeholder:"Search by name..."},null,512),[[g,e.searchFaction]])]),_:1})])]),default:c(()=>[h((o(),n("button",de,[a(f,{icon:["fas","tag"]})])),[[v,"Filter bestiary"]])]),_:1},8,["positioning-disabled"]),e.isOwner?h((o(),n("button",{key:3,"aria-label":"Import bestiary",onClick:t[14]||(t[14]=i=>e.showImportModal=!0)},[a(f,{icon:["fas","arrow-right-to-bracket"]})])),[[v,"Import bestiary"]]):b("",!0),a(D,{distance:6,"positioning-disabled":e.store.isMobile},{popper:c(()=>[s("div",_e,[Me,h((o(),n("button",{class:"btn confirm",onClick:t[15]||(t[15]=i=>e.exportBestiary(!1))},[k(" Clipboard ")])),[[V]]),h((o(),n("button",{class:"btn confirm",onClick:t[16]||(t[16]=i=>e.exportBestiary(!0))},[k(" File ")])),[[V]])])]),default:c(()=>[h((o(),n("button",Ee,[a(f,{icon:["fas","arrow-right-from-bracket"]})])),[[v,"Export bestiary"]])]),_:1},8,["positioning-disabled"])]),_:1},8,["routes"])):b("",!0),s("div",De,[e.bestiary?(o(),n("div",Te,[s("div",Ve,[s("div",Ie,[s("h2",null,B(e.bestiary.name?e.bestiary.name:"..."),1),a(z,{class:P(["description",{expanded:e.isExpanded}]),text:e.bestiary.description||"No description set.",tag:"p"},null,8,["class","text"]),e.bestiary.description.length>0?h((o(),n("button",{key:0,class:"expand-btn","aria-label":"Expand description",onClick:t[17]||(t[17]=i=>e.isExpanded=!e.isExpanded)},[k(B(e.isExpanded?"▲":"▼"),1)])),[[v,"Expand description"]]):b("",!0),Fe,s("div",{class:P(["footer",{"three-wide":e.isOwner}])},[a(R,{id:e.bestiary.owner},null,8,["id"]),h((o(),n("div",null,[a(H,{icon:e.bestiary.status},null,8,["icon"])])),[[v,e.bestiary.status,void 0,{left:!0}]]),s("div",null,[k(B(e.bestiary.creatures.length),1),a(f,{icon:["fas","skull"]})]),e.isOwner?b("",!0):(o(),n("div",{key:0,role:"button","aria-label":"Toggle bookmark status",class:"bookmark",onClick:t[18]||(t[18]=E((...i)=>e.toggleBookmark&&e.toggleBookmark(...i),["prevent"]))},[e.bookmarked?h((o(),n("span",Le,[a(f,{icon:["fas","star"]})])),[[v,"Unbookmark this bestiary"]]):h((o(),n("span",Ue,[a(f,{icon:["fas","star"]})])),[[v,"Bookmark this bestiary"]])]))],2)]),s("div",Re,[a(ie,{name:"slide-fade"},{default:c(()=>[(o(!0),n(L,null,U(e.searchCreatures,i=>(o(),n("div",{key:i._id?.toString(),class:"content-tile creature-tile",onMouseover:M=>e.lastHoveredCreature=i.stats,onClick:M=>e.lastClickedCreature=i.stats},[s("div",qe,[s("h3",null,B(i.stats?.description?.name),1),s("span",null,B(i.stats?.core?.size)+" "+B(i.stats?.core?.race)+B(i.stats?.description?.alignment?`, ${i.stats?.description?.alignment}`:""),1)]),s("div",Je,[e.isOwner||e.isEditor?(o(),$(D,{key:0,distance:6,"positioning-disabled":e.store.isMobile},{popper:c(()=>[s("div",Pe,[ze,h((o(),n("button",{class:"btn danger",onClick:E(M=>e.deleteCreature(i),["stop"])},[k(" Confirm ")],8,He)),[[V]])])]),default:c(()=>[h((o(),n("button",{"aria-label":`Delete ${i.stats.description.name}`,onClick:t[19]||(t[19]=E(()=>{},["stop","prevent"]))},[a(f,{icon:["fas","trash"]})],8,Ne)),[[v,"Delete creature"]])]),_:2},1032,["positioning-disabled"])):b("",!0),h((o(),n("button",{"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} ${i.stats.description.name}`,class:"edit-creature",onClick:E(()=>{},["stop"])},[a(A,{class:"creature",to:`/statblock-editor/${i._id}`,"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} creature`},{default:c(()=>[e.isOwner||e.isEditor?(o(),$(f,{key:0,icon:["fas","pen-to-square"]})):(o(),$(f,{key:1,icon:["fas","eye"]}))]),_:2},1032,["to","aria-label"])],8,We)),[[v,`${e.isOwner||e.isEditor?"Edit":"View"} creature`]]),s("span",je," CR "+B(e.crAsString(i.stats.description.cr)),1)])],40,Ae))),128))]),_:1}),e.isOwner||e.isEditor?(o(),n("div",Ge,[s("span",{role:"button",class:"create-text",onClick:t[20]||(t[20]=i=>e.createCreature())},"Add Creature")])):b("",!0)])]),e.creatures&&e.lastHoveredCreature?(o(),n("div",Qe,[e.lastClickedCreature?(o(),n("span",Ke,[s("span",{class:"unpin-button",role:"button","aria-label":"unpin currently pinned creature",onClick:t[21]||(t[21]=i=>e.lastClickedCreature=null)},Ye),k("📌 ")])):b("",!0),a(re,{name:"fade",mode:"out-in"},{default:c(()=>[(o(),$(W,{key:e.lastClickedCreature?.description.name||e.lastHoveredCreature.description.name,data:e.lastClickedCreature||e.lastHoveredCreature},null,8,["data"]))]),_:1})])):(o(),n("div",Ze,et))])):b("",!0)]),e.bestiary&&e.isOwner?(o(),$(q,{key:1,show:e.showImportModal,onClose:t[26]||(t[26]=i=>e.showImportModal=!1)},{header:c(()=>[k(" Import Creatures ")]),body:c(()=>[a(y,{title:"CritterDB bestiary link",for:"critterlink"},{default:c(()=>[tt,st,s("div",it,[h(s("input",{id:"critterlink","onUpdate:modelValue":t[22]||(t[22]=i=>e.critterDbId=i),type:"text",placeholder:"CritterDB bestiary link"},null,512),[[g,e.critterDbId]]),s("button",{class:"btn confirm",onClick:t[23]||(t[23]=E((...i)=>e.importBestiaryFromCritterDB&&e.importBestiaryFromCritterDB(...i),["prevent"]))}," Import ")])]),_:1}),rt,a(y,{title:"Bestiary Builder JSON",for:"bestiaryjson"},{default:c(()=>[ot,s("div",at,[h(s("input",{id:"bestiaryjson","onUpdate:modelValue":t[24]||(t[24]=i=>e.bestiaryBuilderJson=i),type:"text",placeholder:"Bestiary builder JSON"},null,512),[[g,e.bestiaryBuilderJson]]),s("button",{class:"btn confirm",onClick:t[25]||(t[25]=E((...i)=>e.importCreaturesFromBestiaryBuilder&&e.importCreaturesFromBestiaryBuilder(...i),["prevent"]))}," Import ")])]),_:1}),nt,JSON.stringify(e.notices)!=="{}"?(o(),n("div",lt,[dt,(o(!0),n(L,null,U(e.notices,(i,M)=>(o(),n("div",{key:M},[s("h3",null,B(M),1),s("p",null,B(i),1)]))),128))])):b("",!0)]),_:1},8,["show"])):b("",!0),e.bestiary&&e.isOwner?(o(),$(q,{key:2,show:e.showEditorModal,onClose:t[34]||(t[34]=i=>e.showEditorModal=!1)},{header:c(()=>[k(" Edit Bestiary ")]),body:c(()=>[a(y,{title:"Bestiary name",for:"bestiaryname"},{default:c(()=>[h(s("input",{id:"bestiaryname","onUpdate:modelValue":t[27]||(t[27]=i=>e.bestiary.name=i),type:"text",minlength:e.store.limits?.nameMin,maxlength:e.store.limits?.nameLength},null,8,ut),[[g,e.bestiary.name]])]),_:1}),a(y,{title:"Description",for:"description"},{default:c(()=>[ct,h(s("textarea",{id:"description","onUpdate:modelValue":t[28]||(t[28]=i=>e.bestiary.description=i),maxlength:e.store.limits?.descriptionLength},null,8,ht),[[g,e.bestiary.description]])]),_:1}),e.isOwner?(o(),n("div",pt,[a(y,{title:"Status",for:"status"},{default:c(()=>[a(S,{modelValue:e.bestiary.status,"onUpdate:modelValue":t[29]||(t[29]=i=>e.bestiary.status=i),options:["public","unlisted","private"],"input-id":"status"},null,8,["modelValue"])]),_:1}),a(y,{title:"Tags",for:"tags"},{default:c(()=>[a(S,{modelValue:e.bestiary.tags,"onUpdate:modelValue":t[30]||(t[30]=i=>e.bestiary.tags=i),placeholder:"Select Tags",multiple:"",options:e.store.tags,"input-id":"tags"},null,8,["modelValue","options"])]),_:1})])):b("",!0),s("div",mt,[bt,e.isOwner?(o(),n("p",yt," Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time. ")):b("",!0),s("div",ft,[(o(!0),n(L,null,U(e.editors,i=>(o(),n("div",{key:i._id,class:"editor-list"},[s("p",null,[a(R,{id:i._id},null,8,["id"]),e.isOwner?(o(),n("span",{key:0,role:"button",class:"delete-creature",onClick:M=>e.removeEditor(i._id)},vt,8,Ct)):b("",!0)])]))),128))]),a(y,{title:"Add editor",for:"addeditor"},{default:c(()=>[s("div",wt,[h(s("input",{id:"addeditor","onUpdate:modelValue":t[31]||(t[31]=i=>e.editorToAdd=i),type:"text",inputmode:"numeric",placeholder:"Discord user ID"},null,512),[[g,e.editorToAdd]]),s("button",{class:"btn",onClick:t[32]||(t[32]=i=>e.addEditor())}," Add ")])]),_:1})]),e.showWarning?(o(),n("p",gt,[k(" By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the "),a(A,{to:"../content-policy"},{default:c(()=>[k(" Content Policy ")]),_:1}),k(" and agree to be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content policy. ")])):b("",!0)]),footer:c(()=>[s("button",{class:"btn confirm",onClick:t[33]||(t[33]=E((...i)=>e.updateBestiary&&e.updateBestiary(...i),["prevent"]))}," Save changes ")]),_:1},8,["show"])):b("",!0)])}const It=te(le,[["render",Bt],["__scopeId","data-v-763952ad"]]);export{It as default};
