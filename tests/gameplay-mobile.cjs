const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.locator('#game-action').tap();await p.locator('#touch-mode').tap();
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemies.clear(true,true);s.floor=8;s.updateHUD();s.player.body.reset(825,4320-8*485-40);s.player.setVelocity(0);s.lastHit=Infinity;s.cameras.main.setScroll(0,4320-8*485-420);});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').pacing.state.phase==='ready');
 await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.clear(true,true));
 const target=p.locator('[data-touch-action="crouch"]'),r=await target.boundingBox(),cdp=await p.context().newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:r.x+r.width/2,y:r.y+r.height/2}]});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').pacing.state.disconnect>200);
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='win');await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert(await p.locator('#game-action').isVisible());assert.deepEqual(errors,[]);await p.screenshot({path:'/tmp/it-hero-tests/gameplay-mobile-victory.png'});
 await p.locator('#game-action').tap();await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
 console.log('PASS mobile gameplay: landscape layout, final salvo, real held crouch touch disconnects HDD, victory and touch restart.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
