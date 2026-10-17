// Mechanics test only. Existing hero artwork is a test fixture, not the new characters' art.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyTrio.enemies.length),8);
  assert.ok(await p.evaluate(()=>window.__testGame.scene.getScene('ITGame').enemyTrio.enemies.every(e=>['security_guard','hr_manager','design_manager'].includes(e.kind))));
  await p.keyboard.press('Enter');
  await p.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');s.enemies.clear(true,true);
   const profiles=Object.fromEntries(Object.entries(ITHeroEnemyCatalog.profiles).map(([id,p])=>[id,{...p,enabled:true,art:{sourceKey:'character-art',poses:{idle:[40,16,245,342]}}}]));
   s.enemyTrio=ITHeroEnemyCatalog.create(s,[4320],{profiles,placements:Object.keys(profiles).map((id,i)=>({id,floor:1,x:[200,440,800][i]}))});
  });
  for(let i=0;i<3;i++){
   const result=await p.evaluate(i=>{
    const s=window.__testGame.scene.getScene('ITGame'),e=s.enemyTrio.enemies[i];
    s.physics.world.pause();s.enemyShots.clear(true,true);
    s.floor=1;s.enemyTrio.attack(e);const across=s.enemyShots.countActive();
    s.floor=0;s.player.body.reset(82,4280);s.enemyTrio.attack(e);
    const shot=s.enemyShots.getChildren()[0];
    const health=e.hp,score=s.score;
    const projectile=s.playerShots.create(e.x,e.y,'cd').setData('damage',2);
    s.hitEnemy(projectile,e);
    const remaining=e.hp;
    s.hitEnemy(s.playerShots.create(e.x,e.y,'floppy').setData('damage',1),e);
    s.hitEnemy(s.playerShots.create(e.x,e.y,'floppy').setData('damage',1),e);
    const firstScore=s.score;
    s.hitEnemy(s.playerShots.create(e.x,e.y,'floppy').setData('damage',1),e);
    return {across,projectile:shot.texture.key,health,remaining,scoreDelta:s.score-score,repeatScore:s.score-firstScore,defeated:e.defeated,body:e.body.enable};
   },i);
   assert.equal(result.across,0);assert.equal(result.projectile,'folder');
   assert.equal(result.health,4);assert.equal(result.remaining,2);
   assert.equal(result.scoreDelta,100);assert.equal(result.repeatScore,0);assert.equal(result.defeated,true);assert.equal(result.body,false);
   await p.waitForFunction(i=>!window.__testGame.scene.getScene('ITGame').enemyTrio.enemies[i].active,i);
   assert.equal(await p.evaluate(i=>window.__testGame.scene.getScene('ITGame').enemyTrio.enemies[i].active,i),false);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS all three reference profiles enabled; all three mechanics test profiles use existing projectiles, block cross-floor attacks, take CD/floppy damage, award score once and disappear after defeat');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
