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
   await page.route('**/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
   await page.goto('http://127.0.0.1:8000');
   const state=()=>page.evaluate(()=>window.__testGame.scene.getScene('ITGame').gameState);
   await page.waitForFunction(()=>window.__testGame?.scene.getScene('ITGame')?.overlay?.visible);
   assert.equal(await state(),'menu');
   if(method==='Enter')await page.keyboard.press('Enter');
   if(method==='button')await page.locator('#game-action').click();
   if(method==='canvas')await page.locator('canvas').click({position:{x:100,y:100}});
   await page.waitForTimeout(300);
   assert.equal(await state(),'playing');
   assert.equal(await page.locator('#game-action').isVisible(),false);
   const x=await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x);
   await page.keyboard.down('d');await page.waitForTimeout(300);await page.keyboard.up('d');
   assert.ok(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x)>x+20,'Player must move after start');
   await page.keyboard.down('j');await page.waitForTimeout(150);await page.keyboard.up('j');
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
  await gamePage.route('**/game.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
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
    await gamePage.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const d=s.doors[s.floor];s.player.body.reset(d.x,d.y-30);s.player.setVelocity(0,0);});
    await gamePage.keyboard.press('e');
    if(floor<8)await gamePage.waitForFunction(f=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===f+1&&!s.transitioning},floor);
    else assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').gameState),'win');
  }
  await gamePage.keyboard.press('Enter');
  await gamePage.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
  assert.equal(await gamePage.evaluate(()=>window.__testGame.scene.getScene('ITGame').weapon),'floppy');
  assert.deepEqual(gameErrors,[]);
  console.log('PASS nine floors: broken lifts, stairs, CD pickup/damage, final victory, restart reset');
  await gamePage.close();
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/vendor/phaser.min.js',r=>r.abort());await page.goto('http://127.0.0.1:8000');
  assert.equal(await page.locator('#offline-message').isVisible(),true);assert.deepEqual(errors,[]);
  console.log('PASS missing engine: visible error message, no uncaught exception');await page.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
