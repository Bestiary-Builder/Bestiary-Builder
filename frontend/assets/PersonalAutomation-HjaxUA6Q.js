import{e as B,y as p,f as $,g as S,V as P,W as T,r as U,I as F,o as i,c as r,b as m,z as c,J as h,d as a,F as I,P as H,L as z,t as R,M as D,i as O,s as J,A as L,l as W,X,k as Y,p as j,m as q,_ as G}from"./index-1bnClbhY.js";import{t as u,_ as K}from"./Breadcrumbs.vue_vue_type_style_index_0_lang-DlWDQZ_c.js";import{L as g}from"./LabelledComponent-CBAqSfDf.js";import{A as Q}from"./AutomationEditor-CbRtrSJw.js";import{_ as Z}from"./Modal.vue_vue_type_style_index_0_lang-B3MGxOCt.js";import{$ as N}from"./loading-CANgdF-m.js";import"./Markdown.vue_vue_type_script_setup_true_lang-CLG0s3IX.js";import"./markdownItAnchor-VSsJ9PWr.js";const k=v=>(j("data-v-c923c6e6"),v=v(),q(),v),tt={class:"content"},et={class:"wrapper"},ot={class:"left"},at={key:0},nt=["onClick"],st=["aria-label"],it={key:1},lt=["minlength","maxlength"],rt=k(()=>a("hr",null,null,-1)),ut={class:"automation-editor"},dt={key:1,class:"no-selected"},mt=k(()=>a("p",null,"Insert a list of automation in JSON format.",-1)),ct={class:"two-wide"},ft=k(()=>a("hr",null,null,-1)),pt=B({__name:"PersonalAutomation",setup(v){const n=p([]);let d="";$(async()=>{const e=N.show();await b(),d=JSON.stringify(n.value),e.hide()});const l=p(null),_=p("New Automation"),C=async(e,t=null,s=!0)=>{if(e==="New Automation"){u.warning("Automation must have a non-default name!");return}const f=N.show(),{success:o,error:y}=await S("/api/automation/add","POST",{name:e,automation:t});o?(await b(),_.value="New Automation",s&&u.success(`Successfully added automation: ${e}`),l.value=n.value[n.value.length-1]):u.error(y),f.hide()},M=async e=>{const t=N.show(),{success:s,error:f}=await S(`/api/automation/${e.toString()}/delete`);s?(u.success("Successfully deleted the automation!"),await b(),l.value=null):u.error(f),t.hide()},b=async()=>{const{success:e,data:t,error:s}=await S("/api/my-automations");e?n.value=t:u.error(s),d=JSON.stringify(n.value)},V=async()=>{await navigator.clipboard.writeText(JSON.stringify(n.value.map(e=>e.automation))),u.success("Copied all automation to clipboard!")},w=p(!1),A=p(""),E=async()=>{const e=JSON.parse(A.value);for(const t of e){let s;t!=null&&(Array.isArray(t)?s=t[0].name.replace(" (1H)","").replace(" (2H)",""):s=t.name,await C(s,t,!1))}u.info("Done importing automation!"),w.value=!1};P(()=>{if(d!==JSON.stringify(n.value)&&!window.confirm("Do you really want to leave? you have unsaved changes!"))return!1});const x=e=>{d!==JSON.stringify(n.value)&&(window.confirm("Do you really want to leave? you have unsaved changes!"),e.preventDefault(),e.returnValue=!0)};return $(()=>{window.addEventListener("beforeunload",x)}),T(()=>{window.removeEventListener("beforeunload",x)}),(e,t)=>{const s=U("font-awesome-icon"),f=F("tooltip");return i(),r(I,null,[m(K,{routes:[{path:"",text:"My Automation",isCurrent:!0}]},{default:c(()=>[h((i(),r("button",{"aria-label":"Import a list of automation",onClick:t[0]||(t[0]=o=>w.value=!0)},[m(s,{icon:["fas","arrow-right-to-bracket"]})])),[[f,"Import a list of automation"]]),h((i(),r("button",{"aria-label":"Export all automations to your clipboard",onClick:t[1]||(t[1]=o=>V())},[m(s,{icon:["fas","arrow-right-from-bracket"]})])),[[f,"Export all automations to your clipboard"]])]),_:1}),a("div",tt,[a("div",et,[a("div",ot,[m(g,{title:"List"},{default:c(()=>[n.value&&n.value.length>0?(i(),r("ol",at,[(i(!0),r(I,null,H(n.value,(o,y)=>(i(),r("li",{key:y,class:z(["feature-button__container",{selected:o._id===l.value?._id}]),onClick:vt=>l.value=o},[a("p",{role:"button","aria-label":`Select automation: ${o.name} (${y})`},R(o.name||"Unnamed feature"),9,st)],10,nt))),128))])):(i(),r("p",it," You do not have any personal automations. "))]),_:1}),m(g,{title:"Add new automation",for:"addnewautomation"},{default:c(()=>[h(a("input",{id:"addnewautomation","onUpdate:modelValue":t[2]||(t[2]=o=>_.value=o),type:"text",minlength:O(J).limits?.nameMin,maxlength:O(J).limits?.nameLength},null,8,lt),[[D,_.value]]),a("button",{class:"btn confirm",onClick:t[3]||(t[3]=o=>C(_.value))}," Add ")]),_:1}),l.value?(i(),L(g,{key:0,title:"Delete automation"},{default:c(()=>[a("button",{class:"btn danger",onClick:t[4]||(t[4]=o=>M(l.value._id))}," Delete current automation ")]),_:1})):W("",!0)]),rt,a("div",ut,[l.value?(i(),L(Q,{key:l.value?._id.toString(),data:l.value,"is-stand-alone":!0,onSavedStandaloneData:t[5]||(t[5]=o=>X(d)?d.value=JSON.stringify(n.value):d=JSON.stringify(n.value))},null,8,["data"])):(i(),r("div",dt," Select an automation to get started with editing it. "))])])]),m(Z,{show:w.value,onClose:t[7]||(t[7]=o=>w.value=!1)},{header:c(()=>[Y(" Import Automation ")]),body:c(()=>[m(g,{title:"List of automation",for:"listInput"},{default:c(()=>[mt,a("div",ct,[h(a("input",{id:"listInput","onUpdate:modelValue":t[6]||(t[6]=o=>A.value=o),type:"text",placeholder:"JSON"},null,512),[[D,A.value]]),a("button",{class:"btn confirm",onClick:E}," Import ")])]),_:1}),ft]),_:1},8,["show"])],64)}}}),Nt=G(pt,[["__scopeId","data-v-c923c6e6"]]);export{Nt as default};