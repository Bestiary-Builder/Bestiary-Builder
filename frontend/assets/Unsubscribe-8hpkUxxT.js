import{d as l,f as r,g as u,o as t,j as a,k as i,l as c,t as _,B as d,F as m,_ as f}from"./index-s8_WzPNw.js";import{$ as p}from"./loading-8atZ4P8l.js";import{_ as b}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-B464TyWA.js";const h={class:"content less-wide center"},v={key:0},g={key:1},k=l({__name:"Unsubscribe",setup(x){const s=r(0),o=r(""),n=p.show();return u("/api/unsubscribe").then(e=>{console.log(e),e.success?s.value=1:(s.value=2,o.value=e.error),n.hide()}).catch(e=>{console.error(e),s.value=2,o.value=e}),(e,y)=>(t(),a(m,null,[i(b,{routes:[{path:"",text:"Unsubscribe from emails",isCurrent:!0}],"is-less-wide":!0}),c("div",h,[c("div",null,[s.value==1?(t(),a("h3",v," Succesfully unsubscribed from all future emails. ")):s.value==2?(t(),a("h3",g," Failed to unsubscribe from emails: "+_(o.value),1)):d("",!0)])])],64))}}),C=f(k,[["__scopeId","data-v-4db1237e"]]);export{C as default};
