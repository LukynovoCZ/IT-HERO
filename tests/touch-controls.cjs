const {chromium}=require('playwright');const assert=require('node:assert/strict');
require('node:fs').mkdirSync('/tmp/it-hero-tests',{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});
 assert(await p.locator('#touch-controls').isVisible());assert((await p.locator('#game-action').innerText()).includes('KLEPNI'));
 await p.locator('#game-action').tap();await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='playing');
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;});});
 const cdp=await p.context().newCDPSession(p),points=new Map();
 const center=async selector=>{const r=await p.locator(selector).boundingBox();assert(r);return {x:r.x+r.width/2,y:r.y+r.height/2};};
 const start=async(id,selector)=>{points.set(id,{id,...await center(selector)});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...points.values()]});};
 const end=async id=>{const ended=points.get(id);points.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[ended]});};
 const action=a=>`[data-touch-action="${a}"]`;
 const initial=await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x);
 await start(1,action('right'));await p.waitForFunction(x=>window.__testGame.scene.getScene('ITGame').player.x>x+25,initial);
 await start(2,action('shoot'));await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').lastShot>0);
 await start(3,action('jump'));await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.velocity.y<0);
 assert(await p.evaluate(()=>{const t=window.__testGame.scene.getScene('ITGame').touchControls;return t.isDown('right')&&t.isDown('shoot')&&t.isDown('jump');}));
 await end(3);assert(await p.evaluate(()=>{const t=window.__testGame.scene.getScene('ITGame').touchControls;return t.isDown('right')&&t.isDown('shoot')&&!t.isDown('jump');}));await end(2);await end(1);
 await p.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.player.body.blocked.down&&s.player.body.velocity.x===0;});
 // Quick tap must still fire, even after the pointer is released before the next update.
 await p.waitForTimeout(260);const before=await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').lastShot);
 await p.locator(action('shoot')).tap();await p.waitForFunction(before=>window.__testGame.scene.getScene('ITGame').lastShot>before,before);
 await start(4,action('crouch'));await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.height===36);await end(4);
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.height===72);
 // Pause while a different finger is still holding movement; no held input survives.
 await start(5,action('right'));await start(6,'#touch-pause');await end(6);
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='paused');
 assert(await p.evaluate(()=>!window.__testGame.scene.getScene('ITGame').touchControls.isDown('right')));await end(5);
 await p.locator('#touch-pause').tap();await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='playing');
 await p.locator('#touch-sound').tap();assert(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').isMuted));
 // Finger slides between buttons, then leaves the control surface.
 await start(7,action('left'));points.set(7,{id:7,...await center(action('right'))});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[...points.values()]});
 await p.waitForFunction(()=>{const t=window.__testGame.scene.getScene('ITGame').touchControls;return !t.isDown('left')&&t.isDown('right');});
 points.set(7,{id:7,x:3,y:3});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[...points.values()]});
 await p.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').touchControls.isDown('right'));await end(7);
 await start(8,action('left'));await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});points.clear();
 await p.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').touchControls.isDown('left'));
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(s.doors[0].x,4280);s.player.setVelocity(0);});
 await start(9,action('crouch'));await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').floor===1);await p.waitForTimeout(400);
 assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),1);await end(9);
 for(const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:568,height:320}]){
 await p.setViewportSize(viewport);await p.waitForTimeout(180);
 const layout=await p.evaluate(()=>{const canvas=document.querySelector('canvas').getBoundingClientRect();return {canvasHeight:canvas.height,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('[data-touch-action],#touch-toolbar button:not([hidden])')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,bottom:r.bottom,below:r.top>=canvas.bottom-1||r.right<=canvas.left+1||r.left>=canvas.right-1};})};});
 if(viewport.width===844)assert(layout.canvasHeight>=370,JSON.stringify(layout));
 assert.equal(layout.overflow,false);assert(layout.buttons.every(b=>b.w>=44&&b.h>=44&&b.bottom<=viewport.height&&b.below),JSON.stringify(layout));
 await p.screenshot({path:`/tmp/it-hero-tests/touch-${viewport.width}.png`});
 }
 await start(10,action('right'));await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);
 assert(await p.evaluate(()=>!window.__testGame.scene.getScene('ITGame').touchControls.isDown('right')));await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});points.clear();
 if(await p.locator('#touch-fullscreen').isVisible()){
 await p.locator('#touch-fullscreen').tap();await p.waitForFunction(()=>!!document.fullscreenElement);
 assert(await p.locator('#touch-controls').isVisible());await p.locator('#touch-fullscreen').tap();await p.waitForFunction(()=>!document.fullscreenElement);
 }
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='paused');
 await p.evaluate(()=>{delete document.hidden;});await p.locator('#touch-pause').tap();
 // Restart rebuilds handlers cleanly and touch mode stays available.
 await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.gameState='lose';s.handleStart();});
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');await p.locator('#game-action').tap();
 await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='playing');
 assert(await p.locator('#touch-controls').isVisible());assert.deepEqual(errors,[]);
 console.log('PASS touch: real three-finger move/jump/fire, tap fire, crouch/stairs, pause/sound/fullscreen, slide/release/cancel/rotation, 4 viewport layouts, hidden-page pause and restart.');
 await p.close();
 const landscape=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});landscape.on('pageerror',e=>errors.push(e.message));
 await landscape.goto('http://127.0.0.1:8000');await landscape.locator('#game-action').waitFor({state:'visible'});await landscape.waitForTimeout(100);
 const hit=await landscape.evaluate(()=>{const b=document.getElementById('game-action').getBoundingClientRect(),c=document.querySelector('canvas').getBoundingClientRect();return b.left>=c.left&&b.right<=c.right&&b.top>=c.top&&b.bottom<=c.bottom;});assert(hit);
 await landscape.locator('#game-action').tap();await landscape.locator('#game-action').waitFor({state:'hidden'});await landscape.close();
 // PC retains its keyboard controls; touch buttons can be shown manually.
 const pc=await b.newPage();pc.on('pageerror',e=>errors.push(e.message));
 await pc.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await pc.goto('http://127.0.0.1:8000');await pc.locator('#game-action').waitFor({state:'visible'});
 assert(await pc.locator('#touch-controls').isHidden());await pc.keyboard.press('Enter');await pc.locator('#touch-toggle').click();assert(await pc.locator('#touch-controls').isVisible());
 const pcX=await pc.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.x);await pc.keyboard.down('d');await pc.waitForFunction(x=>window.__testGame.scene.getScene('ITGame').player.x>x+20,pcX);await pc.keyboard.up('d');await pc.locator('#touch-toggle').click();assert(await pc.locator('#touch-controls').isHidden());
 await pc.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
 await pc.locator('#touch-toggle').focus();await pc.keyboard.press('Space');assert(await pc.locator('#touch-controls').isVisible());
 assert.deepEqual(errors,[]);
 await pc.waitForTimeout(80);assert.equal(await pc.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.velocity.y),0);
 console.log('PASS PC: keyboard start/movement and optional touch control toggle.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
