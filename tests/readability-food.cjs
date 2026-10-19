const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 for(const file of ['game','character-preview'])await p.route(`**/${file}.js*`,async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__game=new Phaser.Game({')});});
 await p.goto('http://127.0.0.1:8000/character-preview.html');await p.waitForFunction(()=>window.__game?.scene.scenes[0].entries?.length===17);
 assert(await p.evaluate(()=>__game.scene.scenes[0].entries.every(e=>e.itemIcons?.length>0)));
 assert.deepEqual(await p.evaluate(()=>__game.scene.scenes[0].entries.find(e=>e.name==='MANAŽER').itemIcons.map(i=>i.texture.key)),['sap-helmet','sap-pen','pingpong-ball']);
 await p.selectOption('#pose','contact');
 const scream=await p.evaluate(()=>{const e=__game.scene.scenes[0].entries.find(e=>e.id==='design_manager');return [e.frames.scream,e.frames.scream_alt];});assert(scream.every(Boolean));assert.notEqual(...scream);
 await p.locator('#game').screenshot({path:'/tmp/it-hero-tests/catalogue-items-scream.png'});
 await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor({state:'visible'});await p.keyboard.press('Enter');
 await p.evaluate(()=>{window.s=__game.scene.getScene('ITGame');s.enemies.getChildren().forEach(e=>{e.body.enable=false;e.lastAttack=Infinity;e.sapNextAttack=Infinity;});s.lastHit=Infinity;s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.player.body.reset(82,4280);s.oldBadger.spawn();ITHeroOldBadger.config.walkSpeed=0;});
 await p.waitForFunction(()=>s.oldBadger.state.entity.phase!=='exit');
 await p.evaluate(()=>{window.e=s.oldBadger.state.entity;window.coffee=s.coffees.getChildren()[0];window.steam=coffee.getData('steam');e.body.reset(coffee.x,4280);e.setVelocity(0);});
 await p.waitForFunction(()=>!!e.snack);assert.equal(await p.evaluate(()=>coffee.active),false);assert.equal(await p.evaluate(()=>steam.active),false);
 await p.keyboard.press('Escape');const clock=await p.evaluate(()=>s.oldBadger.state.clock);await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>s.oldBadger.state.clock),clock);await p.keyboard.press('Escape');
 await p.waitForFunction(()=>!e.snack);
 await p.evaluate(()=>{window.hotdog=s.aidItems.create(e.x,4298,'hotdog').setData('expires',s.playTime+10000);window.label=s.add.text(e.x,4200,'PÁREK');hotdog.setData('label',label);});
 await p.waitForFunction(()=>e.snack?.texture.key==='hotdog');assert.equal(await p.evaluate(()=>hotdog.active||label.active),false);await p.waitForFunction(()=>!e.snack);
 // Scene contains only the upper floor name, with no repeated room banner.
 assert.equal(await p.evaluate(()=>s.children.list.filter(o=>o.type==='Text'&&o.text==='PROJEKTY • ZASEDACÍ CHODBA').length),0);
 await p.evaluate(()=>{s.oldBadger.clear();s.floor=3;s.updateHUD();s.player.body.reset(200,2825);s.cameras.main.setScroll(0,2445);});await p.waitForTimeout(150);
 await p.screenshot({path:'/tmp/it-hero-tests/readability-floor4.png'});
 assert.deepEqual(errors,[]);console.log('PASS all 17 item displays, final manager weapons, anchored scream frames, coffee/steam and hotdog/label consumption, pause and duplicate-banner removal');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
