import{L as h}from"./loading-CxbkCboc.js";import{e as v,y as k,f as y,g,K as B,M as S,o as s,c as a,d as w,t as c,l as o,N as d,k as _,b as N,i as I,_ as m,r as U,A as i,F as V}from"./index-C0IYYRGw.js";const $={class:"container"},b={key:0,class:"user"},C=["src"],D={key:0},F={key:1,class:"supporter-tier-1"},L={key:2,class:"supporter-tier-2"},T={key:1,class:"user"},x=v({__name:"UserBanner",props:{id:{}},setup(u){const r=u,e=k(null);y(async()=>{const{success:p,data:n}=await g(`/api/user/${r.id}`);p?e.value=n:e.value=null});const t=B(()=>e.value==null);return(p,n)=>{const l=S("tooltip");return s(),a("div",$,[e.value?(s(),a("div",b,[w("img",{class:"img",alt:"",src:e.value.avatar?`https://cdn.discordapp.com/avatars/${e.value._id}/${e.value.avatar}.png`:"https://cdn.discordapp.com/embed/avatars/0.png"},null,8,C),e.value.supporter?o("",!0):(s(),a("span",D,c(e.value.username),1)),e.value.supporter===1?d((s(),a("span",F,[_(c(e.value.username),1)])),[[l,"This user is a Wyrmling Patreon Supporter!"]]):o("",!0),e.value.supporter===2?d((s(),a("span",L,[_(c(e.value.username),1)])),[[l,"This user is a Greatwyrm Patreon Supporter!"]]):o("",!0)])):(s(),a("div",T,[N(I(h),{active:t.value,"onUpdate:active":n[0]||(n[0]=f=>t.value=f),"is-full-page":!1,color:"orangered",opacity:0},null,8,["active"])]))])}}}),E=m(x,[["__scopeId","data-v-4ec7dfc6"]]),M=v({__name:"StatusIcon",props:{icon:{}},setup(u){return(r,e)=>{const t=U("font-awesome-icon");return s(),a(V,null,[r.icon==="public"?(s(),i(t,{key:0,icon:["fas","earth-europe"]})):o("",!0),r.icon==="unlisted"?(s(),i(t,{key:1,icon:["fas","link"]})):o("",!0),r.icon==="private"?(s(),i(t,{key:2,icon:["fas","lock"]})):o("",!0)],64)}}}),G=m(M,[["__scopeId","data-v-4fa7a626"]]);export{G as S,E as U};
