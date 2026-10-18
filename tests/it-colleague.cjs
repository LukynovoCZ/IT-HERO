const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const p=await b.newPage({viewport:{width:1280,height:900}});p.setDefaultTimeout(25000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 assert(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemies.clear(true,true);return s.colleague.state.nextAt>=20000&&s.colleague.state.nextAt<=35000;}));
 for(const [source,kind,energy] of [['desk','coffee',1],['door','candy',2],['desk','candy',5]]){
 assert(await p.evaluate(({source,kind,energy})=>{const s=window.__testGame.scene.getScene('ITGame');s.colleague.changeFloor();s.player.body.reset(88,4280);s.player.setVelocity(0);s.energy=energy;s.colleague.state.nextAt=Infinity;return s.colleague.spawn({source,kind});},{source,kind,energy}));
 assert(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const v=s.colleague.state.visit;return !v.sprite.body&&!s.enemies.contains(v.sprite)&&s.colleague.safe(v.dropX,s.floor);}));
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').colleague.items.countActive()===1);
 await p.screenshot({path:`/tmp/it-hero-tests/colleague-${kind}.png`});
 await p.keyboard.press('Escape');
 const times=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return [s.colleague.state.clock,s.playTime];});
 await p.waitForTimeout(250);
 assert.deepEqual(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return [s.colleague.state.clock,s.playTime];}),times);
 await p.keyboard.press('Escape');
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),item=s.colleague.items.getChildren()[0];s.player.body.reset(item.x,4320-40);s.player.setVelocity(0);});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').colleague.items.countActive()===0);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').energy),Math.min(5,energy+1));
 await p.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').colleague.state.visit);
 }
 // Own gift blinks and expires after 10 seconds plus 2 seconds of blinking without affecting old helper gifts.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(88,4280);s.colleague.spawn({source:'door',kind:'candy'});});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').colleague.items.countActive()===1);
 const expiry=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),c=s.colleague,item=c.items.getChildren()[0];c.state.clock=item.getData('expires')-1800;c.update(0);const first=item.alpha;c.update(150);return {blink:first!==item.alpha,label:item.getData('label').alpha===item.alpha,lifetime:item.getData('expires')-(c.state.visit?.started||0)};});
 assert(expiry.blink&&expiry.label);
 await p.evaluate(()=>{const c=window.__testGame.scene.getScene('ITGame').colleague;c.state.clock=c.items.getChildren()[0].getData('expires');c.update(0);});
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').colleague.items.countActive()),0);
 // Reachable placement on every floor; no hostile or player-shot collision body.
 assert(await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');for(let floor=0;floor<9;floor++){s.floor=floor;s.colleague.changeFloor();if(!s.colleague.spawn({kind:'coffee'}))return false;const v=s.colleague.state.visit;if(!s.colleague.safe(v.dropX,floor))return false;}s.colleague.changeFloor();s.floor=0;return true;}));
 // Automatic appearance uses the new clock; changing floor removes visit and item.
 await p.evaluate(()=>{const c=window.__testGame.scene.getScene('ITGame').colleague;c.state.nextAt=c.state.clock;c.update(1);});
 assert(await p.evaluate(()=>!!window.__testGame.scene.getScene('ITGame').colleague.state.visit));
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').colleague.items.countActive()===1);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(s.doors[0].x,4280);s.player.setVelocity(0);});
 await p.keyboard.down('s');await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').floor===1);await p.keyboard.up('s');
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.energy=1;s.spawnHelper('lift','beer');});
 assert(await p.evaluate(()=>{const c=window.__testGame.scene.getScene('ITGame').colleague;return !c.state.visit&&c.items.countActive()===0;}));
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').aidItems.countActive()>0);
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.collectAid(s.aidItems.getChildren()[0]);});
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').energy),5);
 assert.deepEqual(errors,[]);console.log('PASS IT colleague: own 20–35s clock, desk/door visits, neutral sprite, actual coffee/candy +1 pickups and cap, pause, blink/expiry, safe placements on all floors, automatic spawn, floor cleanup; old helper still heals to full.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
