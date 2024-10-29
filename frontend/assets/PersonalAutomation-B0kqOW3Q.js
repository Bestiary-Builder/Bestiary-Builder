import{d as M,f as v,e as C,g as A,D as V,E as B,h as T,i as U,o as i,j as r,k as m,w as c,l as _,m as a,F as x,B as F,C as H,t as P,y as $,u as D,x as O,c as J,z,G as R,n as j,_ as G}from"./index-BnguSVmB.js";import{t as u,_ as Y}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-D1kcEJMB.js";import{L as g}from"./LabelledComponent-B9SZKuiR.js";import{A as q}from"./AutomationEditor-NZe8XsSg.js";import{_ as K}from"./Modal.vue_vue_type_style_index_0_lang-By_BwBhp.js";import{$ as S}from"./loading-CBYs1_jt.js";import"./Markdown.vue_vue_type_script_setup_true_lang-KRE3SOwo.js";import"./markdownItAnchor-VSsJ9PWr.js";const Q={class:"content"},W={class:"wrapper"},X={class:"left"},Z={key:0},tt=["onClick"],et=["aria-label"],ot={key:1},at=["minlength","maxlength"],nt={class:"automation-editor"},st={key:1,class:"no-selected"},it={class:"two-wide"},lt=M({__name:"PersonalAutomation",setup(rt){const n=v([]);let d="";C(async()=>{const e=S.show();await b(),d=JSON.stringify(n.value),e.hide()});const l=v(null),p=v("New Automation"),N=async(e,t=null,s=!0)=>{if(e==="New Automation"){u.warning("Automation must have a non-default name!");return}const f=S.show(),{success:o,error:y}=await A("/api/automation/add","POST",{name:e,automation:t});o?(await b(),p.value="New Automation",s&&u.success(`Successfully added automation: ${e}`),l.value=n.value[n.value.length-1]):u.error(y),f.hide()},L=async e=>{const t=S.show(),{success:s,error:f}=await A(`/api/automation/${e.toString()}/delete`);s?(u.success("Successfully deleted the automation!"),await b(),l.value=null):u.error(f),t.hide()},b=async()=>{const{success:e,data:t,error:s}=await A("/api/my-automations");e?n.value=t:u.error(s),d=JSON.stringify(n.value)},I=async()=>{await navigator.clipboard.writeText(JSON.stringify(n.value.map(e=>e.automation))),u.success("Copied all automation to clipboard!")},w=v(!1),h=v(""),E=async()=>{const e=JSON.parse(h.value);for(const t of e){let s;t!=null&&(Array.isArray(t)?s=t[0].name.replace(" (1H)","").replace(" (2H)",""):s=t.name,await N(s,t,!1))}u.info("Done importing automation!"),w.value=!1};V(()=>{if(d!==JSON.stringify(n.value)&&!window.confirm("Do you really want to leave? you have unsaved changes!"))return!1});const k=e=>{d!==JSON.stringify(n.value)&&(window.confirm("Do you really want to leave? you have unsaved changes!"),e.preventDefault(),e.returnValue=!0)};return C(()=>{window.addEventListener("beforeunload",k)}),B(()=>{window.removeEventListener("beforeunload",k)}),(e,t)=>{const s=T("font-awesome-icon"),f=U("tooltip");return i(),r(x,null,[m(Y,{routes:[{path:"",text:"My Automation",isCurrent:!0}]},{default:c(()=>[_((i(),r("button",{"aria-label":"Import a list of automation",onClick:t[0]||(t[0]=o=>w.value=!0)},[m(s,{icon:["fas","arrow-right-to-bracket"]})])),[[f,"Import a list of automation"]]),_((i(),r("button",{"aria-label":"Export all automations to your clipboard",onClick:t[1]||(t[1]=o=>I())},[m(s,{icon:["fas","arrow-right-from-bracket"]})])),[[f,"Export all automations to your clipboard"]])]),_:1}),a("div",Q,[a("div",W,[a("div",X,[m(g,{title:"List"},{default:c(()=>[n.value&&n.value.length>0?(i(),r("ol",Z,[(i(!0),r(x,null,F(n.value,(o,y)=>(i(),r("li",{key:y,class:H(["feature-button__container",{selected:o._id===l.value?._id}]),onClick:ut=>l.value=o},[a("p",{role:"button","aria-label":`Select automation: ${o.name} (${y})`},P(o.name||"Unnamed feature"),9,et)],10,tt))),128))])):(i(),r("p",ot," You do not have any personal automations. "))]),_:1}),m(g,{title:"Add new automation",for:"addnewautomation"},{default:c(()=>[_(a("input",{id:"addnewautomation","onUpdate:modelValue":t[2]||(t[2]=o=>p.value=o),type:"text",minlength:D(O).limits?.nameMin,maxlength:D(O).limits?.nameLength},null,8,at),[[$,p.value]]),a("button",{class:"btn confirm",onClick:t[3]||(t[3]=o=>N(p.value))}," Add ")]),_:1}),l.value?(i(),J(g,{key:0,title:"Delete automation"},{default:c(()=>[a("button",{class:"btn danger",onClick:t[4]||(t[4]=o=>L(l.value._id))}," Delete current automation ")]),_:1})):z("",!0)]),t[8]||(t[8]=a("hr",null,null,-1)),a("div",nt,[l.value?(i(),J(q,{key:l.value?._id.toString(),data:l.value,"is-stand-alone":!0,onSavedStandaloneData:t[5]||(t[5]=o=>R(d)?d.value=JSON.stringify(n.value):d=JSON.stringify(n.value))},null,8,["data"])):(i(),r("div",st," Select an automation to get started with editing it. "))])])]),m(K,{show:w.value,onClose:t[7]||(t[7]=o=>w.value=!1)},{header:c(()=>t[9]||(t[9]=[j(" Import Automation ")])),body:c(()=>[m(g,{title:"List of automation",for:"listInput"},{default:c(()=>[t[10]||(t[10]=a("p",null,"Insert a list of automation in JSON format.",-1)),a("div",it,[_(a("input",{id:"listInput","onUpdate:modelValue":t[6]||(t[6]=o=>h.value=o),type:"text",placeholder:"JSON"},null,512),[[$,h.value]]),a("button",{class:"btn confirm",onClick:E}," Import ")])]),_:1}),t[11]||(t[11]=a("hr",null,null,-1))]),_:1},8,["show"])],64)}}}),_t=G(lt,[["__scopeId","data-v-c923c6e6"]]);export{_t as default};