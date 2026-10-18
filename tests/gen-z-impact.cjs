const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.setDefaultTimeout(25000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 const safeCounts=await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');window.z=s.genZ;const counts=[];
  for(let floor=0;floor<9;floor++){s.floor=floor;s.player.body.reset(floor===0?82:floor%2?872:88,4320-floor*485-40);counts.push(Array.from({length:65},(_,i)=>160+i*10).filter(x=>z.safe(x)).length);}
  s.floor=0;s.player.body.reset(82,4280);return counts;});
 console.log('Safe spawn counts with live enemies, floors 1–9:',safeCounts.join(', '));assert(safeCounts[4]===0&&safeCounts[8]===0);assert(safeCounts.some(n=>n>0));
 await p.evaluate(()=>{s.enemies.clear(true,true);s.enemyShots.clear(true,true);s.colleague.state.nextAt=Infinity;s.nextHelperAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.lastHit=Infinity;s.energy=5;
  s.coffees.getChildren().slice().forEach(i=>{i.getData('steam')?.destroy();i.destroy();});
  ITHeroGenZ.config.blockingDurationMin=8000;ITHeroGenZ.config.blockingDurationMax=8000;});
 for(const {floor,x} of [{floor:0,x:240},{floor:1,x:400}]){
  await p.evaluate(({floor,x})=>{z.clear();s.floor=floor;s.updateHUD();s.cameras.main.setScroll(0,4320-floor*485-420);s.player.body.reset(82,4320-floor*485-40);s.player.setVelocity(0);if(!z.spawn({x,variant:'boy'}))throw Error('Unsafe test spawn');},{floor,x});
  await p.waitForFunction(()=>z.state.entity?.phase==='block');
  for(const direction of [1,-1]){
   await p.evaluate(({floor,x,direction})=>{s.player.body.reset(x-direction*30,4320-floor*485-40);s.player.setVelocity(0);},{floor,x,direction});
   await p.waitForFunction(()=>s.player.body.blocked.down);const key=direction===1?'d':'a';
   await p.keyboard.down(key);await p.waitForFunction(d=>d===1?s.player.body.touching.right:s.player.body.touching.left,direction);
   await p.keyboard.press('w');await p.waitForFunction(({x,direction})=>(s.player.x-x)*direction>34,{x,direction});await p.keyboard.up(key);
   const result=await p.evaluate(()=>({active:z.state.entity?.active,phase:z.state.entity?.phase,energy:s.energy,x:s.player.x,clock:z.state.clock,until:z.state.entity?.blockUntil}));assert(result.active&&result.phase==='block'&&result.energy===5,JSON.stringify({floor,direction,...result}));
  }
  console.log(`PASS floor ${floor+1}: jumps in both directions ${floor?'beneath a service bridge':'beside a desk'}, active blocker and unchanged health`);
 }
 // A nearby hostile yields the neutral collision rather than pinning the hero in combat.
 await p.evaluate(()=>{const e=z.state.entity;const foe=s.enemies.create(e.x+60,e.y,e.texture.key);foe.floorIndex=s.floor;z.update(1);foe.destroy();});
 await p.waitForFunction(()=>!z.state.entity);assert.deepEqual(errors,[]);console.log('PASS Gen Z yields to approaching enemies; SAP checkpoint and final HDD remain excluded.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
