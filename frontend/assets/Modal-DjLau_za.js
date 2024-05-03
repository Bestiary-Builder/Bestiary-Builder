import{k as Y,S as fe,a2 as Ne,a3 as Te,d as Fe,X as re,_ as Ee,r as Se,o as ke,z as De,a as ne,l as Re,A as Ce,B as Pe,b as k,C as ie,w as Ie,a0 as V,$ as Ae,a4 as Oe}from"./index-CCTs9utp.js";/*!
* tabbable 6.2.0
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/var ve=["input:not([inert])","select:not([inert])","textarea:not([inert])","a[href]:not([inert])","button:not([inert])","[tabindex]:not(slot):not([inert])","audio[controls]:not([inert])","video[controls]:not([inert])",'[contenteditable]:not([contenteditable="false"]):not([inert])',"details>summary:first-of-type:not([inert])","details:not([inert])"],$=ve.join(","),be=typeof Element>"u",R=be?function(){}:Element.prototype.matches||Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector,j=!be&&Element.prototype.getRootNode?function(o){var e;return o==null||(e=o.getRootNode)===null||e===void 0?void 0:e.call(o)}:function(o){return o?.ownerDocument},M=function o(e,t){var a;t===void 0&&(t=!0);var u=e==null||(a=e.getAttribute)===null||a===void 0?void 0:a.call(e,"inert"),s=u===""||u==="true",r=s||t&&e&&o(e.parentNode);return r},Be=function(e){var t,a=e==null||(t=e.getAttribute)===null||t===void 0?void 0:t.call(e,"contenteditable");return a===""||a==="true"},he=function(e,t,a){if(M(e))return[];var u=Array.prototype.slice.apply(e.querySelectorAll($));return t&&R.call(e,$)&&u.unshift(e),u=u.filter(a),u},pe=function o(e,t,a){for(var u=[],s=Array.from(e);s.length;){var r=s.shift();if(!M(r,!1))if(r.tagName==="SLOT"){var c=r.assignedElements(),d=c.length?c:r.children,p=o(d,!0,a);a.flatten?u.push.apply(u,p):u.push({scopeParent:r,candidates:p})}else{var N=R.call(r,$);N&&a.filter(r)&&(t||!e.includes(r))&&u.push(r);var m=r.shadowRoot||typeof a.getShadowRoot=="function"&&a.getShadowRoot(r),F=!M(m,!1)&&(!a.shadowRootFilter||a.shadowRootFilter(r));if(m&&F){var x=o(m===!0?r.children:m.children,!0,a);a.flatten?u.push.apply(u,x):u.push({scopeParent:r,candidates:x})}else s.unshift.apply(s,r.children)}}return u},me=function(e){return!isNaN(parseInt(e.getAttribute("tabindex"),10))},D=function(e){if(!e)throw new Error("No node provided");return e.tabIndex<0&&(/^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName)||Be(e))&&!me(e)?0:e.tabIndex},xe=function(e,t){var a=D(e);return a<0&&t&&!me(e)?0:a},Le=function(e,t){return e.tabIndex===t.tabIndex?e.documentOrder-t.documentOrder:e.tabIndex-t.tabIndex},ge=function(e){return e.tagName==="INPUT"},Ke=function(e){return ge(e)&&e.type==="hidden"},$e=function(e){var t=e.tagName==="DETAILS"&&Array.prototype.slice.apply(e.children).some(function(a){return a.tagName==="SUMMARY"});return t},je=function(e,t){for(var a=0;a<e.length;a++)if(e[a].checked&&e[a].form===t)return e[a]},Me=function(e){if(!e.name)return!0;var t=e.form||j(e),a=function(c){return t.querySelectorAll('input[type="radio"][name="'+c+'"]')},u;if(typeof window<"u"&&typeof window.CSS<"u"&&typeof window.CSS.escape=="function")u=a(window.CSS.escape(e.name));else try{u=a(e.name)}catch(r){return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s",r.message),!1}var s=je(u,e.form);return!s||s===e},Ge=function(e){return ge(e)&&e.type==="radio"},Ue=function(e){return Ge(e)&&!Me(e)},qe=function(e){var t,a=e&&j(e),u=(t=a)===null||t===void 0?void 0:t.host,s=!1;if(a&&a!==e){var r,c,d;for(s=!!((r=u)!==null&&r!==void 0&&(c=r.ownerDocument)!==null&&c!==void 0&&c.contains(u)||e!=null&&(d=e.ownerDocument)!==null&&d!==void 0&&d.contains(e));!s&&u;){var p,N,m;a=j(u),u=(p=a)===null||p===void 0?void 0:p.host,s=!!((N=u)!==null&&N!==void 0&&(m=N.ownerDocument)!==null&&m!==void 0&&m.contains(u))}}return s},oe=function(e){var t=e.getBoundingClientRect(),a=t.width,u=t.height;return a===0&&u===0},_e=function(e,t){var a=t.displayCheck,u=t.getShadowRoot;if(getComputedStyle(e).visibility==="hidden")return!0;var s=R.call(e,"details>summary:first-of-type"),r=s?e.parentElement:e;if(R.call(r,"details:not([open]) *"))return!0;if(!a||a==="full"||a==="legacy-full"){if(typeof u=="function"){for(var c=e;e;){var d=e.parentElement,p=j(e);if(d&&!d.shadowRoot&&u(d)===!0)return oe(e);e.assignedSlot?e=e.assignedSlot:!d&&p!==e.ownerDocument?e=p.host:e=d}e=c}if(qe(e))return!e.getClientRects().length;if(a!=="legacy-full")return!0}else if(a==="non-zero-area")return oe(e);return!1},Ve=function(e){if(/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))for(var t=e.parentElement;t;){if(t.tagName==="FIELDSET"&&t.disabled){for(var a=0;a<t.children.length;a++){var u=t.children.item(a);if(u.tagName==="LEGEND")return R.call(t,"fieldset[disabled] *")?!0:!u.contains(e)}return!0}t=t.parentElement}return!1},G=function(e,t){return!(t.disabled||M(t)||Ke(t)||_e(t,e)||$e(t)||Ve(t))},W=function(e,t){return!(Ue(t)||D(t)<0||!G(e,t))},ze=function(e){var t=parseInt(e.getAttribute("tabindex"),10);return!!(isNaN(t)||t>=0)},Ye=function o(e){var t=[],a=[];return e.forEach(function(u,s){var r=!!u.scopeParent,c=r?u.scopeParent:u,d=xe(c,r),p=r?o(u.candidates):c;d===0?r?t.push.apply(t,p):t.push(c):a.push({documentOrder:s,tabIndex:d,item:u,isScope:r,content:p})}),a.sort(Le).reduce(function(u,s){return s.isScope?u.push.apply(u,s.content):u.push(s.content),u},[]).concat(t)},We=function(e,t){t=t||{};var a;return t.getShadowRoot?a=pe([e],t.includeContainer,{filter:W.bind(null,t),flatten:!1,getShadowRoot:t.getShadowRoot,shadowRootFilter:ze}):a=he(e,t.includeContainer,W.bind(null,t)),Ye(a)},Xe=function(e,t){t=t||{};var a;return t.getShadowRoot?a=pe([e],t.includeContainer,{filter:G.bind(null,t),flatten:!0,getShadowRoot:t.getShadowRoot}):a=he(e,t.includeContainer,G.bind(null,t)),a},C=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return R.call(e,$)===!1?!1:W(t,e)},Ze=ve.concat("iframe").join(","),z=function(e,t){if(t=t||{},!e)throw new Error("No node provided");return R.call(e,Ze)===!1?!1:G(t,e)};/*!
* focus-trap 7.5.4
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/function ue(o,e){var t=Object.keys(o);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(o);e&&(a=a.filter(function(u){return Object.getOwnPropertyDescriptor(o,u).enumerable})),t.push.apply(t,a)}return t}function se(o){for(var e=1;e<arguments.length;e++){var t=arguments[e]!=null?arguments[e]:{};e%2?ue(Object(t),!0).forEach(function(a){Je(o,a,t[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(o,Object.getOwnPropertyDescriptors(t)):ue(Object(t)).forEach(function(a){Object.defineProperty(o,a,Object.getOwnPropertyDescriptor(t,a))})}return o}function Je(o,e,t){return e=He(e),e in o?Object.defineProperty(o,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):o[e]=t,o}function Qe(o,e){if(typeof o!="object"||o===null)return o;var t=o[Symbol.toPrimitive];if(t!==void 0){var a=t.call(o,e||"default");if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(e==="string"?String:Number)(o)}function He(o){var e=Qe(o,"string");return typeof e=="symbol"?e:String(e)}var le={activateTrap:function(e,t){if(e.length>0){var a=e[e.length-1];a!==t&&a.pause()}var u=e.indexOf(t);u===-1||e.splice(u,1),e.push(t)},deactivateTrap:function(e,t){var a=e.indexOf(t);a!==-1&&e.splice(a,1),e.length>0&&e[e.length-1].unpause()}},et=function(e){return e.tagName&&e.tagName.toLowerCase()==="input"&&typeof e.select=="function"},tt=function(e){return e?.key==="Escape"||e?.key==="Esc"||e?.keyCode===27},B=function(e){return e?.key==="Tab"||e?.keyCode===9},at=function(e){return B(e)&&!e.shiftKey},rt=function(e){return B(e)&&e.shiftKey},ce=function(e){return setTimeout(e,0)},de=function(e,t){var a=-1;return e.every(function(u,s){return t(u)?(a=s,!1):!0}),a},O=function(e){for(var t=arguments.length,a=new Array(t>1?t-1:0),u=1;u<t;u++)a[u-1]=arguments[u];return typeof e=="function"?e.apply(void 0,a):e},K=function(e){return e.target.shadowRoot&&typeof e.composedPath=="function"?e.composedPath()[0]:e.target},nt=[],it=function(e,t){var a=t?.document||document,u=t?.trapStack||nt,s=se({returnFocusOnDeactivate:!0,escapeDeactivates:!0,delayInitialFocus:!0,isKeyForward:at,isKeyBackward:rt},t),r={containers:[],containerGroups:[],tabbableGroups:[],nodeFocusedBeforeActivation:null,mostRecentlyFocusedNode:null,active:!1,paused:!1,delayInitialFocusTimer:void 0,recentNavEvent:void 0},c,d=function(i,n,l){return i&&i[n]!==void 0?i[n]:s[l||n]},p=function(i,n){var l=typeof n?.composedPath=="function"?n.composedPath():void 0;return r.containerGroups.findIndex(function(f){var v=f.container,h=f.tabbableNodes;return v.contains(i)||l?.includes(v)||h.find(function(g){return g===i})})},N=function(i){var n=s[i];if(typeof n=="function"){for(var l=arguments.length,f=new Array(l>1?l-1:0),v=1;v<l;v++)f[v-1]=arguments[v];n=n.apply(void 0,f)}if(n===!0&&(n=void 0),!n){if(n===void 0||n===!1)return n;throw new Error("`".concat(i,"` was specified but was not a node, or did not return a node"))}var h=n;if(typeof n=="string"&&(h=a.querySelector(n),!h))throw new Error("`".concat(i,"` as selector refers to no known node"));return h},m=function(){var i=N("initialFocus");if(i===!1)return!1;if(i===void 0||!z(i,s.tabbableOptions))if(p(a.activeElement)>=0)i=a.activeElement;else{var n=r.tabbableGroups[0],l=n&&n.firstTabbableNode;i=l||N("fallbackFocus")}if(!i)throw new Error("Your focus-trap needs to have at least one focusable element");return i},F=function(){if(r.containerGroups=r.containers.map(function(i){var n=We(i,s.tabbableOptions),l=Xe(i,s.tabbableOptions),f=n.length>0?n[0]:void 0,v=n.length>0?n[n.length-1]:void 0,h=l.find(function(y){return C(y)}),g=l.slice().reverse().find(function(y){return C(y)}),w=!!n.find(function(y){return D(y)>0});return{container:i,tabbableNodes:n,focusableNodes:l,posTabIndexesFound:w,firstTabbableNode:f,lastTabbableNode:v,firstDomTabbableNode:h,lastDomTabbableNode:g,nextTabbableNode:function(S){var I=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!0,T=n.indexOf(S);return T<0?I?l.slice(l.indexOf(S)+1).find(function(A){return C(A)}):l.slice(0,l.indexOf(S)).reverse().find(function(A){return C(A)}):n[T+(I?1:-1)]}}}),r.tabbableGroups=r.containerGroups.filter(function(i){return i.tabbableNodes.length>0}),r.tabbableGroups.length<=0&&!N("fallbackFocus"))throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");if(r.containerGroups.find(function(i){return i.posTabIndexesFound})&&r.containerGroups.length>1)throw new Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.")},x=function b(i){var n=i.activeElement;if(n)return n.shadowRoot&&n.shadowRoot.activeElement!==null?b(n.shadowRoot):n},E=function b(i){if(i!==!1&&i!==x(document)){if(!i||!i.focus){b(m());return}i.focus({preventScroll:!!s.preventScroll}),r.mostRecentlyFocusedNode=i,et(i)&&i.select()}},X=function(i){var n=N("setReturnFocus",i);return n||(n===!1?!1:i)},Z=function(i){var n=i.target,l=i.event,f=i.isBackward,v=f===void 0?!1:f;n=n||K(l),F();var h=null;if(r.tabbableGroups.length>0){var g=p(n,l),w=g>=0?r.containerGroups[g]:void 0;if(g<0)v?h=r.tabbableGroups[r.tabbableGroups.length-1].lastTabbableNode:h=r.tabbableGroups[0].firstTabbableNode;else if(v){var y=de(r.tabbableGroups,function(q){var _=q.firstTabbableNode;return n===_});if(y<0&&(w.container===n||z(n,s.tabbableOptions)&&!C(n,s.tabbableOptions)&&!w.nextTabbableNode(n,!1))&&(y=g),y>=0){var S=y===0?r.tabbableGroups.length-1:y-1,I=r.tabbableGroups[S];h=D(n)>=0?I.lastTabbableNode:I.lastDomTabbableNode}else B(l)||(h=w.nextTabbableNode(n,!1))}else{var T=de(r.tabbableGroups,function(q){var _=q.lastTabbableNode;return n===_});if(T<0&&(w.container===n||z(n,s.tabbableOptions)&&!C(n,s.tabbableOptions)&&!w.nextTabbableNode(n))&&(T=g),T>=0){var A=T===r.tabbableGroups.length-1?0:T+1,ae=r.tabbableGroups[A];h=D(n)>=0?ae.firstTabbableNode:ae.firstDomTabbableNode}else B(l)||(h=w.nextTabbableNode(n))}}else h=N("fallbackFocus");return h},L=function(i){var n=K(i);if(!(p(n,i)>=0)){if(O(s.clickOutsideDeactivates,i)){c.deactivate({returnFocus:s.returnFocusOnDeactivate});return}O(s.allowOutsideClick,i)||i.preventDefault()}},J=function(i){var n=K(i),l=p(n,i)>=0;if(l||n instanceof Document)l&&(r.mostRecentlyFocusedNode=n);else{i.stopImmediatePropagation();var f,v=!0;if(r.mostRecentlyFocusedNode)if(D(r.mostRecentlyFocusedNode)>0){var h=p(r.mostRecentlyFocusedNode),g=r.containerGroups[h].tabbableNodes;if(g.length>0){var w=g.findIndex(function(y){return y===r.mostRecentlyFocusedNode});w>=0&&(s.isKeyForward(r.recentNavEvent)?w+1<g.length&&(f=g[w+1],v=!1):w-1>=0&&(f=g[w-1],v=!1))}}else r.containerGroups.some(function(y){return y.tabbableNodes.some(function(S){return D(S)>0})})||(v=!1);else v=!1;v&&(f=Z({target:r.mostRecentlyFocusedNode,isBackward:s.isKeyBackward(r.recentNavEvent)})),E(f||r.mostRecentlyFocusedNode||m())}r.recentNavEvent=void 0},ye=function(i){var n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:!1;r.recentNavEvent=i;var l=Z({event:i,isBackward:n});l&&(B(i)&&i.preventDefault(),E(l))},Q=function(i){if(tt(i)&&O(s.escapeDeactivates,i)!==!1){i.preventDefault(),c.deactivate();return}(s.isKeyForward(i)||s.isKeyBackward(i))&&ye(i,s.isKeyBackward(i))},H=function(i){var n=K(i);p(n,i)>=0||O(s.clickOutsideDeactivates,i)||O(s.allowOutsideClick,i)||(i.preventDefault(),i.stopImmediatePropagation())},ee=function(){if(r.active)return le.activateTrap(u,c),r.delayInitialFocusTimer=s.delayInitialFocus?ce(function(){E(m())}):E(m()),a.addEventListener("focusin",J,!0),a.addEventListener("mousedown",L,{capture:!0,passive:!1}),a.addEventListener("touchstart",L,{capture:!0,passive:!1}),a.addEventListener("click",H,{capture:!0,passive:!1}),a.addEventListener("keydown",Q,{capture:!0,passive:!1}),c},te=function(){if(r.active)return a.removeEventListener("focusin",J,!0),a.removeEventListener("mousedown",L,!0),a.removeEventListener("touchstart",L,!0),a.removeEventListener("click",H,!0),a.removeEventListener("keydown",Q,!0),c},we=function(i){var n=i.some(function(l){var f=Array.from(l.removedNodes);return f.some(function(v){return v===r.mostRecentlyFocusedNode})});n&&E(m())},U=typeof window<"u"&&"MutationObserver"in window?new MutationObserver(we):void 0,P=function(){U&&(U.disconnect(),r.active&&!r.paused&&r.containers.map(function(i){U.observe(i,{subtree:!0,childList:!0})}))};return c={get active(){return r.active},get paused(){return r.paused},activate:function(i){if(r.active)return this;var n=d(i,"onActivate"),l=d(i,"onPostActivate"),f=d(i,"checkCanFocusTrap");f||F(),r.active=!0,r.paused=!1,r.nodeFocusedBeforeActivation=a.activeElement,n?.();var v=function(){f&&F(),ee(),P(),l?.()};return f?(f(r.containers.concat()).then(v,v),this):(v(),this)},deactivate:function(i){if(!r.active)return this;var n=se({onDeactivate:s.onDeactivate,onPostDeactivate:s.onPostDeactivate,checkCanReturnFocus:s.checkCanReturnFocus},i);clearTimeout(r.delayInitialFocusTimer),r.delayInitialFocusTimer=void 0,te(),r.active=!1,r.paused=!1,P(),le.deactivateTrap(u,c);var l=d(n,"onDeactivate"),f=d(n,"onPostDeactivate"),v=d(n,"checkCanReturnFocus"),h=d(n,"returnFocus","returnFocusOnDeactivate");l?.();var g=function(){ce(function(){h&&E(X(r.nodeFocusedBeforeActivation)),f?.()})};return h&&v?(v(X(r.nodeFocusedBeforeActivation)).then(g,g),this):(g(),this)},pause:function(i){if(r.paused||!r.active)return this;var n=d(i,"onPause"),l=d(i,"onPostPause");return r.paused=!0,n?.(),te(),P(),l?.(),this},unpause:function(i){if(!r.paused||!r.active)return this;var n=d(i,"onUnpause"),l=d(i,"onPostUnpause");return r.paused=!1,n?.(),F(),ee(),P(),l?.(),this},updateContainerElements:function(i){var n=[].concat(i).filter(Boolean);return r.containers=n.map(function(l){return typeof l=="string"?a.querySelector(l):l}),r.active&&F(),P(),this}},c.updateContainerElements(e),c};function ot(o,e={}){let t;const{immediate:a,...u}=e,s=Y(!1),r=Y(!1),c=m=>t&&t.activate(m),d=m=>t&&t.deactivate(m),p=()=>{t&&(t.pause(),r.value=!0)},N=()=>{t&&(t.unpause(),r.value=!1)};return fe(()=>Te(o),m=>{m&&(t=it(m,{...u,onActivate(){s.value=!0,e.onActivate&&e.onActivate()},onDeactivate(){s.value=!1,e.onDeactivate&&e.onDeactivate()}}),a&&c())},{flush:"post"}),Ne(()=>d()),{hasFocus:s,isPaused:r,activate:c,deactivate:d,pause:p,unpause:N}}const ut=Fe({props:{show:{type:Boolean,required:!0},fullScreen:{type:Boolean,default:!1}},name:"Modal",emits:["close"],data(){return{id:this.$.uid}},setup(o){const e=Y(),{hasFocus:t,activate:a,deactivate:u}=ot(e);return fe(()=>o.show,async(s,r)=>{s!==r&&(s===!0&&(await re(),a()),s===!1&&(await re(),u()))}),{hasFocus:t,target:e}},mounted(){document.addEventListener("keydown",o=>{o.key=="Escape"&&this.show&&this.$emit("close")})}}),st=["aria-labelledby"],lt={class:"modal__header"},ct=["id"],dt={class:"modal__body"},ft={class:"modal__footer modal__buttons"};function vt(o,e,t,a,u,s){const r=Se("font-awesome-icon");return ke(),De(Oe,{to:"#modal"},[ne(Ae,{name:"modal"},{default:Re(()=>[Ce(k("div",{class:ie(["modal__bg",{"open-modal":o.show}]),onClick:e[2]||(e[2]=c=>o.$emit("close")),ref:"target"},[k("div",{class:ie([{fullscreen:o.fullScreen},"modal__content"]),onClick:e[1]||(e[1]=Ie(()=>{},["stop"])),role:"dialog","aria-modal":"true","aria-labelledby":`dialog${o.id}_label`},[k("div",lt,[k("h2",{id:`dialog${o.id}_label`},[V(o.$slots,"header")],8,ct),k("button",{class:"modal__close-button",onClick:e[0]||(e[0]=c=>o.$emit("close"))},[ne(r,{icon:"fa-solid fa-xmark"})])]),k("div",dt,[V(o.$slots,"body")]),k("div",ft,[V(o.$slots,"footer")])],10,st)],2),[[Pe,o.show]])]),_:3})])}const ht=Ee(ut,[["render",vt]]);export{ht as M};