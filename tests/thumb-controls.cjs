const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
// Real multi-touch input: the test hook only exposes the scene, never replaces its controls.
(async()=>{fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:844,height:390},isMobile:true,hasTouch:true}),errors=[];
 p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.locator('#game-action').tap();
 await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');s.enemies.clear(true,true);s.enemyShots.clear(true,true);s.colleague.state.nextAt=Infinity;s.nextHelperAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.genZ.state.nextAt=Infinity;s.lastHit=Infinity;});
 assert.equal(await p.evaluate(()=>s.touchControls.movementMode),'stick');
 const cdp=await p.context().newCDPSession(p),points=new Map();
 const center=async selector=>{const r=await p.locator(selector).boundingBox();assert(r);return {x:r.x+r.width/2,y:r.y+r.height/2};};
 const start=async(id,at)=>{points.set(id,{id,...at});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[...points.values()]});};
 const move=async(id,at)=>{points.set(id,{id,...at});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[...points.values()]});await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
 const end=async id=>{const ended=points.get(id);points.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[ended]});};
 const actions=()=>p.evaluate(()=>['left','right','crouch','jump','shoot'].filter(a=>s.touchControls.isDown(a)));
 const zone='#touch-stick-zone',button=a=>`[data-touch-action="${a}"]`;
 let origin=await center(zone);origin.x-=40;
 await start(1,origin);assert.deepEqual(await actions(),[]);
 const base=await center('#touch-stick-base');assert(Math.abs(base.x-origin.x)<2&&Math.abs(base.y-origin.y)<2,'Floating origin follows the finger');
 await move(1,{x:origin.x+6,y:origin.y+6});assert.deepEqual(await actions(),[],'Dead zone ignores jitter');
 await move(1,{x:origin.x+40,y:origin.y});await p.waitForFunction(()=>s.player.body.velocity.x>0);
 await start(2,await center(button('shoot')));await start(3,await center(button('jump')));
 await p.waitForFunction(()=>s.player.body.velocity.y<0);assert.deepEqual(await actions(),['right','jump','shoot']);
 await end(3);await end(2);assert.deepEqual(await actions(),['right']);
 await move(1,{x:origin.x-40,y:origin.y});assert.deepEqual(await actions(),['left']);
 await move(1,{x:origin.x,y:origin.y-40});assert.deepEqual(await actions(),[],'Up is neutral; jump stays on the right');
 await move(1,{x:origin.x+8,y:origin.y+46});assert.deepEqual(await actions(),['crouch'],'Down tolerates horizontal jitter without drift');
 await move(1,{x:origin.x+40,y:origin.y+32});assert.deepEqual(await actions(),['right','crouch']);
 // Capture survives leaving the zone and releases cleanly afterwards.
 await move(1,{x:origin.x+400,y:origin.y});assert.deepEqual(await actions(),['right']);await end(1);assert.deepEqual(await actions(),[]);
 await start(4,origin);await move(4,{x:origin.x-40,y:origin.y});
 await start(5,await center('#touch-pause'));await end(5);await p.waitForFunction(()=>s.gameState==='paused');assert.deepEqual(await actions(),[]);await end(4);
 await p.locator('#touch-pause').tap();await p.waitForFunction(()=>s.gameState==='playing');
 await start(6,origin);await move(6,{x:origin.x+40,y:origin.y});await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});points.clear();assert.deepEqual(await actions(),[]);
 await p.locator('#touch-mode').tap();assert.equal(await p.evaluate(()=>s.touchControls.movementMode),'buttons');await p.locator('#touch-mode').tap();
 // Jump over a real Gen Z blocker while holding the thumb and pressing the right button.
 await p.evaluate(()=>{s.genZ.clear();s.coffees.getChildren().slice().forEach(i=>{i.getData('steam')?.destroy();i.destroy();});s.player.body.reset(82,4280);s.player.setVelocity(0);if(!s.genZ.spawn({x:240,variant:'girl'}))throw Error('NPC fixture failed');});
 await p.waitForFunction(()=>s.genZ.state.entity?.phase==='block');origin=await center(zone);await start(7,origin);await move(7,{x:origin.x+40,y:origin.y});
 await p.waitForFunction(()=>s.player.body.touching.right);await start(8,await center(button('jump')));await p.waitForFunction(()=>s.player.x>270);
 assert(await p.evaluate(()=>s.genZ.state.entity?.active&&s.energy===5));await end(8);await end(7);
 // One down gesture advances exactly one floor, even if kept held through the fade.
 await p.evaluate(()=>{s.genZ.clear();s.player.body.reset(s.doors[0].x,4280);s.player.setVelocity(0);});
 await p.waitForFunction(()=>s.player.body.blocked.down);origin=await center(zone);await start(9,origin);await move(9,{x:origin.x+8,y:origin.y+46});
 await p.waitForFunction(()=>s.floor===1);await p.waitForTimeout(450);assert.equal(await p.evaluate(()=>s.floor),1);await end(9);
 // The same jitter-tolerant down gesture must complete the stationary HDD hold.
 await p.evaluate(()=>{s.floor=8;s.updateHUD();s.player.body.reset(825,4320-8*485-40);s.player.setVelocity(0);s.cameras.main.setScroll(0,4320-8*485-420);});
 await p.waitForFunction(()=>s.pacing.state.phase==='ready');await p.evaluate(()=>s.enemyShots.clear(true,true));
 origin=await center(zone);await start(10,origin);await move(10,{x:origin.x+8,y:origin.y+46});await p.waitForFunction(()=>s.pacing.state.disconnect>200);
 assert.deepEqual(await actions(),['crouch']);await p.waitForFunction(()=>s.gameState==='win');await end(10);
 await p.locator('#game-action').tap();await p.waitForFunction(()=>__g.scene.getScene('ITGame').gameState==='menu');await p.locator('#game-action').tap();
 for(const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:568,height:320}]){
  await p.setViewportSize(viewport);await p.waitForTimeout(180);
  const layout=await p.evaluate(()=>{const c=document.querySelector('canvas').getBoundingClientRect(),z=document.querySelector('#touch-stick-zone').getBoundingClientRect();return {height:c.height,overflow:document.documentElement.scrollWidth>innerWidth,zone:z.width>100&&z.height>100&&z.bottom<=innerHeight,buttons:[...document.querySelectorAll('.touch-actions button,#touch-toolbar button:not([hidden])')].map(b=>{const r=b.getBoundingClientRect();return {w:r.width,h:r.height,bottom:r.bottom,visible:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===b,outside:r.top>=c.bottom-1||r.left>=c.right-1};})};});
  assert(!layout.overflow&&layout.zone,JSON.stringify(layout));assert(layout.buttons.every(b=>b.w>=44&&b.h>=44&&b.bottom<=viewport.height&&b.visible&&b.outside),JSON.stringify(layout));
  if(viewport.width===844){assert(layout.height>=370);await p.screenshot({path:'/tmp/it-hero-tests/thumb-landscape.png'});}
 }
 origin=await center(zone);await start(11,origin);await move(11,{x:origin.x-40,y:origin.y});await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);assert.deepEqual(await actions(),[]);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});points.clear();assert.deepEqual(errors,[]);
 console.log('PASS floating thumb: origin/dead zone, left/right/down/diagonal, real three-finger jump/fire, capture/cancel/pause/rotation, button fallback, Gen Z jump, stairs, HDD victory, restart and four mobile layouts.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
