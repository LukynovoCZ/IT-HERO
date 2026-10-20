const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const errors=[];
 async function setup(options={}){const p=await b.newPage(options);p.setDefaultTimeout(18000);p.on('pageerror',e=>errors.push(e.message));await p.route('**/community-config.js*',r=>r.fulfill({contentType:'text/javascript',body:'window.ITHeroCommunityConfig={apiBaseUrl:""};'}));await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').click();await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');s.lastHit=Infinity;s.energy=1;s.updateHUD();s.player.body.reset(130,4280);s.player.setVelocity(0);});await p.waitForFunction(()=>s.player.body.blocked.down);return p;}
 const p=await setup({viewport:{width:1280,height:900}});await p.keyboard.down('s');await p.waitForFunction(()=>__g.scene.isActive('ITOutdoor'));await p.keyboard.up('s');await p.evaluate(()=>window.o=__g.scene.getScene('ITOutdoor'));await p.waitForFunction(()=>o.player.body.blocked.down);await p.evaluate(()=>ITHeroOutdoor.config.rollChance=0);

 await p.evaluate(()=>o.items.clear(true,true));const stats=await p.evaluate(()=>[s.energy,s.score]);
 for(const [i,direction] of [[0,1],[1,-1]]){
  await p.evaluate(({i,direction})=>{const r=o.rabbits[i];o.player.body.reset(r.x-direction*10,410);o.player.setVelocity(0);o.update(0,0);if(!r.rabbitFlight)throw Error('Contact failed');}, {i,direction});
  assert.equal(await p.evaluate(i=>o.rabbits[i].rabbitFlight.direction,i),direction);
  await p.evaluate(()=>{o.player.body.reset(185,410);o.clock+=200;o.update(0,0);});assert(await p.evaluate(i=>Math.abs(o.rabbits[i].angle)>20,i));
  await p.keyboard.press('Escape');const paused=await p.evaluate(i=>[o.clock,o.rabbits[i].x,o.rabbits[i].y,o.rabbits[i].angle],i);await p.waitForTimeout(180);assert.deepEqual(await p.evaluate(i=>[o.clock,o.rabbits[i].x,o.rabbits[i].y,o.rabbits[i].angle],i),paused);await p.keyboard.press('Escape');
  await p.evaluate(()=>{o.clock+=1900;o.update(0,0);});assert.equal(await p.evaluate(i=>o.rabbits[i].visible,i),false);
 }
 assert.deepEqual(await p.evaluate(()=>[s.energy,s.score]),stats);assert.deepEqual(errors,[]);console.log('PASS both rabbits launch away on actual overlap, rotate and leave view once, pause freezes flight, player health/score unchanged.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
