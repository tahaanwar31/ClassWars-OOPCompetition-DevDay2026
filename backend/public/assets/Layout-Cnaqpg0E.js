import{a as d,u as x,r as m,j as e,L as p}from"./index-BtXgXPgw.js";import{S as f}from"./shield-B6FTB-Fg.js";import{c as s}from"./createLucideIcon-BHTs0NKF.js";import{F as u}from"./file-question-mark-okPnPyWZ.js";import{T as b,U as g}from"./users-B5jkTnsX.js";import{C as y}from"./chevron-right-CI5ttp3c.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],k=s("chevron-left",w);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],j=s("layout-dashboard",v);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],L=s("log-out",N);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],C=s("settings",_);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M18 21a8 8 0 0 0-16 0",key:"3ypg7q"}],["circle",{cx:"10",cy:"8",r:"5",key:"o932ke"}],["path",{d:"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3",key:"10s06x"}]],$=s("users-round",S),M=[{path:"/admin/dashboard",label:"Dashboard",icon:j},{path:"/admin/questions",label:"Questions",icon:u},{path:"/admin/teams",label:"Teams",icon:$},{path:"/admin/leaderboard",label:"Leaderboard",icon:b},{path:"/admin/config",label:"Config",icon:C},{path:"/admin/sessions",label:"Sessions",icon:g}];function q({children:n}){const i=d(),r=x(),[t,l]=m.useState(!1),c=()=>{localStorage.removeItem("token"),r("/admin/login")};return e.jsxs("div",{className:"flex h-screen bg-[#0a0a0f] overflow-hidden",children:[e.jsxs("aside",{className:`flex flex-col border-r border-white/[0.06] bg-[#06060a] transition-all duration-200 ${t?"w-16":"w-56"}`,children:[e.jsxs("div",{className:`flex items-center h-14 border-b border-white/[0.06] ${t?"justify-center":"px-4"}`,children:[e.jsx(f,{className:"w-5 h-5 text-[#39ff14] shrink-0"}),!t&&e.jsx("span",{className:"ml-2.5 text-sm font-bold tracking-[0.2em] text-white/80",children:"CLASSWARS"})]}),e.jsx("nav",{className:"flex-1 py-3 space-y-0.5 px-2 overflow-y-auto",children:M.map(a=>{const h=a.icon,o=i.pathname===a.path;return e.jsxs(p,{to:a.path,title:t?a.label:void 0,className:`flex items-center gap-3 px-3 py-2.5 rounded-md text-[11px] font-semibold tracking-[0.1em] transition-all ${o?"bg-[#39ff14]/10 text-[#39ff14]":"text-white/30 hover:text-white/60 hover:bg-white/[0.03]"}`,children:[e.jsx(h,{className:`w-4 h-4 shrink-0 ${o?"text-[#39ff14]":""}`}),!t&&e.jsx("span",{children:a.label})]},a.path)})}),e.jsxs("div",{className:"border-t border-white/[0.06]",children:[e.jsx("button",{onClick:()=>l(!t),className:"flex items-center gap-3 w-full px-3 py-2.5 text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all",children:t?e.jsx(y,{className:"w-4 h-4 mx-auto"}):e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"w-4 h-4 shrink-0"}),e.jsx("span",{className:"text-[11px] font-semibold tracking-[0.1em]",children:"Collapse"})]})}),e.jsxs("button",{onClick:c,className:"flex items-center gap-3 w-full px-3 py-2.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/5 transition-all",children:[e.jsx(L,{className:"w-4 h-4 shrink-0"}),!t&&e.jsx("span",{className:"text-[11px] font-semibold tracking-[0.1em]",children:"Logout"})]})]})]}),e.jsx("main",{className:"flex-1 overflow-y-auto",children:e.jsx("div",{className:"p-6 md:p-8 max-w-7xl mx-auto",children:n})})]})}export{q as default};
