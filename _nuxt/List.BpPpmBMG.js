import{d as r,a0 as l,I as u,N as n,aa as p,l as m}from"./entry.BUdJ1sqc.js";import{_ as f}from"./MDCSlot.B2BM9zbV.js";import{u as d,f as _}from"./node.2ETV-d1z.js";const y=()=>({unwrap:d,flatUnwrap:_}),h={primary:"heroicons-outline:check",info:"heroicons-outline:information-circle",success:"heroicons-outline:check-circle",warning:"heroicons-outline:exclamation",danger:"heroicons-outline:exclamation-circle"},w=r({props:{icon:{type:String,default:null},type:{type:String,default:"primary",validator:a=>["primary","info","success","warning","danger"].includes(a)}},setup(a){const o=l(),{flatUnwrap:s,unwrap:t}=y(),c=u(()=>a.icon||h[a.type]);return()=>{const i=s((o.default&&o.default())??[],["ul"]).map(e=>t(e,["li"]));return n("ul",i.map(e=>n("li",[n("span",{class:`list-icon ${a.type}`},n(p,{name:c.value,class:"icon"})),n("span",n(f,{use:()=>e}))])))}}}),S=m(w,[["__scopeId","data-v-e3286cf5"]]);export{S as default};
