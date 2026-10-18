const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await page.goto('http://127.0.0.1:8000');await page.locator('#game-action').waitFor({state:'visible'});await page.keyboard.press('Enter');
 await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.lastHit=Infinity;s.enemies.getChildren().forEach(e=>{e.lastAttack=Infinity;e.sapNextAttack=Infinity;});s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;
 s.floor=1;s.updateHUD();s.player.body.reset(s.doors[1].x,3835-40);s.player.setVelocity(0);});
 await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 await page.keyboard.down('s');await page.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===2&&!s.transitioning;});
 await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),2,'Holding crouch at arrival must not skip a floor');
 // Cross the room without releasing crouch, then enter the outgoing stairs.
 await page.keyboard.down('d');await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.x>160);await page.keyboard.up('d');
 await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(s.doors[2].x,3350-40);s.player.setVelocity(0);});
 await page.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===3&&!s.transitioning;});await page.keyboard.up('s');
 console.log('PASS held crouch: floor 2 → 3 → 4, no stuck stair latch or skipped floor');
 // Jump from the desk, then use crouch to drop back down to the enemies.
 await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.floor=1;s.updateHUD();s.cameras.main.setScroll(0,3835-420);s.player.body.reset(680,3835-78);s.player.setVelocity(0);});
 await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 await page.keyboard.down('a');await page.keyboard.down('w');await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.x<580);await page.keyboard.up('a');await page.keyboard.up('w');
 await page.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.player.body.blocked.down&&s.pacing.bridges.some(b=>Math.abs(s.player.body.bottom-b.body.top)<3);});
 await page.keyboard.down('s');await page.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.player.body.blocked.down&&s.player.body.bottom>3830;});await page.keyboard.up('s');
 await page.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').wasCrouching);
 assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.height),72);
 assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').dropThroughPlatform),null,'Bridge must become solid again after dropping');
 await page.keyboard.press('w');
 await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.bottom<3835-70);
 await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 assert(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.bottom>3830),'Jump below the bridge must land back on the floor');
 // Both desk/bridge overlaps must have enough headroom for a standing player.
 const geometry=await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame'),bridges=s.pacing.bridges.filter(b=>Math.abs(b.y-3835)<200).sort((a,b)=>a.x-b.x);return{clearance:3835-38-bridges[0].body.bottom,gap:bridges[1].body.left-bridges[0].body.right};});assert(geometry.clearance>=72,JSON.stringify(geometry));assert(geometry.gap>=28,JSON.stringify(geometry));
 assert.deepEqual(errors,[]);await page.screenshot({path:'/tmp/it-hero-tests/stairs-platforms-fixed.png'});
 console.log('PASS real desk jump, crouch drop to floor, standing clearance and open central gap; no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
