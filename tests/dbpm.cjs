const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const q=await r.fetch();await r.fulfill({response:q,body:(await q.text()).replace('new Phaser.Game({','window.__game=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 const initial=await p.evaluate(()=>{
  window.s=__game.scene.getScene('ITGame');window.e=s.dbpm.actors[0];window.ground=4320-3*485;
  s.enemies.getChildren().filter(o=>o!==e).forEach(o=>{s.pacing.cancel(o);o.body.enable=false;o.lastAttack=Infinity;o.sapNextAttack=Infinity;});s.enemyShots.clear(true,true);
  s.colleague.state.nextAt=Infinity;s.nextHelperAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.lastHit=Infinity;
  const inactive=!e.body.enable&&!e.active;s.floor=3;s.updateHUD();s.cameras.main.setScroll(0,ground-420);s.player.body.reset(900,ground-40);s.player.setVelocity(0);s.dbpm.tick(0);
  const interval=e.dbpm.nextDemand-s.dbpm.state.clock;e.dbpm.nextAttack=Infinity;e.dbpm.nextDemand=Infinity;
  return {inactive,count:s.dbpm.actors.length,hp:e.hp,score:e.profile.score,interval,poses:Object.keys(e.poses)};
 });assert(initial.inactive);assert.equal(initial.count,3);assert.equal(initial.hp,6);assert.equal(initial.score,250);assert(initial.interval>=12000&&initial.interval<=18000);assert(initial.poses.includes('jump')&&initial.poses.includes('demand')&&initial.poses.includes('hit')&&initial.poses.includes('defeat'));
 await p.waitForFunction(()=>e.body.velocity.y<0&&e.texture.key.endsWith('-jump'));
 await p.waitForFunction(()=>e.x>760);assert(await p.evaluate(()=>e.body.bottom<=ground+5));
 await p.evaluate(()=>{s.player.body.reset(60,ground-40);s.player.setVelocity(0);});await p.waitForFunction(()=>e.x<200);assert(await p.evaluate(()=>e.body.bottom<=ground+5));
 console.log('PASS DBPM pursuit: actual physics across both desks and timed door in both directions, visible jumps, no floor fall or limited patrol.');
 // Pursuit above uses normal speed. Isolated attack fixtures keep their exact range
 // while waiting for gravity to settle, independent of browser rendering speed.
 const place=async(playerX=385,enemyX=450)=>{
  await p.evaluate(({playerX,enemyX})=>{s.enemyShots.clear(true,true);e.dbpm.attack?.warning.destroy();e.dbpm.attack=null;e.dbpm.nextDemand=Infinity;e.dbpm.nextAttack=Infinity;e.dbpm.hitUntil=0;e.dbpmSpeed=0;e.body.reset(enemyX,ground-48);e.setVelocity(0);s.player.body.reset(playerX,ground-40);s.player.setVelocity(0);},{playerX,enemyX});
  await p.waitForFunction(()=>e.body.blocked.down&&s.player.body.blocked.down);
 };
 await place();await p.evaluate(()=>{s.energy=5;s.lastHit=-Infinity;e.dbpm.nextAttack=0;s.enemyTrio.attack(e);});
 assert.equal(await p.evaluate(()=>e.dbpm.attack.type),'melee');assert.equal(await p.evaluate(()=>s.enemyShots.countActive()),0);
 await p.waitForFunction(()=>s.energy===4);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>s.energy),4);
 await place();await p.evaluate(()=>{s.lastHit=-Infinity;e.dbpm.nextAttack=0;s.enemyTrio.attack(e);s.player.body.reset(515,ground-40);s.player.setVelocity(0);});await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>s.energy),4,'Melee must not hit behind its locked facing');
 await place();await p.evaluate(()=>{s.lastHit=-Infinity;e.dbpm.nextAttack=0;s.enemyTrio.attack(e);});await p.keyboard.press('w');await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>s.energy),4,'Jump must evade the baguette');
 console.log('PASS DBPM melee: readable windup, one energy via shared collision, locked direction and real jump evade.');
 for(const [type,index] of [['laptop',0],['baguette',1]]){
  await place(260,140);await p.evaluate(index=>{s.energy=5;s.lastHit=-Infinity;e.dbpm.throwCount=index;e.dbpm.nextAttack=0;s.enemyTrio.attack(e);},index);
  assert.equal(await p.evaluate(()=>e.dbpm.attack.type),type);
  await p.waitForFunction(()=>s.dbpm.state.shots.size>0);
  const shot=await p.evaluate(()=>{const shot=[...s.dbpm.state.shots][0];return {key:shot.texture.key,vx:shot.body.velocity.x,vy:shot.body.velocity.y,gravity:shot.body.gravity.y+s.physics.world.gravity.y,spin:shot.body.angularVelocity,floor:shot.getData('floor')};});
  assert.equal(shot.key,`dbpm-${type}`);assert(shot.vx>0&&shot.spin>0&&shot.gravity>0);assert.equal(shot.floor,3);
  await p.waitForFunction(()=>s.energy===4);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>s.energy),4);
 }
 // Mirrored throw, actual table collision, active-time pause and expiry.
 await place(140,450);await p.evaluate(()=>{s.lastHit=Infinity;e.dbpm.throwCount=0;e.dbpm.nextAttack=0;s.enemyTrio.attack(e);});await p.waitForFunction(()=>s.dbpm.state.shots.size>0);
 const mirror=await p.evaluate(()=>{window.projectile=[...s.dbpm.state.shots][0];return {left:projectile.body.velocity.x<0,spin:projectile.body.angularVelocity<0,flip:projectile.flipX};});assert(mirror.left&&mirror.spin&&mirror.flip);
 await p.waitForFunction(()=>!projectile.active);assert.equal(await p.evaluate(()=>s.energy),4);
 await place(260,140);await p.evaluate(()=>{e.dbpm.nextAttack=0;s.enemyTrio.attack(e);s.togglePause();window.frozen=s.dbpm.state.clock;});await p.waitForTimeout(600);assert(await p.evaluate(()=>s.dbpm.state.clock===frozen&&!!e.dbpm.attack&&!e.dbpm.attack.fired));await p.keyboard.press('Escape');await p.waitForFunction(()=>s.dbpm.state.shots.size>0);
 await p.evaluate(()=>{e.dbpm.nextAttack=Infinity;s.dbpm.state.clock+=3000;s.dbpm.tick(0);});assert.equal(await p.evaluate(()=>s.dbpm.state.shots.size),0);
 console.log('PASS DBPM throws: distinct laptop/baguette physics, actual damage, left/right rotation, environment collision, paused windup and lifetime.');
 // Demand created through special attack. A ground position leaves room on both sides.
 await place(540,140);
 const special=await p.evaluate(()=>{s.dialogue.clear();s.dialogue.state.next.clear();s.dialogue.state.gapUntil=0;e.dbpm.nextAttack=Infinity;e.dbpm.nextDemand=s.dbpm.state.clock;s.enemyTrio.update(e,s.time.now);return {type:e.dbpm.attack?.type,next:e.dbpm.nextDemand-s.dbpm.state.clock};});assert.equal(special.type,'demand');assert(special.next>=12000&&special.next<=18000);
 await p.waitForFunction(()=>!!s.dbpm.state.demand);
 const demand=await p.evaluate(()=>{const d=s.dbpm.state.demand;return {hp:d.hp,x:d.image.x,distance:Math.abs(d.image.x-s.player.x),doors:s.doors.filter(o=>o.floor===3).every(o=>Math.abs(o.x-d.image.x)>70),duplicate:s.dbpm.spawnDemand(e),line:e.dbpm.speech.text};});assert.equal(demand.hp,2);assert(demand.distance>=110&&demand.distance<=260&&demand.doors&&!demand.duplicate);assert(['Dycky DEMAND!','Tak uděláme novou tabulku,ne?'].includes(demand.line));
 await p.screenshot({path:'/tmp/it-hero-tests/dbpm-demand.png'});
 await p.keyboard.down('a');await p.waitForFunction(()=>s.player.x<520);await p.keyboard.press('w');await p.waitForFunction(()=>s.player.x<350);await p.keyboard.up('a');
 assert(await p.evaluate(()=>s.dbpm.state.demand?.hp===2),'Crossing demand must not damage it or trap the player');
 await p.evaluate(()=>{s.player.body.reset(540,ground-40);s.player.setVelocity(0);});await p.waitForFunction(()=>s.player.body.blocked.down);
 await p.evaluate(()=>{s.weapon='floppy';s.facing=-1;s.fire();});await p.waitForFunction(()=>s.dbpm.state.demand?.hp===1);await p.waitForTimeout(260);await p.evaluate(()=>s.fire());await p.waitForFunction(()=>!s.dbpm.state.demand);assert(await p.evaluate(()=>s.dbpm.state.fragments.length>0));
 await p.evaluate(()=>{s.dbpm.spawnDemand(e);s.weapon='cd';s.facing=-1;s.fire();});await p.waitForFunction(()=>!s.dbpm.state.demand);
 await p.evaluate(()=>{e.dbpm.nextDemand=Infinity;s.dbpm.spawnDemand(e);window.demandObject=s.dbpm.state.demand.image;s.togglePause();window.remaining=s.dbpm.state.demand.expires-s.dbpm.state.clock;});await p.waitForTimeout(120);assert(await p.evaluate(()=>s.dbpm.state.demand.expires-s.dbpm.state.clock===remaining));await p.keyboard.press('Escape');await p.evaluate(()=>{s.dbpm.state.clock=s.dbpm.state.demand.expires;s.dbpm.tick(0);});assert(await p.evaluate(()=>!demandObject.active&&!s.dbpm.state.demand));
 console.log('PASS DBPM DEMAND: scheduled special/dialogue, safe single ground obstacle, real two-floppy destruction, fragments, paused 5s expiry and complete collision removal.');
 // Every exact phrase is reachable; HUD reacts, CD counts twice, +250 once.
 await place(540,140);
 const dialogue=await p.evaluate(()=>{const wanted=['teraz som plně vytížený','som šel oba po povrche','teď už jen doleštime ten diamant','u zákazníka máte připraven cervenej koberec','navrhuji další meeting na tohle téma','Dycky DEMAND!','Tak uděláme novou tabulku,ne?'];const lines=ITHeroDialogue.characters.find(c=>c.id==='dbpm').groups.flatMap(g=>g.lines);return {exact:wanted.every(x=>lines.includes(x))&&lines.length===17};});assert(dialogue.exact);
 for(const group of ['chase','attack','hit','demand']){assert(await p.evaluate(group=>{s.dialogue.clear();s.dialogue.state.next.clear();s.dialogue.state.gapUntil=0;e.dbpm.nextSpeech=0;s.dbpm.say(e,group);const first=e.dbpm.speech;s.dbpm.say(e,group);return first===e.dbpm.speech&&e.dbpm.speech.active;},group));}
 const before=await p.evaluate(()=>{s.dbpm.spawnDemand(e);e.hp=6;return s.score;});
 for(const [weapon,hp] of [['floppy',5],['cd',3],['cd',1],['floppy',0]]){
  await p.evaluate(weapon=>{const shot=s.playerShots.create(e.x,e.y,weapon).setData('damage',weapon==='cd'?2:1);s.hitEnemy(shot,e);s.dbpm.tick(0);},weapon);assert.equal(await p.evaluate(()=>e.hp),hp);if(hp>0)assert((await p.evaluate(()=>s.dbpm.healthLabel.text)).endsWith(`${hp}/6`));
 }
 assert.equal(await p.evaluate(()=>s.score),before+250);assert(await p.evaluate(()=>e.defeated&&!e.body.enable&&!s.dbpm.state.demand&&s.dbpm.state.shots.size===0));
 await p.evaluate(()=>{const shot=s.playerShots.create(e.x,e.y,'cd').setData('damage',2);s.hitEnemy(shot,e);shot.destroy();});assert.equal(await p.evaluate(()=>s.score),before+250);
 await p.waitForFunction(()=>!e.active);
 assert.deepEqual(errors,[]);console.log('PASS DBPM health/dialogue/defeat: all original and corporate texts plus arrival line, no duplicate bubbles, floppy/CD damage, one 250-point award, defeat and owned-object cleanup.');
 // New run: floor/end cleanup and actual checkpoint restore retain original systems.
 await p.evaluate(()=>{s.scene.restart();});await p.waitForFunction(()=>__game.scene.getScene('ITGame').gameState==='menu');await p.keyboard.press('Enter');
 await p.evaluate(()=>{window.s=__game.scene.getScene('ITGame');window.e=s.dbpm.actors[0];s.floor=3;s.dbpm.tick(0);s.player.body.reset(540,ground-40);e.body.reset(140,ground-48);s.dbpm.spawnDemand(e);e.dbpm.nextAttack=0;s.enemyTrio.attack(e);s.floor=4;s.dbpm.tick(0);});
 assert(await p.evaluate(()=>!s.dbpm.state.demand&&!e.dbpm.attack&&!e.dbpm.speech&&!e.body.enable&&!e.active&&s.dbpm.state.shots.size===0));
 await p.evaluate(()=>{s.floor=3;s.dbpm.tick(0);s.player.body.reset(540,ground-40);e.body.reset(140,ground-48);s.dbpm.spawnDemand(e);s.energy=1;s.lastHit=-Infinity;s.takeDamage(s.player.x+80);s.dbpm.tick(0);});
 assert(await p.evaluate(()=>!s.dbpm.state.demand&&s.dbpm.state.shots.size===0&&!e.body.enable&&!e.active));
 assert.deepEqual(errors,[]);console.log('PASS DBPM lifecycle: floor change, reentry intervals, death and restart clear pending attacks, collision bodies, speech and projectiles.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
