import{d as D,C as y,h as I,i as L,o as t,j as o,k as i,w as h,F as N,D as S,c as V,m as a,t as c,u as d,x as u,z as m,E as f,l as v,p as T,n as U,R as $,T as b,_ as j}from"./index-Bd-vmtCs.js";import{S as z,U as E}from"./StatusIcon-CkHbsmfP.js";const F={class:"tile-container"},M={class:"tile-header"},R={key:0,class:"shared-notice"},G=["src"],O={class:"tags"},q={class:"description"},x={class:"tile-footer"},A={key:0},H=["onClick"],J={key:2},K=D({__name:"BestiaryList",props:{personal:{type:Boolean},bestiaries:{}},emits:["deleteBestiary"],setup(k,{emit:g}){const B=k,w=g,C=s=>{s&&w("deleteBestiary",s)},p=y(()=>{const s=[];for(const r of B.bestiaries){const n=r.description.match(/!\[.*?\]\((.*?)\)/),l=(n||[])[1];n&&(r.description=r.description.replace(n[0],"")),s.push(l)}return s});return(s,r)=>{const n=I("font-awesome-icon"),l=L("tooltip");return t(),o("div",F,[i(b,{name:"popin"},{default:h(()=>[(t(!0),o(N,null,S(s.bestiaries,(e,_)=>(t(),V(d($),{key:e._id?.toString(),class:f(["content-tile bestiary-tile",{"four-tall":e.owner!==d(u).user?._id}]),to:`/bestiary-viewer/${e._id}`,"aria-label":`Open Bestiary ${e.name}`},{default:h(()=>[a("div",M,[a("h2",null,c(e.name),1)]),e.owner!==d(u).user?._id&&s.personal?(t(),o("span",R,"(shared)")):m("",!0),a("div",{class:f(["tile-content",{"tile-has-image":p.value[_]}])},[p.value[_]?(t(),o("img",{key:0,class:"tile-image",src:p.value[_]},null,8,G)):m("",!0),a("div",O,c(e.tags.join(", ")),1),a("p",q,c(e.description),1)],2),a("div",x,[s.personal?v((t(),o("span",A,[i(z,{icon:e.status},null,8,["icon"])])),[[l,e.status,void 0,{left:!0}]]):m("",!0),s.personal&&e.owner===d(u).user?._id?v((t(),o("span",{key:1,role:"button",class:"edit-button","aria-label":"Delete bestiary",onClick:T(P=>C(e),["stop","prevent"])},[i(n,{icon:["fas","trash"]})],8,H)),[[l,"Delete bestiary"]]):(t(),o("span",J,[i(E,{id:e.owner},null,8,["id"])])),a("span",null,[U(c(e.creatures.length),1),i(n,{icon:["fas","skull"]})])])]),_:2},1032,["to","class","aria-label"]))),128))]),_:1})])}}}),X=j(K,[["__scopeId","data-v-2531b345"]]);export{X as B};