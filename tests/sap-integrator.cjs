const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const p=await b.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 const init=await p.evaluate(()=>{
 const s=window.__testGame.scene.getScene('ITGame'),e=s.enemyTrio.enemies.find(e=>e.kind==='sap_integrator');window.__sap=e;
 const ground=4320-4*485;s.floor=4;s.updateHUD();
 s.enemies.getChildren().forEach(other=>{other.lastAttack=Infinity;other.body.enable=false;});e.body.enable=true;
 e.body.reset(450,ground-40);e.baseX=450;e.profile.speed=0;e.sapNextAttack=Infinity;
 s.player.body.reset(390,ground-40);s.player.setVelocity(0);s.physics.world.pause();s.energy=5;s.lastHit=-3000;
 s.enemyTrio.update(e,s.time.now);e.sapNextAttack=Infinity;
 return {floor:e.floorIndex,hp:e.hp,score:e.profile.score,final:s.enemies.getChildren().some(e=>e.kind==='manager'&&e.floorIndex===8)};
 });
 assert.deepEqual(init,{floor:4,hp:8,score:500,final:true});
 // All distance-selected attacks, both directions. Physics stays paused to inspect trajectories.
 for(const direction of [-1,1])for(const [distance,type,count] of [[55,'melee',0],[150,'sap-helmet',1],[310,'sap-pen',3]]){
 await p.evaluate(({direction,distance})=>{
 const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;
 ITHeroSAP.cancel(e);e.sapNextAttack=0;e.hitUntil=0;s.energy=5;s.lastHit=-3000;s.enemyShots.clear(true,true);
 s.player.body.reset(e.x+direction*distance,e.body.bottom-40);s.enemyTrio.attack(e);e.sapNextAttack=Infinity;
 },{direction,distance});
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').energy),5);
 await p.waitForFunction(()=>!window.__sap.sapBusy);
 const result=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return {energy:s.energy,shots:s.enemyShots.getChildren().map(s=>({key:s.texture.key,vx:s.body.velocity.x,gravity:s.body.allowGravity,height:s.body.height}))};});
 assert.equal(result.shots.length,count);
 if(type==='melee')assert.equal(result.energy,3);
 else {assert(result.shots.every(s=>s.key===type&&Math.sign(s.vx)===direction));if(type==='sap-helmet')assert(result.shots[0].gravity);else assert(result.shots.every(s=>s.height===5));}
 }
 // Jump above the delayed pump and interrupt another attack with an actual damage event.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;ITHeroSAP.cancel(e);e.sapNextAttack=0;s.energy=5;s.lastHit=-3000;s.player.body.reset(e.x+50,e.body.bottom-40);s.enemyTrio.attack(e);s.player.body.reset(e.x+50,e.body.bottom-120);});
 await p.waitForFunction(()=>!window.__sap.sapBusy);assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').energy),5);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;ITHeroSAP.cancel(e);e.sapNextAttack=0;s.player.body.reset(e.x+310,e.body.bottom-40);s.enemyShots.clear(true,true);s.enemyTrio.attack(e);s.hitEnemy(s.playerShots.create(e.x,e.y,'floppy').setData('damage',1),e);});
 await p.waitForTimeout(850);assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
 // Leaving a floor also cancels a pending burst.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;e.hitUntil=0;e.sapNextAttack=0;s.enemyTrio.attack(e);s.floor=3;s.enemyTrio.update(e,s.time.now);});
 await p.waitForTimeout(850);assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
 // Pausing cancels windup rather than leaving the boss stuck in a busy state.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;s.floor=4;e.hitUntil=0;e.sapNextAttack=0;s.player.body.reset(e.x+310,e.body.bottom-40);s.enemyTrio.attack(e);s.gameState='paused';});
 await p.waitForFunction(()=>!window.__sap.sapBusy);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
 await p.evaluate(()=>{window.__testGame.scene.getScene('ITGame').gameState='playing';});
 // Real helmet and pen overlaps use the existing collision/damage pipeline.
 for (const weapon of ['helmet','pens']) {
 await p.evaluate(weapon=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;
 s.floor=4;ITHeroSAP.cancel(e);e.hitUntil=0;e.sapNextAttack=0;e.body.reset(450,2340);
 s.player.body.reset(540,2340);s.player.setVelocity(0);s.energy=5;s.lastHit=-3000;s.enemyShots.clear(true,true);
 s.physics.world.resume();ITHeroSAP.attack(s,e,(enemy,pose)=>enemy.setTexture(enemy.poses[pose]),weapon);e.sapNextAttack=Infinity;
 },weapon);
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.physics.world.pause();s.enemyShots.clear(true,true);ITHeroSAP.cancel(window.__sap);});
 }
 // Actual CD collisions on a clear path; four CDs finish an eight-health boss.
 const score=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__sap;s.floor=4;e.hp=8;e.hitUntil=0;e.sapNextAttack=Infinity;e.body.reset(450,2340);s.player.body.reset(390,2340);s.player.setVelocity(0);s.facing=1;s.weapon='cd';s.physics.world.resume();s.energy=5;s.lastHit=s.time.now;return s.score;});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 for(const hp of [6,4,2,0]){await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').fire());await p.waitForFunction(hp=>window.__sap.hp===hp,hp);await p.waitForTimeout(260);}
 await p.waitForFunction(()=>!window.__sap.active);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').score),score+500);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(s.doors[4].x,2340);s.player.setVelocity(0);});
 await p.keyboard.down('s');await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').floor===5);await p.keyboard.up('s');
 assert.deepEqual(errors,[]);console.log('PASS SAP: placement, preserved final boss, range selection left/right, delayed pump damage/jump dodge, helmet arc, three thin fast pens, interrupt/floor cancellation, actual CD defeat +500 and stairs to floor 6.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
