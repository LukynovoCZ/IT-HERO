/* Run explicitly from GitHub Actions. Credentials are never printed or written to Git. */
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const workerName='it-hero-community',databaseName='it-hero-community';
export async function deploy({env=process.env,fetchImpl=fetch,log=console.log}={}){
 const token=env.CLOUDFLARE_API_TOKEN,account=env.CLOUDFLARE_ACCOUNT_ID,admin=env.IT_HERO_ADMIN_TOKEN;
 if(!token)throw Error('V GitHub repository secrets chybí CLOUDFLARE_API_TOKEN.');
 if(!/^[a-f0-9]{32}$/i.test(account||''))throw Error('Chybí platné CLOUDFLARE_ACCOUNT_ID.');
 if(!admin||admin.length<32||admin.length>256)throw Error('Přidej GitHub secret IT_HERO_ADMIN_TOKEN: soukromé heslo pro správu, 32 až 256 znaků.');
 if(admin===token)throw Error('Pro správu použij jiné heslo než Cloudflare API token.');
 const base=`https://api.cloudflare.com/client/v4/accounts/${account}`;
 async function api(route,{method='GET',body,form,allow404=false}={}){
  const response=await fetchImpl(base+route,{method,signal:AbortSignal.timeout(60000),headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(form?{body:form}:body?{body:JSON.stringify(body)}:{})});
  if(allow404&&response.status===404)return null;
  const data=await response.json().catch(()=>null);
  if(!response.ok||!data?.success){const codes=(data?.errors||[]).map(e=>Number(e.code)).filter(Number.isFinite).join(',');throw Error(`Cloudflare ${method} ${route.split('?')[0]}: HTTP ${response.status}${codes?` (kód ${codes})`:''}. Ověř oprávnění tokenu pro tento účet. Soukromé hodnoty nebyly vypsány.`);}
  return data;
 }
 // Read existing resources before creating anything. Do not replace another database.
 let database;for(let page=1;page<=100;page++){
  const data=await api(`/d1/database?per_page=100&page=${page}`);database=data.result.find(d=>d.name===databaseName);if(database)break;
  if(data.result.length<100)break;if(page===100)throw Error('Seznam databází je příliš dlouhý; nasazení se zastavilo bez vytváření další DB.');
 }
 let subdomain=(await api('/workers/subdomain',{allow404:true}))?.result?.subdomain;
 if(!subdomain){const result=await api('/workers/subdomain',{method:'PUT',body:{subdomain:`it-hero-${account.slice(0,12)}`}});subdomain=result.result.subdomain;}
 if(!/^[a-z0-9-]+$/.test(subdomain||''))throw Error('Cloudflare nevrátil platnou workers.dev subdoménu.');
 if(!database)database=(await api('/d1/database',{method:'POST',body:{name:databaseName}})).result;
 if(typeof database.uuid!=='string'||!database.uuid)throw Error('Cloudflare nevrátil ID databáze.');
 const sql=await fs.readFile(path.join(root,'cloud-api/migrations/0001_dialogue.sql'),'utf8');
 const migration=await api(`/d1/database/${database.uuid}/query`,{method:'POST',body:{sql}});
 if(!Array.isArray(migration.result)||migration.result.some(r=>r.success===false))throw Error('Migrace databáze nebyla potvrzena. Worker nebyl změněn.');
 const form=new FormData();
 const metadata={main_module:'worker.mjs',compatibility_date:'2026-10-01',keep_bindings:['secret_text'],bindings:[{type:'d1',name:'DB',id:database.uuid},{type:'plain_text',name:'ALLOWED_ORIGIN',text:'https://lukynovocz.github.io'}]};
 form.set('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));
 for(const name of ['worker.mjs','character-groups.mjs'])form.set(name,new Blob([await fs.readFile(path.join(root,'cloud-api',name))],{type:'application/javascript+module'}),name);
 await api(`/workers/scripts/${workerName}`,{method:'PUT',form});
 await api(`/workers/scripts/${workerName}/secrets`,{method:'PUT',body:{name:'ADMIN_TOKEN',type:'secret_text',text:admin}});
 await api(`/workers/scripts/${workerName}/subdomain`,{method:'POST',body:{enabled:true}});
 const url=`https://${workerName}.${subdomain}.workers.dev`;
 // Service startup may propagate slowly. Never report a failed health check as ready.
 let healthy=false;for(let attempt=0;attempt<6;attempt++){
  try{const [preflight,protectedList]=await Promise.all([fetchImpl(url+'/v1/dialogue-suggestions',{method:'OPTIONS',headers:{Origin:'https://lukynovocz.github.io'},signal:AbortSignal.timeout(15000)}),fetchImpl(url+'/v1/admin/dialogue-suggestions',{headers:{Authorization:`Bearer ${admin}`},signal:AbortSignal.timeout(15000)})]);const data=await protectedList.json().catch(()=>null);healthy=preflight.status===204&&preflight.headers.get('Access-Control-Allow-Origin')==='https://lukynovocz.github.io'&&protectedList.status===200&&Array.isArray(data?.items);if(healthy)break;}catch{/* Retry only the read-only readiness checks. */}
  if(attempt<5)await new Promise(resolve=>setTimeout(resolve,3000));
 }
 if(!healthy)throw Error(`Worker byl nahrán, ale ověření provozu neprošlo. Veřejná adresa: ${url}. Zkontroluj nasazení v Cloudflare; web hry zatím nepřepojuj.`);
 log(`Schránka byla nasazena a ověřena: ${url}`);
 if(env.GITHUB_STEP_SUMMARY)await fs.appendFile(env.GITHUB_STEP_SUMMARY,`## Schránka hlášek je připravená\n\nVeřejná adresa API: **${url}**\n\nNásledující krok připojí ověřenou adresu k formuláři hry. Soukromé klíče se nikam neposílají. Pro přihlášení do správy použij své heslo uložené jako IT_HERO_ADMIN_TOKEN.\n`);
 return url;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))deploy().then(async url=>{if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`api_url=${url}\n`);}).catch(error=>{console.error(error instanceof Error?error.message:'Nasazení se nepodařilo.');process.exitCode=1;});
