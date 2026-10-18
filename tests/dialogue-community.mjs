import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import http from 'node:http';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import worker from '../cloud-api/worker.mjs';
import {catalog} from '../cloud-api/character-groups.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('cloud-api/migrations/0001_dialogue.sql','utf8'));
class Statement{
 constructor(sql,values=[]){this.sql=sql;this.values=values;}bind(...values){return new Statement(this.sql,values);}
 async first(){return db.prepare(this.sql).get(...this.values)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.values)};}
 async run(){const r=db.prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}
}
const env={DB:{prepare:sql=>new Statement(sql)},ALLOWED_ORIGIN:'http://127.0.0.1:8000',ADMIN_TOKEN:'local-test-only-not-a-production-key-123456789'};
const call=async(method,path,body,extra={})=>{
 const r=await worker.fetch(new Request('https://test.invalid'+path,{method,headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json','CF-Connecting-IP':'127.0.0.1',...extra},...(body!==undefined?{body:JSON.stringify(body)}:{})}),env);
 return {status:r.status,data:r.status===204?null:await r.json(),headers:r.headers};
};
const payload=(extra={})=>({requestId:crypto.randomUUID(),characterId:'manager',groupId:'contact',lines:['Pošli mi na to ticket.'],author:'Hráč',...extra});
const auth={Authorization:`Bearer ${env.ADMIN_TOKEN}`};
let server,browser;
try{
 const source={window:{}};vm.runInNewContext(fs.readFileSync('character-dialogue.js','utf8'),source);
 const expected=source.window.ITHeroDialogue.characters.map(c=>({id:c.id,name:c.name,groups:c.groups.length?c.groups.map(g=>({id:g.id,label:g.label})):[{id:'proposed',label:'Návrh nové hlášky'}]}));assert.deepEqual(catalog,JSON.parse(JSON.stringify(expected)));
 let result=await call('OPTIONS','/v1/dialogue-suggestions');assert.equal(result.status,204);assert.equal(result.headers.get('Access-Control-Allow-Origin'),env.ALLOWED_ORIGIN);
 const p=payload();result=await call('POST','/v1/dialogue-suggestions',p);assert.equal(result.status,202,JSON.stringify(result));const id=result.data.id;assert.equal((await call('POST','/v1/dialogue-suggestions',p)).data.duplicate,true);
 assert.equal((await call('POST','/v1/dialogue-suggestions',{...p,lines:['jiný obsah']})).status,409);
 for(const changes of [{characterId:'unknown'},{groupId:'unknown'},{lines:['a'.repeat(201)]},{lines:[]},{lines:Array(11).fill('x')},{author:'a'.repeat(25)},{website:'spam.test'}])assert.equal((await call('POST','/v1/dialogue-suggestions',payload(changes))).status,400);
 assert.equal((await call('POST','/v1/dialogue-suggestions',payload(),{Origin:'https://unrelated.invalid'})).status,403);
 assert.equal((await call('POST','/v1/dialogue-suggestions',payload(),{'Content-Type':'text/plain'})).status,415);
 const large=await worker.fetch(new Request('https://test.invalid/v1/dialogue-suggestions',{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(8200)}),env);assert.equal(large.status,413);
 assert.equal((await call('GET','/v1/admin/dialogue-suggestions')).status,401);assert.equal((await call('DELETE','/v1/admin/dialogue-suggestions',{ids:[id]},{Authorization:'Bearer wrong'})).status,401);
 result=await call('GET','/v1/admin/dialogue-suggestions',undefined,auth);assert.equal(result.data.items.length,1);assert.deepEqual(result.data.items[0].lines,p.lines);
 for(let i=0;i<4;i++)assert.equal((await call('POST','/v1/dialogue-suggestions',payload())).status,202);
 assert.equal((await call('POST','/v1/dialogue-suggestions',payload())).status,429);assert.equal((await call('POST','/v1/dialogue-suggestions',p)).status,202,'Idempotent retry must not consume another allowance');
 result=await call('PATCH','/v1/admin/dialogue-suggestions',{ids:[id],status:'accepted'},auth);assert.equal(result.data.changed,1);assert.equal((await call('GET','/v1/admin/dialogue-suggestions?status=accepted',undefined,auth)).data.items.length,1);
 assert.equal((await call('DELETE','/v1/admin/dialogue-suggestions',{ids:[id]},auth)).data.changed,1);
 // More than one page: no pending proposal is hidden permanently behind the first 50.
 for(let i=0;i<52;i++)db.prepare("INSERT INTO dialogue_suggestions(request_id,character_id,group_id,lines_json,author,status,created_at,updated_at) VALUES(?,?,?,?,?,'pending',1,1)").run(crypto.randomUUID(),'manager','contact',JSON.stringify([`Návrh ${i}`]),'');
 result=await call('GET','/v1/admin/dialogue-suggestions',undefined,auth);assert.equal(result.data.items.length,50);assert(result.data.nextCursor);assert((await call('GET',`/v1/admin/dialogue-suggestions?before=${result.data.nextCursor}`,undefined,auth)).data.items.length>0);
 console.log('PASS API: real SQLite, catalog parity, validation/body limit, CORS, authentication, idempotency/conflict, rate limit, moderation/deletion and pagination.');
 // Fresh state for browser flows. The local adapter runs the actual Worker code.
 db.exec('DELETE FROM dialogue_suggestions;DELETE FROM dialogue_rate_limits;');
 server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const r=await worker.fetch(new Request('http://127.0.0.1:8799'+req.url,{method:req.method,headers:{...req.headers,'CF-Connecting-IP':'browser-test'},...(['GET','HEAD'].includes(req.method)?{}:{body})}),env);res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end();}});
 await new Promise(resolve=>server.listen(8799,'127.0.0.1',resolve));
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];
 const offline=await browser.newPage({viewport:{width:390,height:844}});offline.on('pageerror',e=>errors.push(e.message));
 await offline.route('**/community-config.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.ITHeroCommunityConfig={apiBaseUrl: ""};'}));await offline.goto('http://127.0.0.1:8000/dialogue-suggestions.html?character=manager');assert.equal(await offline.locator('#suggestion-character').inputValue(),'manager');await offline.locator('#suggestion-lines').fill('Nová porada.\n\nJeště jeden ticket.');
 const pending=offline.waitForEvent('download');await offline.locator('[type=submit]').click();const file=await pending;const exported=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(exported[0].id,'manager');assert.deepEqual(exported[0].groups[0].lines,['Nová porada.','Ještě jeden ticket.']);assert((await offline.locator('#suggestion-status').innerText()).includes('zatím není aktivní'));assert.equal(db.prepare('SELECT count(*) AS n FROM dialogue_suggestions').get().n,0);
 async function connected(){const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));await p.route('**/community-config.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.ITHeroCommunityConfig={apiBaseUrl:"http://127.0.0.1:8799"};'}));return p;}
 const player=await connected();await player.goto('http://127.0.0.1:8000/dialogue-suggestions.html');await player.locator('#suggestion-character').selectOption('manager');await player.locator('#suggestion-group').selectOption('contact');await player.locator('#suggestion-lines').fill('Manažer má novou hlášku.\n<img src=x onerror=alert(1)>');await player.locator('#suggestion-author').fill('Hráč z mobilu');let interrupt=true;await player.route('**/v1/dialogue-suggestions',async route=>{if(interrupt){interrupt=false;await route.fetch();await route.abort();}else await route.continue();});
 await player.locator('[type=submit]').click();await player.waitForFunction(()=>document.querySelector('#suggestion-status').textContent.includes('Text zůstal'));assert.equal(db.prepare('SELECT count(*) AS n FROM dialogue_suggestions').get().n,1);
 await player.locator('[type=submit]').click();await player.waitForFunction(()=>document.querySelector('#suggestion-status').textContent.includes('byl přijat'));assert.equal(db.prepare('SELECT count(*) AS n FROM dialogue_suggestions').get().n,1);assert(await player.evaluate(()=>ITHeroDialogue.lines('manager','contact').every(line=>!line.includes('novou hlášku'))));
 const admin=await connected();await admin.goto('http://127.0.0.1:8000/dialogue-admin.html');await admin.locator('#admin-token').fill('wrong');await admin.locator('[type=submit]').click();await admin.waitForFunction(()=>document.querySelector('#admin-status').textContent.includes('Neplatný'));assert(await admin.locator('#admin-workspace').isHidden());
 await admin.locator('#admin-token').fill(env.ADMIN_TOKEN);await admin.locator('[type=submit]').click();await admin.locator('#admin-workspace').waitFor({state:'visible'});assert.equal(await admin.locator('#admin-items article').count(),1);assert.equal(await admin.locator('#admin-items img').count(),0,'Untrusted proposals must render as text');
 await admin.locator('#admin-all').check();const exportedAdmin=admin.waitForEvent('download');await admin.locator('#admin-export').click();const adminFile=await exportedAdmin;const draft=JSON.parse(fs.readFileSync(await adminFile.path(),'utf8'));assert.equal(draft[0].id,'manager');assert.equal(draft[0].groups[0].id,'contact');assert.equal(draft[0].groups[0].lines.length,2);
 await admin.locator('[data-moderation=accepted]').click();await admin.waitForFunction(()=>document.querySelector('#admin-status').textContent.includes('prázdná'));await admin.locator('#admin-filter').selectOption('accepted');await admin.locator('#admin-items article').waitFor();await admin.locator('#admin-all').check();
 admin.once('dialog',dialog=>dialog.dismiss());await admin.locator('#admin-delete').click();assert.equal(db.prepare('SELECT count(*) AS n FROM dialogue_suggestions').get().n,1);
 admin.once('dialog',dialog=>dialog.accept());await admin.locator('#admin-delete').click();await admin.waitForFunction(()=>document.querySelector('#admin-status').textContent.includes('prázdná'));assert.equal(db.prepare('SELECT count(*) AS n FROM dialogue_suggestions').get().n,0);
 // General feedback preserves paragraphs, remains private and exports separately from dialogue.
 await player.locator('#suggestion-kind').selectOption('bug');assert(await player.locator('#suggestion-character').isHidden());
 const feedbackText='Ve třetím patře se zasekne hra.\nTelefon na šířku, Chrome.';
 await player.locator('#suggestion-feedback').fill(feedbackText);await player.locator('[type=submit]').click();await player.waitForFunction(()=>document.querySelector('#suggestion-status').textContent.includes('byl přijat'));
 const feedbackRow=db.prepare("SELECT * FROM dialogue_suggestions WHERE character_id='game_feedback'").get();assert(feedbackRow);assert.equal(JSON.parse(feedbackRow.lines_json)[0],feedbackText);
 await admin.locator('#admin-filter').selectOption('pending');await admin.locator('#admin-items article').waitFor();assert((await admin.locator('#admin-items').innerText()).includes('Chyba / připomínka'));
 await admin.locator('#admin-all').check();const feedbackDownload=admin.waitForEvent('download');await admin.locator('#admin-export').click();const feedbackFile=await feedbackDownload;const feedbackExport=JSON.parse(fs.readFileSync(await feedbackFile.path(),'utf8'));assert.equal(feedbackExport[0].type,'game_feedback');assert.equal(feedbackExport[0].text,feedbackText);
 assert.equal((await call('POST','/v1/dialogue-suggestions',payload({characterId:'game_feedback',groupId:'idea',lines:['a'.repeat(2001)]}))).status,400);
 assert.equal((await call('POST','/v1/dialogue-suggestions',payload({characterId:'game_feedback',groupId:'unknown'}))).status,400);
 assert(await admin.evaluate(()=>!Object.values(localStorage).some(v=>v.includes('local-test-only'))));await admin.locator('#admin-logout').click();assert(await admin.locator('#admin-workspace').isHidden());
 for(const p of [offline,player,admin])assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('PASS browser: offline compatible JSON, real shared submission and idempotent retry after lost response, independent admin login, XSS-safe rendering, export, accept/delete/cancel, logout and mobile layout; published dialogue unchanged.');
}finally{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));db.close();}
