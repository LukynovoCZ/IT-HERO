const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await browser.newPage(),errors=[];p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;e.sapNextAttack=Infinity;});s.lastHit=Infinity;s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;
 // Accelerate walking only; use actual gravity, jumps, terrain and patrol decisions.
 ITHeroOldBadger.config.walkSpeed=140;window.stats={min:500,max:500,jumps:0,inside:false};s.events.on('postupdate',()=>{const e=s.oldBadger.state.entity;if(!e?.body?.enable)return;stats.min=Math.min(stats.min,e.x);stats.max=Math.max(stats.max,e.x);if(e.body.velocity.y<0)stats.jumps++;for(const o of s.obstacles.getChildren()){const b=o.body;if(b?.enable&&e.body.left<b.right-2&&e.body.right>b.left+2&&e.body.bottom>b.top+3&&e.body.top<b.bottom-3)stats.inside=true;}});});
 for(const floor of [0,3]){
  await p.evaluate(floor=>{s.oldBadger.clear();s.floor=floor;s.player.body.reset(88,4320-floor*485-40);s.player.setVelocity(0);stats={min:500,max:500,jumps:0,inside:false};assertSpawn=s.oldBadger.spawn();},floor);
  assert(await p.evaluate(()=>assertSpawn));
  await p.waitForFunction(()=>stats.max>860);await p.waitForFunction(()=>stats.min<100);
  const result=await p.evaluate(()=>({stats,bottom:s.oldBadger.state.entity.body.bottom,ground:4320-s.floor*485}));assert(result.stats.jumps>0);assert.equal(result.stats.inside,false,'Must jump over furniture, not walk inside it');assert(result.bottom<=result.ground+5);
  console.log(`PASS Senior master floor ${floor+1}: crosses both desks right and left, full-floor bounds, real jumps, no embedded body or fall`);
 }
 // Also verify a real desk crossing at the published walking speed.
 await p.evaluate(()=>{s.oldBadger.clear();s.floor=0;s.player.body.reset(88,4280);ITHeroOldBadger.config.walkSpeed=28;s.oldBadger.spawn();});
 await p.waitForFunction(()=>s.oldBadger.state.entity.phase!=='exit');
 await p.evaluate(()=>{const e=s.oldBadger.state.entity;e.body.reset(620,4280);e.setVelocity(0);e.direction=1;e.actionAt=0;e.nextJump=0;stats={min:620,max:620,jumps:0,inside:false};});
 await p.waitForFunction(()=>stats.max>760);
 assert(await p.evaluate(()=>stats.jumps>0&&!stats.inside));
 console.log('PASS default 28px/s pace: clears a desk using real gravity and jumps');
 assert.deepEqual(errors,[]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
