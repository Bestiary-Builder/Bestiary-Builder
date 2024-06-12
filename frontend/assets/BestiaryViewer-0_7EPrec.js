import{U as j,S as G}from"./StatusIcon-BfO8JYX5.js";import{_ as X,t as u}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-DEGxZsjc.js";import{L as K,a as Q}from"./LabelledComponent-Cb6yFlfW.js";import{_ as Y}from"./Modal.vue_vue_type_style_index_0_lang-B_6qs_5e.js";import{S as Z,c as x}from"./StatblockRenderer-D76sOFbI.js";import{e as ee,q as V,X as I,s as T,W as N,i as C,_ as te,r as v,L as J,o,c as l,x as $,v as d,d as s,b as a,M as p,w as E,g as k,h as y,R as se,P as S,t as B,O as P,F as U,S as L,U as re,a6 as ie,p as oe,j as ae}from"./index-Qg_Jh5vw.js";import{_ as ne}from"./Markdown.vue_vue_type_script_setup_true_lang-FQggN69m.js";import{$ as O}from"./loading-eEk9Zn1e.js";import"./markdownItAnchor-VSsJ9PWr.js";const le=ee({components:{UserBanner:j,StatblockRenderer:Z,Breadcrumbs:X,StatusIcon:G,LabelledComponent:K,Modal:Y,Markdown:ne},setup(){const e=V(""),t=I(e,500),r=V(""),n=I(r,500),c=V(""),h=I(c,500);return{searchText:e,debouncedSearch:t,searchEnv:r,debouncedEnv:n,searchFaction:c,debouncedFaction:h}},data(){return{bestiary:null,savedBestiary:null,creatures:null,searchCreatureList:[],editors:[],lastHoveredCreature:null,lastClickedCreature:null,hasPinnedBefore:!1,bookmarked:!1,isOwner:!1,isEditor:!1,editorToAdd:"",showWarning:!1,critterDbId:"",bestiaryBuilderJson:"",notices:{},searchOptions:{text:"",tags:[],minCr:0,maxCr:30,env:"",faction:""},sortMode:"Alphabetically",isExpanded:!1,showEditorModal:!1,showImportModal:!1,selectedCreature:null,srdCreatures:[],store:T,creatureTypes:x,defaultStatblock:N}},computed:{searchCreatures(){if(this.creatures==null)return null;const e=O.show(),t=this.creatures?.filter(r=>this.filterCreature(r))||null;return this.sortMode==="Alphabetically"?t.sort((r,n)=>{const c=r.stats.description.name.toLowerCase(),h=n.stats.description.name.toLowerCase();return c<h?-1:c>h?1:0}):this.sortMode==="Creature Type"?t.sort((r,n)=>{const c=r.stats.core.race.toLowerCase(),h=n.stats.core.race.toLowerCase();return c<h?-1:c>h?1:0}):this.sortMode==="CR Descending"?t.sort((r,n)=>n.stats.description.cr-r.stats.description.cr):this.sortMode==="CR Ascending"&&t.sort((r,n)=>r.stats.description.cr-n.stats.description.cr),e.hide(),t}},watch:{lastClickedCreature(){this.hasPinnedBefore||(this.hasPinnedBefore||(this.hasPinnedBefore=!0),u.info("Pinned creature to the view. Click unpin there to go back to hover behaviour."))},"bestiary.status":function(e,t){e==="private"&&(this.showWarning=!1),e==="public"&&(this.showWarning=!0)},"bestiary.name":function(){document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`},debouncedSearch(){this.searchOptions.text=this.searchText},debouncedEnv(){this.searchOptions.env=this.searchEnv},debouncedFaction(){this.searchOptions.faction=this.searchFaction}},async mounted(){const e=O.show();this.getBestiary(),e.hide(),this?.bestiary?.name&&(document.title=`${this?.bestiary?.name.substring(0,16)} | Bestiary Builder`);const{success:t,data:r,error:n}=await C("/api/srd-creatures/list");t&&(this.srdCreatures=r),n&&u.error(n)},methods:{filterCreature(e){const t=[];return this.searchOptions.text!==""&&t.push(e.stats.description.name.toLowerCase().includes(this.searchOptions.text.toLowerCase().trim())),this.searchOptions.env!==""&&t.push(e.stats.description.environment.toLowerCase().includes(this.searchOptions.env.toLowerCase().trim())),this.searchOptions.faction!==""&&t.push(e.stats.description.faction.toLowerCase().includes(this.searchOptions.faction.toLowerCase().trim())),this.searchOptions.tags.length>0&&t.push(this.searchOptions.tags.some(r=>e.stats.core.race.toLowerCase().includes(r.toLowerCase()))),(this.searchOptions.minCr!==0||this.searchOptions.maxCr!==30)&&t.push(this.searchOptions.minCr<=e.stats.description.cr&&e.stats.description.cr<=this.searchOptions.maxCr),t.every(r=>r)},async exportBestiary(e){if(e){const t=new File([JSON.stringify(this.creatures?.map(c=>c.stats),null,2)],"Creatures.txt",{type:"text/plain"}),r=document.createElement("a"),n=URL.createObjectURL(t);r.href=n,r.download=t.name,document.body.appendChild(r),r.click(),document.body.removeChild(r),window.URL.revokeObjectURL(n)}else await navigator.clipboard.writeText(JSON.stringify(this.creatures?.map(t=>t.stats),null,2)),u.info("Exported this bestiary to your clipboard.")},async importBestiaryFromCritterDB(){let e=this.critterDbId.trim();const t=e.includes("publishedbestiary");if(!e.startsWith("https://critterdb.com")&&!e.startsWith("critterdb.com")){u.error("Could not recognize link as a link to a CritterDB bestiary");return}const r=e.split("/");e=r[r.length-1],u.info("Fetching bestiary data has started. This may take a while.");const n=O.show(),{success:c,data:h,error:f}=await C(`/api/critterdb/${e}/${t}`);if(c){h.failedCreatures.length>0&&u.error(`Failed to parse ${h.failedCreatures.length} creatures, due to invalid data recieved.`);for(const M of h.failedCreatures)this.notices[M]="Failed to parse, due to unrecognized data."}else{u.error(f),n.hide();return}u.info("Saving creatures has started. This may take a while.");const{success:m,data:g,error:_}=await C(`/api/bestiary/${this.bestiary?._id?.toString()}/addcreatures`,"POST",h.data.creatures);if(!m)this.notices={},u.error(_);else if(g.error){u.error("The import was completed with errors."),this.notices.Errors=g.error;for(const M of g.ignoredCreatures)this.notices[M.creature]=M.error}await this.getBestiary(),n.hide(),u.success("Importing has finished!"),m&&!g.error&&(this.showImportModal=!1)},async importCreaturesFromBestiaryBuilder(){let e;const t=O.show();try{e=JSON.parse(this.bestiaryBuilderJson)}catch(h){console.error(h),u.error("Something is wrong with the format of your JSON"),t.hide();return}u.info("Importing creatures has started. This may take a while.");const{success:r,data:n,error:c}=await C(`/api/bestiary/${this.bestiary?._id?.toString()}/addcreatures`,"POST",e);if(!r)this.notices={},u.error(c);else if(n.error){u.error("The import was completed with errors."),this.notices.Errors=n.error;for(const h of n.ignoredCreatures)this.notices[h.creature]=h.error}else u.success("Importing has finished!");await this.getBestiary(),t.hide(),r&&!n.error&&(this.showImportModal=!1)},async createCreature(e=N,t=!0){let r;t&&(r=O.show());const n={stats:e,bestiary:this.bestiary?._id},{success:c,data:h,error:f}=await C("/api/creature/add","POST",n);if(c){const m=h;await this.$router.push(`../statblock-editor/${m._id?.toString()}`)}else u.error(f);t&&r&&r.hide()},async deleteCreature(e){const t=O.show(),{success:r,error:n}=await C(`/api/creature/${e._id?.toString()}/delete`);if(r){if(u.success("Deleted creature succesfully"),!this.bestiary)return;this.bestiary.creatures=this.bestiary.creatures.filter(c=>c!==e._id),this.creatures=this.creatures?.filter(c=>c._id!==e._id)??[]}else u.error(n);t.hide()},async importSrdCreature(e){const{success:t,data:r,error:n}=await C(`/api/srd-creature/${encodeURIComponent(e)}`);if(t)return await this.createCreature(r),r;u.error(n)},async addEditor(){if(!this.bestiary)return;const e=this.editorToAdd,t=O.show(),{success:r,error:n}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/editors/add/${e}`);r?u.success("Added editor succesfully"):u.error(n),await this.getBestiary(),t.hide()},async removeEditor(e){if(!this.bestiary)return;const t=O.show(),{success:r,error:n}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/editors/remove/${e}`);r?u.success("Removed editor succesfully"):u.error(n),await this.getBestiary(),t.hide()},async getBestiary(){const e=this.$route.params.id,{success:t,data:r,error:n}=await C(`/api/bestiary/${e.toString()}`);if(!t){this.bestiary=null,u.error(n);return}this.bestiary=r,this.savedBestiary=this.bestiary,this.isOwner=T.user?._id===this.bestiary.owner,this.isEditor=(this.bestiary?.editors??[]).includes(T.user?._id??""),await C(`/api/bestiary/${this.bestiary._id?.toString()}/creatures`).then(async c=>{c.success?this.creatures=c.data:(this.creatures=null,u.error(c.error))}),this.editors=[];for(const c of this.bestiary?.editors??[])await C(`/api/user/${c}`).then(h=>{h.success?this.editors.push(h.data):u.error(h.error)});T.user?await C(`/api/bestiary/${this.bestiary._id?.toString()}/bookmark/get`).then(async c=>{c.success?this.bookmarked=c.data.state:(this.bookmarked=!1,u.error(c.error))}):this.bookmarked=!1},async updateBestiary(){if(!this.bestiary)return;const e=O.show(),{success:t,error:r}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/update`,"POST",this.bestiary);t?(u.success("Saved bestiary"),this.savedBestiary=this.bestiary,this.showEditorModal=!1):u.error(r),e.hide()},async toggleBookmark(){if(!this.bestiary)return;const e=O.show(),{success:t,data:r,error:n}=await C(`/api/bestiary/${this.bestiary._id?.toString()}/bookmark/toggle`);t?(this.bookmarked=r.state,this.bookmarked?u.success("Successfully bookmarked this bestiary!"):u.success("Successfully unbookmarked this bestiary!")):(this.bookmarked=!1,u.error(n)),e.hide()},setSelectedCreature(e){this.lastHoveredCreature=e},changeCR(e,t){let r;t?r=this.searchOptions.minCr:r=this.searchOptions.maxCr,r===0&&e?r=.125:r===.125&&e?r=.25:r===.25&&e?r=.5:r===.5&&e?r=1:r===.125&&!e?r=0:r===.25&&!e?r=.125:r===.5&&!e?r=.25:r===1&&!e?r=.5:e?r=Math.min(30,r+1):r=Math.max(0,r-1),t?this.searchOptions.minCr=r:this.searchOptions.maxCr=r},crAsString:Q}}),b=e=>(oe("data-v-89e782bb"),e=e(),ae(),e),de={class:"inverted","aria-label":"Create creature"},ue={class:"v-popper__custom-menu"},ce={"aria-label":"Filter bestiary"},pe={class:"v-popper__custom-menu"},he=b(()=>s("option",null,"Alphabetically",-1)),me=b(()=>s("option",null,"CR Ascending",-1)),be=b(()=>s("option",null,"CR Descending",-1)),ye=b(()=>s("option",null,"Creature Type",-1)),fe=[he,me,be,ye],Ce={style:{"min-width":"300px"}},ke={class:"two-wide"},we={class:"flow-vertically"},ve=b(()=>s("label",{class:"editor-field__title",for:"challengerating"},[s("span",{class:"text"}," Minimum CR")],-1)),ge={class:"quantity"},Se={class:"quantity-nav"},Be={class:"flow-vertically"},Oe=b(()=>s("label",{class:"editor-field__title",for:"challengerating"},[s("span",{class:"text"}," Maximum CR")],-1)),$e={class:"quantity"},Ee={class:"quantity-nav"},_e={key:0,class:"warning",style:{"text-align":"center"}},Me={"aria-label":"Export bestiary"},De={class:"v-popper__custom-menu"},Fe=b(()=>s("span",null,[k(" Export this Bestiary as JSON"),s("br"),k(" to clipboard or to file ")],-1)),Te={class:"content"},Ve={key:0,class:"bestiary"},Ie={class:"left-side-container"},Ue={class:"content-tile header-tile"},Le=b(()=>s("hr",null,null,-1)),Re={key:0,class:"bookmark-enabled"},Ae={key:1,class:"bookmark-disabled"},qe={class:"tile-container list-tiles"},Ne=["onMouseover","onClick"],Je={class:"left-side"},Pe={class:"right-side"},We=["aria-label"],ze={class:"v-popper__custom-menu"},He=b(()=>s("span",null," Are you sure you want to delete this creature? ",-1)),je=["onClick"],Ge=["aria-label"],Xe={class:"cr"},Ke={key:0,class:"create-tile"},Qe=b(()=>s("span",{role:"button",class:"create-text"},"Add Creature",-1)),Ye={class:"v-popper__custom-menu"},Ze={key:0,class:"statblock-container"},xe={key:0,class:"pin-notice"},et=b(()=>s("b",null,"unpin",-1)),tt=[et],st={key:1,class:"statblock-container"},rt=b(()=>s("div",{class:"no-creature-text"},[s("p",null,"Hover or click on a creature to see its statblock")],-1)),it=[rt],ot=b(()=>s("p",null,"Insert a link to a critterDB bestiary to import all its creatures.",-1)),at=b(()=>s("p",null,"Make sure the bestiary is public or has link sharing enabled.",-1)),nt={class:"flow-horizontally"},lt=b(()=>s("hr",null,null,-1)),dt=b(()=>s("p",null,"Insert the JSON as text gotten from clicking export on another bestiary within Bestiary Builder.",-1)),ut={class:"flow-horizontally"},ct=b(()=>s("hr",null,null,-1)),pt={key:0},ht=b(()=>s("p",{class:"warning"},[s("b",null,"Please note the following for this import:")],-1)),mt=["minlength","maxlength"],bt=b(()=>s("p",null,"Supports markdown",-1)),yt=["maxlength"],ft={key:0,class:"two-wide"},Ct={class:"editor-block"},kt=b(()=>s("h3",null,"Editors",-1)),wt={key:0},vt={class:"editor-container"},gt=["onClick"],St=b(()=>s("span",null,"🗑️",-1)),Bt=[St],Ot={class:"button-container"},$t={key:1,class:"warning"};function Et(e,t,r,n,c,h){const f=v("font-awesome-icon"),m=v("LabelledComponent"),g=v("v-select"),_=v("VDropdown"),M=v("Breadcrumbs"),W=v("Markdown"),R=v("UserBanner"),z=v("StatusIcon"),A=v("RouterLink"),H=v("StatblockRenderer"),q=v("Modal"),w=J("tooltip"),F=J("close-popper");return o(),l("div",null,[e.bestiary?(o(),$(M,{key:0,routes:[{path:e.isOwner||e.isEditor?"../my-bestiaries/":"../bestiaries",text:e.isOwner||e.isEditor?"My Bestiaries":"Bestiaries",isCurrent:!1},{path:"",text:e.bestiary?.name,isCurrent:!0}]},{default:d(()=>[e.isOwner||e.isEditor?(o(),$(_,{key:0,distance:6,placement:"top","positioning-disabled":e.store.isMobile},{popper:d(()=>[s("div",ue,[a(m,{title:"From Scratch",for:"fromScratch"},{default:d(()=>[p((o(),l("button",{id:"fromScratch",class:"btn",onClick:t[0]||(t[0]=E(i=>e.createCreature(),["stop"]))},[k(" From scratch ")])),[[F]])]),_:1}),a(m,{title:"From SRD Creature",for:"fromSrd"},{default:d(()=>[a(g,{options:e.srdCreatures,"input-id":"fromSrd",placeholder:"Select SRD creature",style:{"min-width":"300px"},"onOption:selected":t[1]||(t[1]=i=>e.importSrdCreature(i))},null,8,["options"])]),_:1})])]),default:d(()=>[p((o(),l("button",de,[a(f,{icon:["fas","plus"]})])),[[w,"Create creature!"]])]),_:1},8,["positioning-disabled"])):y("",!0),e.lastClickedCreature?p((o(),l("button",{key:1,style:{rotate:"45deg"},"aria-label":"Unpin currently pinned creature",onClick:t[2]||(t[2]=i=>e.lastClickedCreature=null)},[a(f,{icon:["fas","thumbtack"]})])),[[w,"Unpin currently pinned creature!"]]):y("",!0),e.isOwner?p((o(),l("button",{key:2,"aria-label":"Edit bestiary",onClick:t[3]||(t[3]=i=>e.showEditorModal=!0)},[a(f,{icon:["fas","pen-to-square"]})])),[[w,"Edit bestiary!"]]):y("",!0),a(_,{distance:6,"positioning-disabled":e.store.isMobile},{popper:d(()=>[s("div",pe,[a(m,{title:"Sort creatures",for:"sortcreatures"},{default:d(()=>[p(s("select",{id:"sortcreatures","onUpdate:modelValue":t[4]||(t[4]=i=>e.sortMode=i),name:"Sort bestiary by attribute"},fe,512),[[se,e.sortMode]])]),_:1}),a(m,{title:"Filter",for:"searchtext"},{default:d(()=>[p(s("input",{id:"searchtext","onUpdate:modelValue":t[5]||(t[5]=i=>e.searchText=i),type:"text",placeholder:"Search by name..."},null,512),[[S,e.searchText]])]),_:1}),a(m,{title:"Creature type",for:"creatureType"},{default:d(()=>[s("div",Ce,[a(g,{modelValue:e.searchOptions.tags,"onUpdate:modelValue":t[6]||(t[6]=i=>e.searchOptions.tags=i),placeholder:"Search by creature type",multiple:"",options:e.creatureTypes,"input-id":"creaturetype",taggable:!0},null,8,["modelValue","options"])])]),_:1}),s("div",ke,[s("div",we,[ve,s("div",ge,[p(s("input",{id:"minimumcr","onUpdate:modelValue":t[7]||(t[7]=i=>e.searchOptions.minCr=i),type:"number",min:"0",max:"30",inputmode:"numeric"},null,512),[[S,e.searchOptions.minCr]]),s("div",Se,[s("div",{class:"quantity-button quantity-up","aria-label":"Increase minimum CR",onClick:t[8]||(t[8]=i=>e.changeCR(!0,!0))}," + "),s("div",{class:"quantity-button quantity-down","aria-label":"Decrease maximum CR",onClick:t[9]||(t[9]=i=>e.changeCR(!1,!0))}," - ")])])]),s("div",Be,[Oe,s("div",$e,[p(s("input",{id:"maximumcr","onUpdate:modelValue":t[10]||(t[10]=i=>e.searchOptions.maxCr=i),type:"number",min:"0",max:"30",inputmode:"numeric"},null,512),[[S,e.searchOptions.maxCr]]),s("div",Ee,[s("div",{class:"quantity-button quantity-up","aria-label":"Increase minimum CR",onClick:t[11]||(t[11]=i=>e.changeCR(!0,!1))}," + "),s("div",{class:"quantity-button quantity-down","aria-label":"Decrease maximum CR",onClick:t[12]||(t[12]=i=>e.changeCR(!1,!1))}," - ")])])])]),e.searchOptions.minCr>e.searchOptions.maxCr?(o(),l("span",_e," Min is bigger than max ")):y("",!0),a(m,{title:"Environment",for:"environment"},{default:d(()=>[p(s("input",{id:"environment","onUpdate:modelValue":t[13]||(t[13]=i=>e.searchEnv=i),type:"text",placeholder:"Search by name..."},null,512),[[S,e.searchEnv]])]),_:1}),a(m,{title:"Faction",for:"faction"},{default:d(()=>[p(s("input",{id:"faction","onUpdate:modelValue":t[14]||(t[14]=i=>e.searchFaction=i),type:"text",placeholder:"Search by name..."},null,512),[[S,e.searchFaction]])]),_:1})])]),default:d(()=>[p((o(),l("button",ce,[a(f,{icon:["fas","tag"]})])),[[w,"Filter bestiary"]])]),_:1},8,["positioning-disabled"]),e.isOwner?p((o(),l("button",{key:3,"aria-label":"Import bestiary",onClick:t[15]||(t[15]=i=>e.showImportModal=!0)},[a(f,{icon:["fas","arrow-right-to-bracket"]})])),[[w,"Import bestiary"]]):y("",!0),a(_,{distance:6,"positioning-disabled":e.store.isMobile},{popper:d(()=>[s("div",De,[Fe,p((o(),l("button",{class:"btn confirm",onClick:t[16]||(t[16]=i=>e.exportBestiary(!1))},[k(" Clipboard ")])),[[F]]),p((o(),l("button",{class:"btn confirm",onClick:t[17]||(t[17]=i=>e.exportBestiary(!0))},[k(" File ")])),[[F]])])]),default:d(()=>[p((o(),l("button",Me,[a(f,{icon:["fas","arrow-right-from-bracket"]})])),[[w,"Export bestiary"]])]),_:1},8,["positioning-disabled"])]),_:1},8,["routes"])):y("",!0),s("div",Te,[e.bestiary?(o(),l("div",Ve,[s("div",Ie,[s("div",Ue,[s("h2",null,B(e.bestiary.name?e.bestiary.name:"..."),1),a(W,{class:P(["description",{expanded:e.isExpanded}]),text:e.bestiary.description||"No description set.",tag:"p"},null,8,["class","text"]),e.bestiary.description.length>0?p((o(),l("button",{key:0,class:"expand-btn","aria-label":"Expand description",onClick:t[18]||(t[18]=i=>e.isExpanded=!e.isExpanded)},[k(B(e.isExpanded?"▲":"▼"),1)])),[[w,"Expand description"]]):y("",!0),Le,s("div",{class:P(["footer",{"three-wide":e.isOwner}])},[a(R,{id:e.bestiary.owner},null,8,["id"]),p((o(),l("div",null,[a(z,{icon:e.bestiary.status},null,8,["icon"])])),[[w,e.bestiary.status,void 0,{left:!0}]]),s("div",null,[k(B(e.bestiary.creatures.length),1),a(f,{icon:["fas","skull"]})]),e.isOwner?y("",!0):(o(),l("div",{key:0,role:"button","aria-label":"Toggle bookmark status",class:"bookmark",onClick:t[19]||(t[19]=E((...i)=>e.toggleBookmark&&e.toggleBookmark(...i),["prevent"]))},[e.bookmarked?p((o(),l("span",Re,[a(f,{icon:["fas","star"]})])),[[w,"Unbookmark this bestiary"]]):p((o(),l("span",Ae,[a(f,{icon:["fas","star"]})])),[[w,"Bookmark this bestiary"]])]))],2)]),s("div",qe,[a(re,{name:"slide-fade"},{default:d(()=>[(o(!0),l(U,null,L(e.searchCreatures,i=>(o(),l("div",{key:i._id?.toString(),class:"content-tile creature-tile",onMouseover:D=>e.lastHoveredCreature=i.stats,onClick:D=>e.lastClickedCreature=i.stats},[s("div",Je,[s("h3",null,B(i.stats?.description?.name),1),s("span",null,B(i.stats?.core?.size)+" "+B(i.stats?.core?.race)+B(i.stats?.description?.alignment?`, ${i.stats?.description?.alignment}`:""),1)]),s("div",Pe,[e.isOwner||e.isEditor?(o(),$(_,{key:0,distance:6,"positioning-disabled":e.store.isMobile},{popper:d(()=>[s("div",ze,[He,p((o(),l("button",{class:"btn danger",onClick:E(D=>e.deleteCreature(i),["stop"])},[k(" Confirm ")],8,je)),[[F]])])]),default:d(()=>[p((o(),l("button",{"aria-label":`Delete ${i.stats.description.name}`,onClick:t[20]||(t[20]=E(()=>{},["stop","prevent"]))},[a(f,{icon:["fas","trash"]})],8,We)),[[w,"Delete creature"]])]),_:2},1032,["positioning-disabled"])):y("",!0),p((o(),l("button",{"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} ${i.stats.description.name}`,class:"edit-creature",onClick:E(()=>{},["stop"])},[a(A,{class:"creature",to:`/statblock-editor/${i._id}`,"aria-label":`${e.isOwner||e.isEditor?"Edit":"View"} creature`},{default:d(()=>[e.isOwner||e.isEditor?(o(),$(f,{key:0,icon:["fas","pen-to-square"]})):(o(),$(f,{key:1,icon:["fas","eye"]}))]),_:2},1032,["to","aria-label"])],8,Ge)),[[w,`${e.isOwner||e.isEditor?"Edit":"View"} creature`]]),s("span",Xe," CR "+B(e.crAsString(i.stats.description.cr)),1)])],40,Ne))),128))]),_:1}),e.isOwner||e.isEditor?(o(),l("div",Ke,[e.isOwner||e.isEditor?(o(),$(_,{key:0,distance:6,placement:"top","positioning-disabled":e.store.isMobile},{popper:d(()=>[s("div",Ye,[a(m,{title:"From Scratch",for:"fromScratch"},{default:d(()=>[p((o(),l("button",{id:"fromScratch",class:"btn",onClick:t[21]||(t[21]=E(i=>e.createCreature(),["stop"]))},[k(" From scratch ")])),[[F]])]),_:1}),a(m,{title:"From SRD Creature",for:"fromSrd"},{default:d(()=>[a(g,{options:e.srdCreatures,"input-id":"fromSrd",placeholder:"Select SRD creature",style:{"min-width":"300px"},"onOption:selected":t[22]||(t[22]=i=>e.importSrdCreature(i))},null,8,["options"])]),_:1})])]),default:d(()=>[Qe]),_:1},8,["positioning-disabled"])):y("",!0)])):y("",!0)])]),e.creatures&&e.lastHoveredCreature?(o(),l("div",Ze,[e.lastClickedCreature?(o(),l("span",xe,[s("span",{class:"unpin-button",role:"button","aria-label":"unpin currently pinned creature",onClick:t[23]||(t[23]=i=>e.lastClickedCreature=null)},tt),k("📌 ")])):y("",!0),a(ie,{name:"fade",mode:"out-in"},{default:d(()=>[(o(),$(H,{key:e.lastClickedCreature?.description.name||e.lastHoveredCreature.description.name,data:e.lastClickedCreature||e.lastHoveredCreature},null,8,["data"]))]),_:1})])):(o(),l("div",st,it))])):y("",!0)]),e.bestiary&&e.isOwner?(o(),$(q,{key:1,show:e.showImportModal,onClose:t[28]||(t[28]=i=>e.showImportModal=!1)},{header:d(()=>[k(" Import Creatures ")]),body:d(()=>[a(m,{title:"CritterDB bestiary link",for:"critterlink"},{default:d(()=>[ot,at,s("div",nt,[p(s("input",{id:"critterlink","onUpdate:modelValue":t[24]||(t[24]=i=>e.critterDbId=i),type:"text",placeholder:"CritterDB bestiary link"},null,512),[[S,e.critterDbId]]),s("button",{class:"btn confirm",onClick:t[25]||(t[25]=E((...i)=>e.importBestiaryFromCritterDB&&e.importBestiaryFromCritterDB(...i),["prevent"]))}," Import ")])]),_:1}),lt,a(m,{title:"Bestiary Builder JSON",for:"bestiaryjson"},{default:d(()=>[dt,s("div",ut,[p(s("input",{id:"bestiaryjson","onUpdate:modelValue":t[26]||(t[26]=i=>e.bestiaryBuilderJson=i),type:"text",placeholder:"Bestiary builder JSON"},null,512),[[S,e.bestiaryBuilderJson]]),s("button",{class:"btn confirm",onClick:t[27]||(t[27]=E((...i)=>e.importCreaturesFromBestiaryBuilder&&e.importCreaturesFromBestiaryBuilder(...i),["prevent"]))}," Import ")])]),_:1}),ct,JSON.stringify(e.notices)!=="{}"?(o(),l("div",pt,[ht,(o(!0),l(U,null,L(e.notices,(i,D)=>(o(),l("div",{key:D},[s("h3",null,B(D),1),s("p",null,B(i),1)]))),128))])):y("",!0)]),_:1},8,["show"])):y("",!0),e.bestiary&&e.isOwner?(o(),$(q,{key:2,show:e.showEditorModal,onClose:t[36]||(t[36]=i=>e.showEditorModal=!1)},{header:d(()=>[k(" Edit Bestiary ")]),body:d(()=>[a(m,{title:"Bestiary name",for:"bestiaryname"},{default:d(()=>[p(s("input",{id:"bestiaryname","onUpdate:modelValue":t[29]||(t[29]=i=>e.bestiary.name=i),type:"text",minlength:e.store.limits?.nameMin,maxlength:e.store.limits?.nameLength},null,8,mt),[[S,e.bestiary.name]])]),_:1}),a(m,{title:"Description",for:"description"},{default:d(()=>[bt,p(s("textarea",{id:"description","onUpdate:modelValue":t[30]||(t[30]=i=>e.bestiary.description=i),maxlength:e.store.limits?.descriptionLength},null,8,yt),[[S,e.bestiary.description]])]),_:1}),e.isOwner?(o(),l("div",ft,[a(m,{title:"Status",for:"status"},{default:d(()=>[a(g,{modelValue:e.bestiary.status,"onUpdate:modelValue":t[31]||(t[31]=i=>e.bestiary.status=i),options:["public","unlisted","private"],"input-id":"status"},null,8,["modelValue"])]),_:1}),a(m,{title:"Tags",for:"tags"},{default:d(()=>[a(g,{modelValue:e.bestiary.tags,"onUpdate:modelValue":t[32]||(t[32]=i=>e.bestiary.tags=i),placeholder:"Select Tags",multiple:"",options:e.store.tags,"input-id":"tags"},null,8,["modelValue","options"])]),_:1})])):y("",!0),s("div",Ct,[kt,e.isOwner?(o(),l("p",wt," Editors can add, edit, and remove creatures. They can edit the name of the bestiary and its description. Editors cannot change the status of the bestiary or delete the bestiary. Editors cannot add other editors. The owner can remove editors at any time. ")):y("",!0),s("div",vt,[(o(!0),l(U,null,L(e.editors,i=>(o(),l("div",{key:i._id,class:"editor-list"},[s("p",null,[a(R,{id:i._id},null,8,["id"]),e.isOwner?(o(),l("span",{key:0,role:"button",class:"delete-creature",onClick:D=>e.removeEditor(i._id)},Bt,8,gt)):y("",!0)])]))),128))]),a(m,{title:"Add editor",for:"addeditor"},{default:d(()=>[s("div",Ot,[p(s("input",{id:"addeditor","onUpdate:modelValue":t[33]||(t[33]=i=>e.editorToAdd=i),type:"text",inputmode:"numeric",placeholder:"Discord user ID"},null,512),[[S,e.editorToAdd]]),s("button",{class:"btn",onClick:t[34]||(t[34]=i=>e.addEditor())}," Add ")])]),_:1})]),e.showWarning?(o(),l("p",$t,[k(" By changing the bestiary status to public I confirm that I am the copyright holder of the content within, or that I have permission from the copyright holder to share this content. I hereby agree to the "),a(A,{to:"../content-policy"},{default:d(()=>[k(" Content Policy ")]),_:1}),k(" and agree to be fully liable for the content within. I affirm that the content does not include any official non-free D&D content. Bestiaries that breach these terms may have their status changed to private or be outright removed, and may result in a ban if the content breaches our content policy. ")])):y("",!0)]),footer:d(()=>[s("button",{class:"btn confirm",onClick:t[35]||(t[35]=E((...i)=>e.updateBestiary&&e.updateBestiary(...i),["prevent"]))}," Save changes ")]),_:1},8,["show"])):y("",!0)])}const Rt=te(le,[["render",Et],["__scopeId","data-v-89e782bb"]]);export{Rt as default};
