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
  const frames=await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');
   return ['idle','stop','radio','walk'].map(pose=>{
    const tex=s.textures.get(`trio-security_guard-${pose}`),c=tex.getSourceImage();
    const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let bottom=-1,opaque=0,blue=0,blueLeft=Infinity,blueRight=-Infinity;
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
     const i=(y*c.width+x)*4;
     if(pixels[i+3]>128){bottom=y;opaque++;if(pixels[i+2]>pixels[i]*1.5&&pixels[i+2]>pixels[i+1]*1.2&&y>c.height-18){blue++;blueLeft=Math.min(blueLeft,x);blueRight=Math.max(blueRight,x);}}
    }
    return {width:c.width,height:c.height,bottom,opaque,blue,footCenter:(blueLeft+blueRight)/2,corner:pixels[3]};
   });
  });
  for(const frame of frames){assert.equal(frame.width,80);assert.equal(frame.height,96);assert.ok(frame.opaque>1500);assert.ok(frame.blue>10);assert.equal(frame.corner,0);}
  assert.ok(Math.max(...frames.map(f=>f.bottom))-Math.min(...frames.map(f=>f.bottom))<=1,'Pose feet must stay aligned');
  assert.ok(Math.max(...frames.map(f=>f.footCenter))-Math.min(...frames.map(f=>f.footCenter))<=1,'Foot centers must not shift horizontally');
  await p.keyboard.press('Enter');
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemies.getChildren().filter(e=>!e.profile).forEach(e=>e.destroy());window.__guard=s.enemyTrio.enemies[0];window.__guard.lastAttack=Infinity;});
  await p.waitForFunction(()=>Math.abs(window.__guard.body.velocity.x)>0);
  const positions=[];
  for(let n=0;n<5;n++){positions.push(await p.evaluate(()=>window.__guard.x));await p.waitForTimeout(100);}
  assert.ok(Math.max(...positions)-Math.min(...positions)>3,'Guard must really patrol');
  await p.screenshot({path:'/tmp/it-hero-tests/security-patrol.png'});
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemyShots.clear(true,true);s.energy=5;s.lastHit=-3000;s.player.body.reset(window.__guard.x,window.__guard.y);s.player.setVelocity(0,0);});
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
  assert.equal(await p.evaluate(()=>window.__guard.texture.key),'trio-security_guard-stop');
  await p.screenshot({path:'/tmp/it-hero-tests/security-stop.png'});
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemyShots.clear(true,true);s.energy=5;s.lastHit=-3000;s.player.body.reset(window.__guard.x+170,window.__guard.y);s.player.setVelocity(0,0);window.__guard.contactUntil=0;window.__guard.lastAttack=s.time.now-2000;});
  await p.waitForFunction(()=>window.__guard.texture.key==='trio-security_guard-radio');
  await p.screenshot({path:'/tmp/it-hero-tests/security-radio.png'});
  await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').energy===4);
  await p.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.floor=3;s.enemyShots.clear(true,true);s.enemyTrio.attack(window.__guard)});
  assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyShots.countActive()),0);
  assert.deepEqual(errors,[]);
  console.log('PASS actual security sprites: transparent edges, blue shoes, aligned feet, real patrol, contact STOP, radio attack, projectile damage, cross-floor guard');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
