import {catalog} from './character-groups.mjs';
const statuses=['pending','accepted','rejected'];
class HTTPError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new HTTPError(status,message);};
async function jsonBody(request){
 const reader=request.body?.getReader();if(!reader)fail(400,'Chybí JSON.');let length=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();fail(413,'Návrh je příliš dlouhý.');}chunks.push(value);}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{fail(400,'Neplatný JSON.');}
}
function clean(value,max){if(typeof value!=='string')fail(400,'Neplatný text.');const text=value.normalize('NFC').trim();if(text.length>max||/[\u0000-\u001f\u007f]/.test(text))fail(400,'Text je příliš dlouhý nebo obsahuje řídicí znaky.');return text;}
function proposal(data){
 if(!data||typeof data!=='object')fail(400,'Neplatný návrh.');if(data.website)fail(400,'Návrh nebyl přijat.');
 if(typeof data.requestId!=='string'||! /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(data.requestId))fail(400,'Chybí identifikátor návrhu.');
 const feedback=data.characterId==='game_feedback';
 if(feedback){if(!['idea','comment','bug'].includes(data.groupId)||!Array.isArray(data.lines)||data.lines.length!==1||typeof data.lines[0]!=='string')fail(400,'Neplatná připomínka.');const text=data.lines[0].normalize('NFC').trim();if(!text||text.length>2000||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(text))fail(400,'Napiš připomínku do 2000 znaků.');return {requestId:data.requestId,characterId:'game_feedback',groupId:data.groupId,lines:[text],author:clean(data.author??'',24)};}
 const character=catalog.find(c=>c.id===data.characterId);if(!character||!character.groups.some(g=>g.id===data.groupId))fail(400,'Neznámá postava nebo situace.');
 if(!Array.isArray(data.lines)||!data.lines.length||data.lines.length>10)fail(400,'Pošli 1 až 10 hlášek.');
 const lines=[...new Set(data.lines.map(line=>clean(line,200)))];if(lines.some(line=>!line))fail(400,'Hláška nesmí být prázdná.');
 return {requestId:data.requestId,characterId:character.id,groupId:data.groupId,lines,author:clean(data.author??'',24)};
}
const digest=async text=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
async function authorize(request,env){
 const header=request.headers.get('Authorization')||'';if(!header.startsWith('Bearer ')||header.length>300)fail(401,'Je potřeba správcovský klíč.');
 const [a,b]=await Promise.all([digest(header.slice(7)),digest(env.ADMIN_TOKEN)]);let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];if(different)fail(401,'Neplatný správcovský klíč.');
}
function idsOf(data){if(!Array.isArray(data?.ids)||!data.ids.length||data.ids.length>100||data.ids.some(id=>!Number.isSafeInteger(id)||id<1))fail(400,'Vyber 1 až 100 návrhů.');return [...new Set(data.ids)];}
const same=(row,p)=>row.character_id===p.characterId&&row.group_id===p.groupId&&row.lines_json===JSON.stringify(p.lines)&&row.author===p.author;
export default {async fetch(request,env){
 const origin=request.headers.get('Origin'),headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(origin===env.ALLOWED_ORIGIN)headers['Access-Control-Allow-Origin']=origin;
 const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
 try{
  if(origin&&origin!==env.ALLOWED_ORIGIN)fail(403,'Nepovolený původ požadavku.');
  if(!env.DB||!env.ALLOWED_ORIGIN||!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32)fail(503,'Schránka zatím není nakonfigurovaná.');
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, PATCH, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}});
  const url=new URL(request.url),now=Math.floor(Date.now()/1000);
  if(url.pathname==='/v1/dialogue-suggestions'&&request.method==='POST'){
   if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'Použij application/json.');
   const p=proposal(await jsonBody(request)),lookup=()=>env.DB.prepare('SELECT * FROM dialogue_suggestions WHERE request_id=?').bind(p.requestId).first();
   let row=await lookup();if(row){if(!same(row,p))fail(409,'Tento identifikátor už má jiný obsah.');return reply({id:row.id,status:row.status,duplicate:true},202);}
   // Hash short-lived rate buckets. No raw IP or visitor identifier is stored in proposals.
   const ip=request.headers.get('CF-Connecting-IP')||'unknown';const hash=await digest(`${env.ADMIN_TOKEN}/${ip}/${Math.floor(now/600)}`);const bucket=Array.from(hash,n=>n.toString(16).padStart(2,'0')).join('');
   await env.DB.prepare('DELETE FROM dialogue_rate_limits WHERE expires_at < ?').bind(now).run();
   await env.DB.prepare('INSERT INTO dialogue_rate_limits(bucket,count,expires_at) VALUES(?,0,?) ON CONFLICT(bucket) DO NOTHING').bind(bucket,now+1200).run();
   const rate=await env.DB.prepare('UPDATE dialogue_rate_limits SET count=count+1 WHERE bucket=? AND count<5 RETURNING count').bind(bucket).first();if(!rate)fail(429,'Příliš mnoho návrhů. Zkus to za 10 minut.');
   await env.DB.prepare('INSERT INTO dialogue_suggestions(request_id,character_id,group_id,lines_json,author,status,created_at,updated_at) VALUES(?,?,?,?,?,\'pending\',?,?) ON CONFLICT(request_id) DO NOTHING').bind(p.requestId,p.characterId,p.groupId,JSON.stringify(p.lines),p.author,now,now).run();
   row=await lookup();if(!same(row,p))fail(409,'Tento identifikátor už má jiný obsah.');return reply({id:row.id,status:row.status},202);
  }
  if(url.pathname==='/v1/admin/dialogue-suggestions'){
   await authorize(request,env);
   if(request.method==='GET'){
    const status=url.searchParams.get('status')||'pending';if(!statuses.includes(status))fail(400,'Neplatný stav.');
    const before=Number(url.searchParams.get('before')||Number.MAX_SAFE_INTEGER);if(!Number.isSafeInteger(before)||before<1)fail(400,'Neplatná stránka.');
    const {results}=await env.DB.prepare('SELECT * FROM dialogue_suggestions WHERE status=? AND id<? ORDER BY id DESC LIMIT 50').bind(status,before).all();
    return reply({items:results.map(({request_id,lines_json,...row})=>({...row,lines:JSON.parse(lines_json)})),nextCursor:results.length===50?results.at(-1).id:null});
   }
   if(request.method==='PATCH'||request.method==='DELETE'){
    const data=await jsonBody(request),ids=idsOf(data),placeholders=ids.map(()=>'?').join(',');let result;
    if(request.method==='DELETE')result=await env.DB.prepare(`DELETE FROM dialogue_suggestions WHERE id IN (${placeholders})`).bind(...ids).run();
    else if(Object.hasOwn(data,'lines')){
     if(ids.length!==1)fail(400,'Upravuj vždy jeden návrh.');
     const row=await env.DB.prepare('SELECT * FROM dialogue_suggestions WHERE id=?').bind(ids[0]).first();if(!row)fail(404,'Návrh neexistuje.');
     const edited=proposal({requestId:row.request_id,characterId:row.character_id,groupId:row.group_id,lines:data.lines,author:row.author});
     result=await env.DB.prepare("UPDATE dialogue_suggestions SET lines_json=?,status='pending',updated_at=? WHERE id=?").bind(JSON.stringify(edited.lines),now,row.id).run();
    }
    else{if(!statuses.includes(data.status))fail(400,'Neplatný stav.');result=await env.DB.prepare(`UPDATE dialogue_suggestions SET status=?,updated_at=? WHERE id IN (${placeholders})`).bind(data.status,now,...ids).run();}
    return reply({changed:result.meta.changes});
   }
  }
  fail(404,'Nenalezeno.');
 }catch(error){return reply({error:error instanceof HTTPError?error.message:'Služba nyní nemůže požadavek dokončit. Zkus to později.'},error instanceof HTTPError?error.status:503);}
}};
