const t=t=>{const e=new Map;let o=0;const i=t=>{const i=e.get(`${t?.key}`);i&&(0!==i.r.length&&i.r.shift()(t),i.l--,e.set(`${t?.key}`,i)),o--};return{wait:r=>new Promise(((s,l)=>{const n=e.get(`${r?.key}`)||{l:0,r:[]},m=r?.limit&&n.l>=r.limit||o>=(t?.globalLimit||1),c=m&&t?.timeout?setTimeout((()=>{const t=new Error("timeout");t.code=1,l(t)}),t.timeout):void 0,u=()=>s((()=>{clearTimeout(c),i(r)}));m&&n.r.push(u),o++,n.l++,e.set(`${r?.key}`,n),m||u()})),release:i}};export{t as Mutex};
