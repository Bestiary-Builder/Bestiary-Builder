import{e as $,f as L,y as c,Q as N,g as V,R as y,r as w,I as U,o as t,c as s,b as u,z as v,J as d,O as z,d as a,i as x,s as D,M as A,A as O,k as I,t as C,l as R,F as E,p as J,m as Q,_ as Y}from"./index-BdUdCvUp.js";import{B as j}from"./BestiaryList-BDRftbVT.js";import{t as M,_ as q}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-BWSI63Gr.js";import{$ as B}from"./loading-bQallgre.js";import"./StatusIcon-D0CFIR9q.js";const b=h=>(J("data-v-554b025c"),h=h(),Q(),h),G=b(()=>a("option",null,"Recent",-1)),H=b(()=>a("option",null,"Popular",-1)),K=b(()=>a("option",null,"Bookmarked",-1)),W=[G,H,K],X={"aria-label":"Filter bestiaries"},Z={class:"v-popper__custom-menu"},ee=b(()=>a("span",null,[a("label",{for:"tagsInput"},"Filter by tags")],-1)),ae={"aria-label":"Search bestiaries"},te={class:"v-popper__custom-menu"},se=b(()=>a("span",null,[a("label",{for:"searchinput"}," Search bestiaries by name or description")],-1)),oe={class:"content"},ie={key:1,class:"zero-found"},ne={key:0},le={key:1},re={key:0,class:"page-nav__container"},ce=$({__name:"PublicBestiaryList",setup(h){L(async()=>{const o=B.show();await m(),o.hide()});const i=c([]),n=c(1),f=c([]),p=c("Popular"),g=c(""),P=N(g,600),_=c(1),m=async()=>{const{success:o,data:e,error:r}=await V("/api/search","POST",{search:g.value,page:n.value-1,tags:f.value,mode:p.value.toLowerCase()});o?(i.value=e.results,_.value=e.pageAmount):(i.value=[],_.value=1,M.error(r))},F=async()=>{const{success:o,data:e,error:r}=await V("/api/user/bookmarks");o?i.value=e:(i.value=[],M.error(r))};return y(n,()=>m()),y(f,()=>m()),y(p,async o=>{if(o!=="Bookmarked"){const e=B.show();await m(),e.hide()}else{const e=B.show();await F(),e.hide()}}),y(P,()=>m()),(o,e)=>{const r=w("font-awesome-icon"),T=w("v-select"),S=w("VDropdown"),k=U("tooltip");return t(),s(E,null,[u(q,{routes:[{path:"",text:"Public Bestiaries",isCurrent:!0}]},{default:v(()=>[d(a("select",{"onUpdate:modelValue":e[0]||(e[0]=l=>p.value=l),"aria-label":"Select public bestiary list mode",name:"Select public bestiary list mode"},W,512),[[z,p.value]]),u(S,{distance:6,"positioning-disabled":!1},{popper:v(()=>[a("div",Z,[ee,u(T,{modelValue:f.value,"onUpdate:modelValue":e[1]||(e[1]=l=>f.value=l),placeholder:"Select Tags",multiple:"",options:x(D).tags,"input-id":"tagsInput"},null,8,["modelValue","options"])])]),default:v(()=>[d((t(),s("button",X,[u(r,{icon:["fas","tag"]})])),[[k,"Filter bestiaries"]])]),_:1}),u(S,{distance:6,"positioning-disabled":x(D).isMobile},{popper:v(()=>[a("div",te,[se,d(a("input",{id:"searchinput","onUpdate:modelValue":e[2]||(e[2]=l=>g.value=l),type:"text",placeholder:"Search by bestiary name or description"},null,512),[[A,g.value]])])]),default:v(()=>[d((t(),s("button",ae,[u(r,{icon:["fas","magnifying-glass"]})])),[[k,"Search bestiaries"]])]),_:1},8,["positioning-disabled"])]),_:1}),a("div",oe,[i.value&&i.value.length>0?(t(),O(j,{key:0,personal:!1,bestiaries:i.value},null,8,["bestiaries"])):(t(),s("div",ie,[p.value!=="Bookmarked"?(t(),s("span",ne," Did not find any Bestiaries with that name or tags.")):(t(),s("span",le,"You do not have any bookmarked bestiaries. View a Bestiary and click on the ⭐ icon to bookmark it."))]))]),_.value>1?(t(),s("div",re,[d((t(),s("button",{"aria-label":"Decrease page number",onClick:e[3]||(e[3]=l=>n.value=Math.max(1,n.value-1))},[I(" - ")])),[[k,"Decrease page number"]]),a("span",null,C(n.value)+"/"+C(_.value),1),d((t(),s("button",{"aria-label":"Increase page number",onClick:e[4]||(e[4]=l=>n.value=Math.min(_.value,n.value+1))},[I(" + ")])),[[k,"Increase page number"]])])):R("",!0)],64)}}}),ve=Y(ce,[["__scopeId","data-v-554b025c"]]);export{ve as default};