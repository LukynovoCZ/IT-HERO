// Requires Playwright and Chromium; run with a local server on port 8000.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 require('node:fs').mkdirSync('/tmp/it-hero-tests',{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const method of ['Enter','button','canvas']) {
   const page=await browser.newPage(); const errors=[];const external=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000'))external.push(r.url());});
   // Expose the real game instance for assertions; all game logic runs unchanged.
   await page.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
   await page.goto('http://127.0.0.1:8000');
   const state=()=>page.evaluate(()=>window.__testGame.scene.getScene('ITGame').gameState);
   await page.waitForFunction(()=>window.__testGame?.scene.getScene('ITGame')?.overlay?.visible);
   assert.equal(await state(),'menu');
   assert.deepEqual(await page.evaluate(()=>{
     const s=window.__testGame.scene.getScene('ITGame');
     return ['character-art','office-art','exterior-art'].map(key=>s.textures.exists(key)&&s.textures.get(key).getSourceImage().width>100);
   }),[true,true,true],'All local graphics must load');
   if(method==='Enter')await page.keyboard.press('Enter');
   if(method==='button')await page.locator('#game-action').click();
   if(method==='canvas')await page.locator('canvas').click({position:{x:100,y:100}});
   await page.waitForTimeout(300);
   assert.equal(await state(),'playing');
   // Isolate input assertions from timed enemy knockback. Combat is verified below
   // and in security-guard.cjs with actual attacks enabled.
   await page.evaluate(()=>{
     const s=window.__testGame.scene.getScene('ITGame');
     s.enemyShots.clear(true,true);
     s.enemies.getChildren().forEach(e=>{e.lastAttack=Infinity;});
   });
   assert.equal(await page.locator('#game-action').isVisible(),false);
   const x=await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x);
   await page.keyboard.down('d');
   await page.waitForFunction(x=>window.__testGame.scene.getScene('ITGame').player.x>x+20,x);
   await page.keyboard.up('d');
   assert.ok(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x)>x+20,'Player must move after start');
   await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
   const groundY=await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.y);
   await page.keyboard.down('s');await page.waitForTimeout(80);
   assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.height),36);
   await page.keyboard.up('s');await page.waitForTimeout(80);
   assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.height),72);
   await page.keyboard.down('Space');
   await page.waitForFunction(y=>window.__testGame.scene.getScene('ITGame').player.y<y-20,groundY);
   await page.keyboard.up('Space');
   assert.ok(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.y)<groundY-20,'New hero sprite must jump');
   await page.keyboard.down('j');
   await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').lastShot>=0);
   await page.keyboard.up('j');
   assert.ok(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').lastShot)>=0,'Player must fire');
   await page.keyboard.press('Escape');assert.equal(await state(),'paused');
   await page.locator('#game-action').click();assert.equal(await state(),'playing');
   await page.waitForTimeout(500);
   assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
   await page.screenshot({path:`/tmp/it-hero-tests/${method}.png`});
   console.log(`PASS ${method}: start, movement, shooting, pause/resume, no JS errors or external requests`);
   await page.close();
  }
  const gamePage=await browser.newPage();gamePage.setDefaultTimeout(10000);const gameErrors=[];
  gamePage.on('pageerror',e=>gameErrors.push(e.message));
  await gamePage.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await gamePage.goto('http://127.0.0.1:8000');
  await gamePage.waitForFunction(()=>window.__testGame?.scene.getScene('ITGame')?.overlay?.visible);
  await gamePage.waitForTimeout(500);
  await gamePage.screenshot({path:'/tmp/it-hero-tests/exterior.png'});
  await gamePage.keyboard.press('Enter');
  assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').doors.length),9);
  assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').weapon),'floppy');
  // Keep enemies from interrupting the traversal test; transitions still use real keyboard input.
  await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemies.clear(true,true));
  for(let floor=0;floor<9;floor++) {
    console.log('Checking floor',floor+1);
    assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),floor);
    if(floor===2) {
      await gamePage.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const u=s.upgrades.getChildren()[0];s.player.body.reset(u.x,u.y);});
      await gamePage.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').weapon==='cd');
      await gamePage.keyboard.down('j');
      await gamePage.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').playerShots.getChildren().some(shot=>shot.active && shot.texture.key==='cd' && shot.getData('damage')===2));
      await gamePage.keyboard.up('j');
    }
    // E at the broken lift must not advance the floor.
    await gamePage.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(500,s.doors[s.floor].y-30);s.player.setVelocity(0,0);});
    await gamePage.keyboard.press('e');await gamePage.waitForTimeout(80);
    assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),floor);
    await gamePage.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const d=s.doors[s.floor];s.player.body.reset(d.x-(s.floor===8?54:0),d.y-45);s.player.setVelocity(0,0);});
    if(floor<8)await gamePage.keyboard.press('e');else await gamePage.keyboard.down('e');
    if(floor<8)await gamePage.waitForFunction(f=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===f+1&&!s.transitioning},floor);
    else {await gamePage.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='win');await gamePage.keyboard.up('e');}
  }
  await gamePage.locator('.score-again').click();
  await gamePage.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
  assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').weapon),'floppy');
  assert.deepEqual(gameErrors,[]);
  console.log('PASS nine floors: broken lifts, stairs, CD pickup/damage, final victory, restart reset');
  await gamePage.close();
  const combat=await browser.newPage();const combatErrors=[];
  combat.on('pageerror',e=>combatErrors.push(e.message));
  await combat.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await combat.goto('http://127.0.0.1:8000');
  await combat.waitForFunction(()=>window.__testGame?.scene.getScene('ITGame')?.overlay?.visible);
  await combat.keyboard.press('Enter');
  // Exercise legacy enemy behavior independently of the separately tested trio.
  await combat.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemies.getChildren().filter(e=>e.profile).forEach(e=>e.destroy()));
  for(const [kind,shots,pose] of [
    ['secretary',['folder','mug'],'secretary-scream'],
    ['union',['hammer','gear'],'union-whistle'],
    ['manager',['gold-card','gold-card'],'manager-stomp-']
  ]) {
    const actual=await combat.evaluate(kind=>{
      const s=window.__testGame.scene.getScene('ITGame');s.physics.world.pause();
      s.enemyShots.clear(true,true);
      const e=s.enemies.getChildren().find(e=>e.kind===kind);
      e.floorIndex=0;e.body.reset(590,4280);e.shotsThrown=0;
      s.player.body.reset(82,4280);
      s.enemyAttack(e);s.enemyAttack(e);
      const shots=s.enemyShots.getChildren().map(shot=>shot.texture.key);
      s.enemyShots.clear(true,true);
      s.energy=5;s.lastHit=-3000;e.contactUntil=0;e.attackDelay=Infinity;
      s.player.body.reset(e.x,e.y);s.player.setVelocity(0,0);
      window.__contactEnemy=e;s.physics.world.resume();return shots;
    },kind);
    assert.deepEqual(actual,shots);
    await combat.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
    const contact=await combat.evaluate(()=>{
      const s=window.__testGame.scene.getScene('ITGame');s.physics.world.pause();
      s.enemyContact(window.__contactEnemy);
      return {energy:s.energy,texture:window.__contactEnemy.texture.key};
    });
    assert.equal(contact.energy,4,'Repeated contact during protection must not subtract another point');
    assert.ok(contact.texture.startsWith(pose));
    await combat.screenshot({path:`/tmp/it-hero-tests/${kind}-contact.png`});
    await combat.evaluate(()=>{
      const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(82,4280);
      s.physics.world.resume();
    });
    await combat.waitForFunction(kind=>window.__contactEnemy.texture.key===kind,kind);
    console.log(`PASS ${kind}: projectiles, real contact overlap, one damage, reaction and recovery`);
  }
  assert.deepEqual(combatErrors,[]);await combat.close();
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/vendor/phaser.min.js',r=>r.abort());await page.goto('http://127.0.0.1:8000');
  assert.equal(await page.locator('#offline-message').isVisible(),true);assert.deepEqual(errors,[]);
  console.log('PASS missing engine: visible error message, no uncaught exception');await page.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
