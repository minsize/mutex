const i=({globalLimit:i=1}={})=>{const t={};let e=0;const s=({key:i=""}={})=>{const s=t[i];s.waitings.length>0?(s.waitings.shift()?.resolve({key:i}),s.limit--,e--):(s.limit=0,e=0)};return{wait:async({key:l="",limit:n=1}={})=>(t[l]||(t[l]={limit:0,waitings:[]}),await new Promise((a=>{const o=()=>a((()=>s({key:l}))),m=t[l];e>=i||m.limit>=n?m.waitings.push({resolve:o}):(e++,m.limit++,o())}))),release:s}};export{i as default};