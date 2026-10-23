import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {createRequire} from 'node:module';
import {buildPublicCopy} from '../scripts/build_public_copy.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const out=await fs.mkdtemp(path.join(os.tmpdir(),'public-copy-test-'));
const db=new DatabaseSync(':memory:');
for(const file of (await fs.readdir('cloud-api/migrations')).filter(f=>f.endsWith('.sql')).sort())db.exec(await fs.readFile('cloud-api/migrations/'+file,'utf8'));
class Statement{
 constructor(sql,values=[]){this.sql=sql;this.values=values;}
 bind(...values){return new Statement(this.sql,values);}
 async first(){return db.prepare(this.sql).get(...this.values)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.values)};}
 async run(){const r=db.prepare(this.sql).run(...this.values);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}
}
let server,browser;
try{
 const files=await buildPublicCopy(out);
 for(const name of await fs.readdir('assets/office-desks'))assert(files.includes('assets/office-desks/'+name),'Missing desk texture in public build: '+name);
 assert(files.includes('assets/outdoor/jarda-poses.png'));for(const icon of ['favicon.ico','site.webmanifest','assets/icons/game-512.png','assets/icons/game-192.png','assets/icons/apple-touch-icon.png','assets/icons/favicon-32.png'])assert(files.includes(icon),icon);const manifest=JSON.parse(await fs.readFile(path.join(out,'site.webmanifest'),'utf8'));for(const icon of manifest.icons){const png=await fs.readFile(path.join(out,icon.src));assert.equal(icon.sizes,`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);}assert(!files.some(f=>/docs|tasks|README|source\.png|reference/.test(f)));
 const worker=(await import(pathToFileURL(path.join(out,'_worker.js')))).default;
 const type=f=>f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':'text/html; charset=utf-8';
 const env={ADMIN_TOKEN:'test-only-private-password-never-production',DB:{prepare:sql=>new Statement(sql),batch:async statements=>Promise.all(statements.map(s=>s.run()))},ASSETS:{async fetch(request){
  const name=decodeURIComponent(new URL(request.url).pathname).replace(/^\//,'')||'index.html';
  if(name.includes('..')||name.startsWith('_'))return new Response('Not found',{status:404});
  try{return new Response(await fs.readFile(path.join(out,name)),{headers:{'Content-Type':type(name)}});}catch{return new Response('Not found',{status:404});}
 }}};
 server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const request=new Request('http://127.0.0.1:'+server.address().port+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 for(const file of ['/.git/config','/docs/publishing-privacy.md','/cloud-api/deployment.json','/ending-storyboard.html'])assert.equal((await fetch(base+file)).status,404);
 assert.equal((await fetch(base+'/v1/scores',{headers:{Origin:'https://foreign.invalid'}})).status,403);
 assert.equal((await fetch(base+'/v1/admin/dialogue-suggestions')).status,401);
 const proposal={requestId:crypto.randomUUID(),characterId:'jarda',groupId:'backflip',lines:['Nová zkušební hláška.'],author:'Test'};
 assert.equal((await fetch(base+'/v1/dialogue-suggestions',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(proposal)})).status,202);
 const admin=await fetch(base+'/v1/admin/dialogue-suggestions',{headers:{Origin:base,Authorization:'Bearer '+env.ADMIN_TOKEN}});assert.equal((await admin.json()).items[0].lines[0],proposal.lines[0]);
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__game=new Phaser.Game({')});});
 await page.goto(base);await page.locator('#game-action').click();await page.waitForFunction(()=>__game.scene.getScene('ITGame').gameState==='playing');
 assert.equal(await page.evaluate(()=>ITHeroCommunity.apiBase()),base);assert.equal(await page.evaluate(async()=>(await ITHeroCommunity.request('/v1/play-stats')).total),1);
 await page.keyboard.down('d');await page.waitForTimeout(180);await page.keyboard.up('d');
 await page.goto(base+'/character-preview.html');await page.waitForSelector('canvas');await page.goto(base+'/dialogue-suggestions.html');await page.selectOption('#suggestion-character','jarda');assert.equal(await page.locator('#suggestion-character option:checked').textContent(),'DžejTý');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('PASS clean distribution, no developer files or external browser requests, playable game, gallery, same-origin SQLite API, feedback, private moderation and cross-origin rejection.');
}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());db.close();await fs.rm(out,{recursive:true,force:true});}
