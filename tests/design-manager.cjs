const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await b.newPage({viewport:{width:1280,height:900}});p.setDefaultTimeout(10000);const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});
  const info=await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');
   return {floors:s.enemyTrio.enemies.filter(e=>e.kind==='design_manager').map(e=>e.floorIndex+1),
    frames:['idle','explain','walk','tablet'].map(pose=>{
     const c=s.textures.get(`trio-design_manager-${pose}`).getSourceImage();
     const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
     let opaque=0,bottom=-1;
     for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>128){opaque++;bottom=y;}
     return {width:c.width,height:c.height,bottom,opaque,corner:pixels[3]};
    })};
  });
  assert.deepEqual(info.floors,[4,8,9]);
  for(const f of info.frames){assert.equal(f.width,80);assert.equal(f.height,112);assert.equal(f.corner,0);assert.ok(f.opaque>1000);}
  assert.ok(Math.max(...info.frames.map(f=>f.bottom))-Math.min(...info.frames.map(f=>f.bottom))<=1);
  await p.keyboard.press('Enter');
  await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');
   s.enemies.getChildren().filter(e=>!e.profile).forEach(e=>e.destroy());
   window.__design=s.enemyTrio.enemies.find(e=>e.kind==='design_manager');
   // Isolate this character from the DBPM encounter now sharing floor four.
   s.enemies.getChildren().filter(e=>e!==window.__design).forEach(e=>{e.defeated=true;e.body.enable=false;e.setActive(false);});
   window.__design.lastAttack=Infinity;s.lastHit=Infinity;
   s.floor=3;s.updateHUD();s.player.body.reset(82,2865-40);s.player.setVelocity(0,0);
   s.cameras.main.centerOn(480,2865-180);
  });
  await p.waitForFunction(()=>Math.abs(window.__design.body.velocity.x)>0);
  const xs=[];for(let i=0;i<5;i++){xs.push(await p.evaluate(()=>window.__design.x));await p.waitForTimeout(100);}
  assert.ok(Math.max(...xs)-Math.min(...xs)>3);
  await p.screenshot({path:'/tmp/it-hero-tests/design-walk.png'});
  // The live design enemy must not block normal stair travel.
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.player.body.reset(81,2865-45);s.player.setVelocity(0,0);});
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
  await p.keyboard.down('ArrowDown');
  await p.waitForFunction(()=>{const s=window.__testGame.scene.getScene('ITGame');return s.floor===4&&!s.transitioning;});
  await p.keyboard.up('ArrowDown');
  assert.equal(await p.evaluate(()=>window.__design.active),true);
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.floor=3;s.updateHUD();s.player.body.reset(82,2825);s.player.setVelocity(0,0);});
  await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');s.enemyShots.clear(true,true);s.energy=5;s.lastHit=-3000;
   s.player.body.reset(window.__design.x,window.__design.y);s.player.setVelocity(0,0);
  });
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
  assert.match(await p.evaluate(()=>window.__design.texture.key),/^trio-design_manager-scream/);
  await p.screenshot({path:'/tmp/it-hero-tests/design-explain.png'});
  await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');s.enemyShots.clear(true,true);s.energy=5;s.lastHit=-3000;
   s.player.body.reset(window.__design.x-90,window.__design.y);s.player.setVelocity(0,0);
   window.__design.contactUntil=0;window.__design.lastAttack=s.time.now-2000;
  });
  await p.waitForFunction(()=>window.__design.texture.key==='trio-design_manager-golf'||window.__design.texture.key==='trio-design_manager-golf_follow');
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
  const hit=await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame'),e=window.__design;
   s.physics.world.pause();const score=s.score;
   for(const damage of [2,1,1])s.hitEnemy(s.playerShots.create(e.x,e.y,damage===2?'cd':'floppy').setData('damage',damage),e);
   return {hp:e.hp,defeated:e.defeated,body:e.body.enable,reward:s.score-score};
  });
  assert.deepEqual(hit,{hp:0,defeated:true,body:false,reward:100});
  await p.waitForFunction(()=>!window.__design.active);
  assert.deepEqual(errors,[]);
  console.log('PASS actual design manager reference sprites in floors 4/8/9: transparent aligned poses, patrol, animated scream contact, golf swing attack, damage, CD/floppy defeat and score');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
