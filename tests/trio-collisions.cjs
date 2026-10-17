// Real physics overlap from the player's actual fire() method, using final artwork/hitboxes.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await b.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
  for(const id of ['security_guard','hr_manager','design_manager']){
   const initial=await p.evaluate(id=>{
    const s=window.__testGame.scene.getScene('ITGame');
    const e=s.enemyTrio.enemies.find(e=>e.kind===id&&!e.defeated);
    s.enemies.getChildren().forEach(other=>{other.body.enable=false;other.lastAttack=Infinity;});
    s.enemyShots.clear(true,true);s.playerShots.clear(true,true);
    s.floor=e.floorIndex;s.updateHUD();
    const ground=4320-s.floor*485;
    e.body.enable=true;e.body.reset(450,ground-e.profile.frameHeight/2);e.setVelocity(0,0);e.baseX=450;e.profile.speed=0;e.lastAttack=Infinity;
    s.player.body.reset(390,ground-40);s.player.setVelocity(0,0);s.facing=1;s.energy=5;
    window.__target=e;return s.score;
   },id);
   await p.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').player.body.blocked.down);
   for(const [weapon,hp] of [['cd',2],['floppy',1],['floppy',0]]){
    await p.evaluate(weapon=>{const s=window.__testGame.scene.getScene('ITGame');s.weapon=weapon;s.fire();},weapon);
    await p.waitForFunction(hp=>window.__target.hp===hp,hp);
   }
   await p.waitForFunction(()=>!window.__target.active);
   assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').score),initial+100);
   console.log(`PASS ${id}: actual CD and floppy physics collisions, defeat and score`);
  }
  assert.deepEqual(errors,[]);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
