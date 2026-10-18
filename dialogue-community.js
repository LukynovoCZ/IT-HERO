/* Shared helpers for submissions and moderation. No published dialogue is modified. */
(() => {
 'use strict';
 const feedback={id:'game_feedback',name:'Připomínky ke hře',groups:[{id:'idea',label:'Nápad na vylepšení'},{id:'comment',label:'Komentář'},{id:'bug',label:'Chyba / připomínka'}]};
 const characters=()=>[...window.ITHeroDialogue.characters,feedback];
 const groups=id=>{const c=characters().find(c=>c.id===id);return c?.groups.length?c.groups:[{id:'proposed',label:'Návrh nové hlášky'}];};
 function apiBase(){const value=window.ITHeroCommunityConfig?.apiBaseUrl?.trim();if(!value)return '';const url=new URL(value);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error('API musí používat HTTPS.');if(url.username||url.password||url.search||url.hash)throw Error('Neplatná adresa API.');return value.replace(/\/+$/,'');}
 async function request(path,{method='GET',token,body}={}){
  const base=apiBase();if(!base)throw Error('Společná schránka zatím není připojená.');const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const response=await fetch(base+path,{method,credentials:'omit',cache:'no-store',signal:controller.signal,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await response.json();if(!response.ok)throw Error(data.error||`Služba vrátila chybu ${response.status}.`);return data;}catch(error){if(error.name==='AbortError')throw Error('Služba neodpověděla včas. Návrh si můžeš stáhnout nebo odeslání zopakovat.');throw error;}finally{clearTimeout(timeout);}
 }
 function toExport(rows){const output=[];for(const row of rows){if((row.character_id||row.characterId)==='game_feedback'){output.push({type:'game_feedback',category:row.group_id||row.groupId,text:row.lines.join('\n'),author:row.author||''});continue;}const c=characters().find(c=>c.id===(row.character_id||row.characterId));if(!c)continue;const groupId=row.group_id||row.groupId,g=groups(c.id).find(g=>g.id===groupId);if(!g)continue;let target=output.find(t=>t.id===c.id);if(!target){target={id:c.id,name:c.name,groups:[]};output.push(target);}let group=target.groups.find(t=>t.id===g.id);if(!group){group={id:g.id,label:g.label,lines:[]};target.groups.push(group);}for(const line of row.lines)if(!group.lines.includes(line))group.lines.push(line);}return output;}
 function download(rows){const url=URL.createObjectURL(new Blob([JSON.stringify(toExport(rows),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='it-hero-hlasky-navrhy.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 window.ITHeroCommunity={characters,groups,apiBase,request,toExport,download};
})();
