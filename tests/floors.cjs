const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const p=await b.newPage({viewport:{width:1280,height:900}});p.setDefaultTimeout(10000);const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
  await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemies.clear(true,true));
  await p.waitForTimeout(250);
  await p.keyboard.down('s');await p.waitForTimeout(120);await p.keyboard.up('s');
  assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),0,'Crouching away from stairs must not advance');
  const steamBefore=await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');window.__coffee=s.coffees.getChildren()[0];window.__steam=window.__coffee.getData('steam');return JSON.stringify(window.__steam.commandBuffer)});
  await p.waitForTimeout(200);
  assert.notEqual(await p.evaluate(()=>JSON.stringify(window.__steam.commandBuffer)),steamBefore,'Steam must animate');
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.energy=2;s.player.body.reset(window.__coffee.x,window.__coffee.y-15);s.player.setVelocity(0,0)});
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===3);
  assert.equal(await p.evaluate(()=>window.__steam.active),false,'Collecting coffee must remove its steam');
  console.log('PASS new mug: animated steam, actual health pickup and steam cleanup');
  for(let floor=0;floor<9;floor++){
   if(floor===0)await p.keyboard.down('s'); // Enter the stairs while already crouching.
   await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const d=s.doors[s.floor];s.player.body.reset(d.x,d.y-45);s.player.setVelocity(0,0)});
   await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
   await p.waitForTimeout(100);
   await p.screenshot({path:`/tmp/it-hero-tests/floor-${floor+1}.png`});
   await p.keyboard.down(floor%2?'ArrowDown':'s');
   if(floor<8){
    await p.waitForFunction(f=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===f+1&&!s.transitioning},floor);
    await p.waitForTimeout(200);
    assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').floor),floor+1,'Holding crouch must not skip floors');
   }else await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='win');
   await p.keyboard.up(floor%2?'ArrowDown':'s');await p.waitForTimeout(80);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS nine visually captured floors: stairs via S/ArrowDown, hold protection, final victory, no JS errors');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
