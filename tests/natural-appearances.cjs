// Real running game: no forced spawn(), no altered clocks, no disabled enemies.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
require('node:fs').mkdirSync('/tmp/it-hero-tests',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1100,height:850}});const errors=[],failed=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});
 await p.evaluate(()=>{window.__natural={};window.__monitor=setInterval(()=>{const s=window.__testGame.scene.getScene('ITGame');if(s.gameState!=='playing')return;
 if(s.helperVisit?.sprite.alpha>0.5&&!window.__natural.old)window.__natural.old=s.helperVisit.started;
 if(s.colleague.state.visit?.sprite.alpha>0.5&&!window.__natural.colleague)window.__natural.colleague=s.colleague.state.visit.started;
 if(s.oldBadger.state.entity?.alpha>0.5&&!window.__natural.badger)window.__natural.badger=s.oldBadger.state.entity.started;
 },50);});
 await p.keyboard.press('Enter');
 // Crouch using the normal controls at the starting stairs to dodge live fire.
 await p.keyboard.down('s');
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').colleague.state.visit?.sprite.alpha>0.5,{},{timeout:65000});
 await p.screenshot({path:'/tmp/it-hero-tests/natural-colleague.png'});
 try {await p.waitForFunction(()=>window.__natural.badger>0,{},{timeout:65000});} catch(error){console.log(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return {seen:window.__natural,state:s.gameState,energy:s.energy,player:s.player.x,clock:s.oldBadger.state.clock,next:s.oldBadger.state.nextAt,badger:s.oldBadger.state.entity?{alpha:s.oldBadger.state.entity.alpha,phase:s.oldBadger.state.entity.phase}:null,helper:s.helperVisit?{source:s.helperVisit.source,started:s.helperVisit.started}:null,obstacles:s.obstacles.getChildren().filter(o=>o.body.left<522&&o.body.right>478).map(o=>({left:o.body.left,right:o.body.right,top:o.body.top,bottom:o.body.bottom}))};}));throw error;}
 await p.screenshot({path:'/tmp/it-hero-tests/natural-badger.png'});
 const seen=await p.evaluate(()=>{clearInterval(window.__monitor);return {...window.__natural,state:window.__testGame.scene.getScene('ITGame').gameState};});
 assert(seen.old>=7000&&seen.old<8000);assert(seen.colleague>=20000&&seen.colleague<36000);
 assert(seen.badger>=25000&&seen.badger<55000);assert.equal(seen.state,'playing');assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 console.log('PASS unmodified gameplay clocks and active enemies: old helper, IT colleague and badger appeared automatically.',JSON.stringify(seen));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
