import{a as y,e as g,q as c,aZ as k,a_ as v,a$ as B,r as l,L as C,o as e,c as s,d as u,F as S,S as w,x as L,v as x,g as N,t as d,h as V,y as $,M as D,b as E,O as z,b0 as F}from"./index-Qg_Jh5vw.js";const P=y.config.globalProperties.$toast,R={class:"breadcrumbs__links","aria-label":"Breadcrumbs"},T={key:1,class:"current-page","aria-current":"page"},W={key:2,class:"seperator"},q={class:"right-buttons"},Z=g({__name:"Breadcrumbs",props:{routes:{},isLessWide:{type:Boolean,default:!1}},setup(H){const r=c({title:"Bestiary Builder",text:"Check my creation out on Bestiary Builder!",url:F?location.href:""}),{share:p,isSupported:o}=k(r);async function h(){if(o&&o.value)return p().catch(t=>t);await navigator.clipboard.writeText(r.value.url),P.success("Copied link to clipboard!")}const n=c(null),{height:_}=v(n);return B(()=>{document.body.style.setProperty("--breadcrumbs-height",`${_.value}px`)}),(t,M)=>{const m=l("RouterLink"),b=l("font-awesome-icon"),f=C("tooltip");return e(),s("nav",{id:"breadcrumb",ref_key:"breadcrumbs",ref:n,class:z(["breadcrumbs__container",{"less-wide":t.isLessWide}]),"aria-label":"Header"},[u("ol",R,[(e(!0),s(S,null,w(t.routes,(a,i)=>(e(),s("li",{key:i},[a.isCurrent?(e(),s("h1",T,d(a.text),1)):(e(),L(m,{key:0,to:a.path},{default:x(()=>[N(d(a.text),1)]),_:2},1032,["to"])),i+1!==t.routes.length?(e(),s("span",W," >")):V("",!0)]))),128))]),u("div",q,[$(t.$slots,"default"),D((e(),s("button",{"aria-label":"Share this page",onClick:h},[E(b,{icon:["fas","share-nodes"]})])),[[f,"Share this page!"]])])],2)}}});export{Z as _,P as t};
