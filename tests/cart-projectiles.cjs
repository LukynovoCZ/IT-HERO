const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__game=new Phaser.Game({')});});
 await page.goto('http://127.0.0.1:8000');await page.locator('#game-action').waitFor({state:'visible'});await page.keyboard.press('Enter');
 await page.evaluate(()=>{window.s=__game.scene.getScene('ITGame');s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;e.sapNextAttack=Infinity;});s.lastHit=Infinity;s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;});
 for(const floor of [2,7])for(const [group,texture] of [['playerShots','floppy'],['playerShots','cd'],['enemyShots','handcuffs'],['enemyShots','fireball']]){
  await page.evaluate(({floor,group,texture})=>{s.floor=floor;s.updateHUD();s.enemyShots.clear(true,true);s.playerShots.clear(true,true);s.player.body.reset(160,4320-floor*485-40);s.player.setVelocity(0);window.cart=s.pacing.carts.find(c=>c.floor===floor).sprite;window.shot=s[group].create(cart.x+50,cart.y,texture);shot.body.setAllowGravity(false);shot.setVelocityX(-200);shot.setData('floor',floor).setData('expires',s.time.now+5000);},{floor,group,texture});
  await page.waitForFunction(()=>!shot.active);
  const alive=await page.evaluate(()=>({active:cart.active,body:!!cart.body}));assert.deepEqual(alive,{active:true,body:true},`Floor ${floor+1}: ${group}/${texture} must destroy the projectile, not the cart`);
  const before=await page.evaluate(()=>({clock:s.time.now,x:cart.x}));await page.waitForTimeout(250);
  assert(await page.evaluate(before=>s.time.now>before.clock+100&&Math.abs(cart.x-before.x)>1,before),'Game and cart must keep moving after impact');
  console.log(`PASS floor ${floor+1}: ${group}/${texture} impact removes shot and preserves moving cart`);
 }
 // Jump and stairs must remain usable after the projectile collisions.
 await page.evaluate(()=>{s.floor=2;s.player.body.reset(800,3310);s.player.setVelocity(0);});await page.waitForFunction(()=>s.player.body.blocked.down);
 await page.keyboard.press('w');await page.waitForFunction(()=>s.player.body.velocity.y<0);await page.waitForFunction(()=>s.player.body.blocked.down);
 await page.keyboard.down('d');await page.waitForFunction(()=>s.player.x>850);await page.keyboard.up('d');await page.keyboard.down('s');await page.waitForFunction(()=>s.floor===3&&!s.transitioning);await page.keyboard.up('s');
 assert.deepEqual(errors,[]);console.log('PASS jump, walk and third-floor stairs after impacts; no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
