const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 const result=await p.evaluate(()=>{
  const s=window.__testGame.scene.getScene('ITGame');s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;});s.lastHit=Infinity;
  const random=Phaser.Utils.Array.GetRandom,original=s.popText,seen=[];
  s.popText=function(x,y,text,color,duration){seen.push({text,duration});return original.call(this,x,y,text,color,duration);};
  try{
   for(const [kind,group] of [['secretary','contact'],['union','contact'],['manager','contact'],['specialist','combat'],['security_guard','combat'],['hr_manager','combat'],['design_manager','combat']]){
    const e=s.enemies.getChildren().find(e=>e.kind===kind);s.floor=e.floorIndex;s.player.body.reset(e.x-150,e.body.bottom-40);s.player.setVelocity(0);
    const lines=ITHeroDialogue.lines(kind,group);
    for(let i=0;i<lines.length;i++){
     Phaser.Utils.Array.GetRandom=a=>a[i%a.length];e.nextDialogueAt=0;e.contactUntil=-Infinity;
     if(kind==='specialist'&&i===0)s.enemyAttack(e);else s.enemyContact(e);
     if(seen.at(-1)?.text!==lines[i])throw Error('Missing line '+lines[i]);
     s.posters.update(s.player,s.floor,true,0);
     if(!s.posters.tooltip.text.includes(lines[i]))throw Error('Missing bottom panel');
    }
    const count=seen.length;s.enemyDialogue(e,group);if(seen.length!==count)throw Error('Cooldown ignored');
    e.nextDialogueAt=0;s.floor=(e.floorIndex+1)%9;s.enemyDialogue(e,group);if(seen.length!==count)throw Error('Speech across floors');
   }
   return {seen,shots:s.enemyShots.countActive()};
  }finally{Phaser.Utils.Array.GetRandom=random;s.popText=original;}
 });
 assert.equal(result.seen.length,19);assert(result.seen.every(x=>x.duration===3500));assert(result.shots>0);assert.deepEqual(errors,[]);
 console.log('PASS imported dialogue: all 19 lines of seven enemy types triggered in game, attack/contact hooks, 3.5s display, lower panel, 7s cooldown, same-floor restriction and preserved projectiles.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
