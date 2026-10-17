const {chromium}=require('playwright');const assert=require('node:assert/strict');
require('node:fs').mkdirSync('/tmp/it-hero-tests',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1100,height:850}});p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 const init=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),c=s.oldBadger;const range=c.state.nextAt>=25000&&c.state.nextAt<=45000;
 s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;});s.colleague.state.nextAt=Infinity;s.nextHelperAt=Infinity;
 s.player.body.reset(500,4280);const unsafe=c.spawn();s.player.body.reset(100,4280);s.player.setVelocity(0);c.state.nextAt=c.state.clock;c.update(1);window.__badger=c.state.entity;
 return {range,unsafe,automatic:!!c.state.entity,duplicate:c.spawn()};});
 assert.deepEqual(init,{range:true,unsafe:false,automatic:true,duplicate:false});
 await p.screenshot({path:'/tmp/it-hero-tests/badger-elevator.png'});
 await p.waitForFunction(()=>window.__badger.phase==='idle');
 assert(await p.evaluate(()=>window.__badger.body.enable&&window.__badger.body.immovable&&!window.__badger.door));
 await p.waitForFunction(()=>Math.abs(window.__badger.body.velocity.x)>0);
 const x=await p.evaluate(()=>window.__badger.x);await p.waitForFunction(x=>Math.abs(window.__badger.x-x)>5,x);
 // Pause freezes the entity's own clock and movement.
 await p.keyboard.press('Escape');const pause=await p.evaluate(()=>{const c=window.__testGame.scene.getScene('ITGame').oldBadger;return [c.state.clock,c.state.entity.x];});await p.waitForTimeout(250);
 assert.deepEqual(await p.evaluate(()=>{const c=window.__testGame.scene.getScene('ITGame').oldBadger;return [c.state.clock,c.state.entity.x];}),pause);await p.keyboard.press('Escape');
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__badger;ITHeroOldBadger.config.walkSpeed=0;e.body.reset(500,4280);e.setVelocity(0);e.baseX=500;});
 // Actual player fire, both weapons and directions. Target behind the shield stays unharmed.
 for(const direction of [1,-1])for(const weapon of ['floppy','cd']){
 const hp=await p.evaluate(({direction,weapon})=>{const s=window.__testGame.scene.getScene('ITGame');
 const enemy=s.enemies.getChildren().find(e=>e.kind==='secretary');window.__behind=enemy;
 enemy.body.enable=true;enemy.body.reset(direction===1?610:390,4280);enemy.body.moves=false;enemy.hp=8;enemy.lastAttack=Infinity;
 s.player.body.reset(direction===1?430:570,4280);s.player.setVelocity(0);s.facing=direction;s.weapon=weapon;s.lastShot=-3000;s.enemyShots.clear(true,true);s.playerShots.clear(true,true);s.fire();return enemy.hp;
 },{direction,weapon});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').playerShots.countActive()===0);
 assert.equal(await p.evaluate(()=>window.__behind.hp),hp);assert(await p.evaluate(()=>!window.__badger.stomped));
 }
 // Hostile projectile crosses the exact same body without impact or velocity changes.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');window.__behind.body.enable=false;s.player.body.reset(100,4280);
 window.__hostile=s.enemyShots.create(430,4280,'folder').setVelocity(300,0).setData('expires',s.time.now+2000);window.__hostile.body.setAllowGravity(false);});
 await p.waitForFunction(()=>window.__hostile.active&&window.__hostile.x>550);
 assert.equal(await p.evaluate(()=>window.__hostile.body.velocity.x),300);
 // Real lateral collision blocks passage and never damages either character.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemyShots.clear(true,true);s.energy=5;s.player.body.reset(430,4280);s.player.setVelocity(0);});
 await p.keyboard.down('d');await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.touching.right);await p.keyboard.up('d');
 assert(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.energy===5&&!window.__badger.stomped&&s.player.body.right<=window.__badger.body.left+2;}));
 // Touching while rising cannot defeat him.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(482,4260);s.player.setVelocity(0,-170);window.__rise=s.oldBadger.state.clock;});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').oldBadger.state.clock>window.__rise+60);
 assert(await p.evaluate(()=>!window.__badger.stomped));
 // Descending onto a MOVING badger, using Arcade's actual process callback.
 const score=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),e=window.__badger;ITHeroOldBadger.config.walkSpeed=28;e.direction=1;e.actionAt=0;e.blockUntil=0;
 s.player.body.reset(e.x+5,e.body.top-80);s.player.setVelocity(0,260);return s.score;});
 await p.waitForFunction(()=>window.__badger.stomped);
 const stomp=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return {score:s.score,bounce:s.player.body.velocity.y,body:window.__badger.body.enable,phase:window.__badger.phase};});
 assert.equal(stomp.score,score+150);assert(stomp.bounce<0);assert.equal(stomp.body,false);assert.equal(stomp.phase,'sink');
 await p.waitForFunction(()=>window.__badger.texture.key==='badger-stomp');await p.screenshot({path:'/tmp/it-hero-tests/badger-sink.png'});
 await p.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').oldBadger.state.entity);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').score),score+150);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').oldBadger.group.countActive()),0);
 // A live badger is removed on a real stair transition.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(100,4280);s.player.setVelocity(0);s.oldBadger.spawn();s.player.body.reset(s.doors[0].x,4280);});
 await p.keyboard.down('s');await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').floor===1);await p.keyboard.up('s');
 assert(await p.evaluate(()=>!window.__testGame.scene.getScene('ITGame').oldBadger.state.entity));
 // End game and scene restart clean entities, effects and registered colliders.
 await p.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').transitioning);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(100,3795);s.oldBadger.spawn();s.gameState='lose';s.oldBadger.update(0);});
 assert(await p.evaluate(()=>!window.__testGame.scene.getScene('ITGame').oldBadger.state.entity));
 await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').handleStart());
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
 assert(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return !s.oldBadger.state.entity&&!!s.colleague&&s.enemies.countActive()>0;}));
 assert.deepEqual(errors,[]);console.log('PASS old badger: automatic elevator, safe/single spawn, patrol, pause, CD/floppy blocking both ways and shielded target, hostile shots pass, harmless side/rising contact, moving stomp/bounce/sink/+150 once, stairs/end/restart cleanup.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
