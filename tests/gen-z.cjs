const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});
 assert(await p.evaluate(()=>{const s=__g.scene.getScene('ITGame'),n=s.genZ.state.nextAt;return n>=25000&&n<=45000&&s.genZ.state.clock===0;}));await p.waitForTimeout(180);assert.equal(await p.evaluate(()=>__g.scene.getScene('ITGame').genZ.state.clock),0);
 await p.keyboard.press('Enter');await p.waitForFunction(()=>__g.scene.getScene('ITGame').gameState==='playing');
 assert(await p.evaluate(()=>{const s=__g.scene.getScene('ITGame');return Array.from({length:65},(_,i)=>160+i*10).some(x=>s.genZ.safe(x));}),'A safe spawn must exist in the real first-floor layout with live enemies');
 await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');s.enemies.clear(true,true);s.enemyShots.clear(true,true);s.energy=5;s.colleague.state.nextAt=Infinity;s.nextHelperAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.lastHit=-Infinity;window.z=s.genZ;});
 const geometry=await p.evaluate(()=>{return ITHeroGenZ.variants.map(v=>{const f=z.frames[v];return Object.values(f).map(k=>{const c=s.textures.get(k).getSourceImage(),d=c.getContext('2d').getImageData(0,0,64,80).data;let bottom=0,top=80;for(let y=0;y<80;y++)for(let x=0;x<64;x++)if(d[(y*64+x)*4+3]){bottom=y;top=Math.min(top,y);}return {width:c.width,height:c.height,bottom,top,corner:d[3]};});});});
 assert(geometry.flat().every(f=>f.width===64&&f.height===80&&f.bottom===79&&f.top===4&&f.corner===0));
 assert(await p.evaluate(()=>!z.spawn({x:81})&&!z.spawn({x:500})&&!z.spawn({x:330})&&!z.spawn({x:85})&&z.safe(240)));
 await p.evaluate(()=>s.coffees.getChildren().slice().forEach(i=>{i.getData('steam')?.destroy();i.destroy();}));
 for(const variant of ['girl','boy']){
  await p.evaluate(variant=>{z.clear();s.player.body.reset(82,4280);s.player.setVelocity(0);window.spawned=z.spawn({x:240,variant});},variant);assert(await p.evaluate(()=>spawned&&!z.spawn({x:240,variant:'boy'})));
  await p.waitForFunction(()=>z.state.entity?.phase==='block');
  const start=await p.evaluate(()=>{window.e=z.state.entity;return {energy:s.energy,score:s.score,until:e.blockUntil-z.state.clock,box:[e.body.width,e.body.height],variant:e.variant,nextAt:z.state.nextAt};});assert(start.until>4700&&start.until<=8000);assert.deepEqual(start.box,[26,64]);assert.equal(start.variant,variant);
  await p.screenshot({path:`/tmp/it-hero-tests/gen-z-${variant}.png`});
  const pose=await p.evaluate(()=>e.texture.key);await p.waitForFunction(key=>e.texture.key!==key,pose);
  // Actual side contact blocks horizontal movement without damage or knockback.
  await p.evaluate(()=>{s.player.body.reset(180,4280);s.player.setVelocity(0);});await p.waitForFunction(()=>s.player.body.blocked.down);await p.keyboard.down('d');await p.waitForFunction(()=>s.player.body.touching.right);await p.keyboard.up('d');
  const side=await p.evaluate(()=>({energy:s.energy,vy:s.player.body.velocity.y,feet:s.player.body.bottom,x:s.player.x}));assert(side.energy===5&&side.vy>=0&&side.vy<=40,JSON.stringify(side));
  const collidingX=await p.evaluate(()=>s.player.x);await p.keyboard.down('d');await p.keyboard.press('w');await p.waitForFunction(()=>s.player.x>270);await p.keyboard.up('d');assert(await p.evaluate(x=>s.player.x>x+30,collidingX));
  // Real projectiles pass straight through; neither NPC nor shot is removed on contact.
  for(const key of ['floppy','cd']){
   await p.evaluate(key=>{s.player.body.reset(82,4280);s.player.setVelocity(0);window.shot=s.playerShots.create(195,4292,key).setVelocity(230,0).setData('expires',s.time.now+2000).setData('damage',2);shot.body.setAllowGravity(false);window.crossed=false;
    const watch=()=>{if(shot.active&&shot.body.center.x>260){crossed=true;s.physics.world.off('worldstep',watch);}else if(!shot.active)s.physics.world.off('worldstep',watch);};s.physics.world.on('worldstep',watch);
   },key);
   await p.waitForFunction(()=>crossed);assert(await p.evaluate(()=>e.active&&z.state.entity===e));await p.evaluate(()=>shot.destroy());
  }
  await p.keyboard.press('Escape');const paused=await p.evaluate(()=>[z.state.clock,e.blockUntil,e.x]);await p.waitForTimeout(200);assert.deepEqual(await p.evaluate(()=>[z.state.clock,e.blockUntil,e.x]),paused);await p.keyboard.press('Escape');
  await p.waitForFunction(()=>!z.state.entity);assert.equal(await p.evaluate(()=>z.group.countActive()),0);assert.equal(await p.evaluate(()=>z.state.nextAt),start.nextAt,'Normal departure preserves the 25–45s spawn cadence');assert.equal(await p.evaluate(()=>s.score),start.score);assert.equal(await p.evaluate(()=>s.energy),start.energy);
  console.log(`PASS ${variant}: transparent aligned poses, phone scrolling, actual collision, safe jump, floppy/CD pass-through, paused clock, timed exit and zero HP/score change`);
 }
 // Automatic spawning balances variants and resumes cleanly after floor changes.
 const automatic=await p.evaluate(()=>{s.player.body.reset(82,4280);z.state.nextAt=z.state.clock;z.update(1);const first=z.state.entity?.variant;z.clear();z.state.nextAt=z.state.clock;z.update(1);const second=z.state.entity?.variant;return {first,second};});assert(automatic.first&&automatic.second&&automatic.first!==automatic.second);
 await p.evaluate(()=>{s.floor=1;z.update(1);});assert(await p.evaluate(()=>!z.state.entity&&z.group.countActive()===0));
 const safety=await p.evaluate(()=>{let ok=true;for(const f of [4,8]){s.floor=f;ok&&=!z.spawn({x:240});}s.floor=2;ok&&=!z.safe(480);s.floor=3;const door=s.pacing.doors[0];door.body.body.enable=false;ok&&=!z.safe(600);s.floor=0;s.player.body.reset(82,4280);z.spawn({x:240});s.gameState='lose';z.update(1);return ok&&!z.state.entity;});assert(safety);
 await p.evaluate(()=>s.scene.restart());await p.waitForFunction(()=>__g.scene.getScene('ITGame').gameState==='menu');assert(await p.evaluate(()=>__g.scene.getScene('ITGame').genZ.group.countActive()===0));assert.deepEqual(errors,[]);
 console.log('PASS scheduler balance, safe spawn exclusions, carts/checkpoint/finale protection, floor/game-over/restart cleanup and no browser errors');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
