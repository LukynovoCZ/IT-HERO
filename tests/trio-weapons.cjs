const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
 await page.goto('http://127.0.0.1:8000');await page.locator('#game-action').waitFor({state:'visible'});await page.keyboard.press('Enter');
 for(const [id,keys] of [['security_guard',['handcuffs','fireball']],['hr_manager',['red-heel','red-tennis-ball']],['design_manager',['golf-club','calculator']]]) {
 const result=await page.evaluate(id=>{
  const s=window.__testGame.scene.getScene('ITGame'), e=s.enemyTrio.enemies.find(e=>e.kind===id);
  s.enemies.getChildren().forEach(other=>{other.lastAttack=Infinity;other.setVelocity(0);other.profile&&(other.profile.speed=0);});
  s.floor=e.floorIndex;s.enemyShots.clear(true,true);s.player.body.reset(e.x-90,e.body.bottom-40);s.player.setVelocity(0);s.energy=5;s.lastHit=-3000;
  const pool=e.profile.projectiles, shots=[];
  try {for(const weapon of pool) {e.profile.projectiles=[weapon];s.enemyTrio.attack(e);const shot=s.enemyShots.getChildren().at(-1);shots.push({key:shot.texture.key,floor:shot.getData('floor'),damage:shot.getData('damage')});}}finally{e.profile.projectiles=pool;}
  s.enemyShots.clear(true,true);s.player.body.reset(e.x,e.body.bottom-40);s.enemyTrio.contact(e);
  const effect=!!e.contactEffect,energy=s.energy;
  window.__effectEnemy=e;
  return {shots,effect,energy};
 },id);
 assert.deepEqual(result.shots.map(s=>s.key),keys);assert(result.shots.every(s=>s.damage===1));assert(result.effect);assert.equal(result.energy,4);
 await page.screenshot({path:`/tmp/it-hero-tests/${id}-special.png`});
 await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const e=window.__effectEnemy;s.floor=(e.floorIndex+1)%9;s.enemyTrio.update(e,s.time.now);s.enemyShots.clear(true,true);s.enemyTrio.attack(e);});
 assert(await page.evaluate(()=>!window.__effectEnemy.contactEffect));
 assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
 console.log(`PASS ${id}: both custom weapons, contact effect, one damage, cleanup and floor isolation`);
 }
 assert.deepEqual(errors,[]);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
