import{J as u,aq as $,I as a,d as _,Y as b,b as v,c as I,n as P,p as w,i as C,e as x,l as f,a2 as z,r as D,N as c}from"./entry.BUdJ1sqc.js";import E from"./ComponentPlaygroundData.B-3m0LmD.js";import"./TabsHeader.CSgsW3kg.js";import"./ComponentPlaygroundProps.BmXWztVi.js";import"./ProseH4.CGsmx1bI.js";import"./ProseCodeInline.CFijgo4C.js";import"./Badge.BNF7m5do.js";import"./slot.DejY0jgg.js";import"./node.2ETV-d1z.js";import"./ProseP.D7_MZt9o.js";import"./ComponentPlaygroundSlots.vue.Cp4d-h2p.js";import"./ComponentPlaygroundTokens.vue.BGFUywRJ.js";async function q(e){const o=u(e);{const{data:n}=await $(`nuxt-component-meta${o?`-${o}`:""}`,()=>$fetch(`/api/component-meta${o?`/${o}`:""}`));return a(()=>n.value)}}const B=e=>(w("data-v-7d261f72"),e=e(),C(),e),N=B(()=>x("div",{class:"ellipsis-item"},null,-1)),R=[N],V=_({__name:"Ellipsis",props:{width:{type:String,default:"10rem"},height:{type:String,default:"10rem"},zIndex:{type:String,default:"10"},top:{type:String,default:"0"},left:{type:String,default:"auto"},right:{type:String,default:"auto"},blur:{type:String,default:"50px"},colors:{type:Array,default:()=>["rgba(0, 71, 225, 0.22)","rgba(26, 214, 255, 0.22)","rgba(0, 220, 130, 0.22)"]}},setup(e){const o=a(()=>((t=s)=>t.top)()),n=a(()=>((t=s)=>t.left)()),r=a(()=>((t=s)=>t.right)()),i=a(()=>((t=s)=>t.zIndex)()),l=a(()=>((t=s)=>t.width)()),g=a(()=>((t=s)=>t.height)()),h=a(()=>((t=s)=>`blur(${t.blur})`)()),y=a(()=>((t=s)=>{var p,d,m;return`linear-gradient(97.62deg, ${(p=t==null?void 0:t.colors)==null?void 0:p[0]} 2.27%, ${(d=t==null?void 0:t.colors)==null?void 0:d[1]} 50.88%, ${(m=t==null?void 0:t.colors)==null?void 0:m[2]} 98.48%)`})()),s=e,{$pinceau:S}=b(s,void 0,{_6HG_top:o,_31J_insetInlineStart:n,_Cy1_insetInlineEnd:r,_RFz_zIndex:i,_U3d_maxWidth:l,_Rmg_height:g,_MhW_filter:h,_LPh_background:y});return(t,p)=>(v(),I("div",{class:P(["ellipsis",[u(S)]])},R,2))}}),W=f(V,[["__scopeId","data-v-7d261f72"]]),j=_({props:{component:{type:String,required:!0},props:{type:Object,required:!1,default:()=>({})}},async setup(e){const o=a(()=>z(e.component)),n=D({...e.props}),r=await q(e.component);return{as:o,formProps:n,componentData:r}},render(e){const o=Object.entries(this.$slots).reduce((n,[r,i])=>{if(r.startsWith("component-")){const l=r.replace("component-","");n[l]=i}return n},{});return c("div",{class:"component-playground"},[c("div",{class:"component-playground-wrapper"},[c(W,{class:"component-playground-ellipsis",blur:"5vw",height:"100%",width:"100%"}),c(e.as,{...e.formProps,class:"component-playground-component"},{...o})]),c(E,{modelValue:e.formProps,componentData:e.componentData,"onUpdate:modelValue":n=>e.formProps=n})])}}),Q=f(j,[["__scopeId","data-v-9ca9b996"]]);export{Q as default};