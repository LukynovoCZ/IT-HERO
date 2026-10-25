/* Local architectural proposal; overrides are restricted to this browser session. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{let baseline;
 for(const mode of ['before','after']){
  const p=await b.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/community-config.js*',r=>r.fulfill({body:'window.ITHeroCommunityConfig={apiBaseUrl:""};',contentType:'text/javascript'}));
  await p.route('**/game.js*',async r=>{const response=await r.fetch();let code=(await response.text()).replace('new Phaser.Game({','window.__reception=new Phaser.Game({').replace('this.buildOffice();',"this.registry.set('officeDeskSeed','reception-photo');this.buildOffice();");
   if(mode==='after')code=code.replace('    preload() {',"    preload() {this.load.image('reception-photo-proposal','docs/reception-design/reception-background.png');").replace('      const plan = FLOOR_PLANS[level];',`      const plan = FLOOR_PLANS[level];
      if(level===0){this.add.image(0,y-414,'reception-photo-proposal').setOrigin(0).setDisplaySize(WIDTH,414).setDepth(-10);this.add.rectangle(WIDTH/2,y-207,WIDTH,414,0x142c29,.16).setDepth(-8.5);return plan;}`);
   if(mode==='after')code=code.replace('WIDTH, 30, 0x77877a, 11','WIDTH, 30, level===0?0x596268:0x77877a, 11').replace('g.fillStyle(0xa7b1a5).fillRect(0, y, WIDTH, 6)','g.fillStyle(level===0?0xb6bdbe:0xa7b1a5).fillRect(0, y, WIDTH, 6)');
   await r.fulfill({response,body:code});
  });
  await p.goto(process.env.IT_HERO_PREVIEW_URL||'http://127.0.0.1:8000');await p.locator('#game-action').click();
  await p.evaluate(()=>{window.s=__reception.scene.getScene('ITGame');s.player.body.reset(230,4280);s.player.setVelocity(0);s.enemies.getChildren().forEach(e=>{e.lastAttack=Infinity;e.sapNextAttack=Infinity;});s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.genZ.state.nextAt=Infinity;s.founders.state.nextAt=Infinity;});
  await p.waitForFunction(()=>s.player.body.blocked.down);await p.waitForTimeout(300);
  const geometry=await p.evaluate(()=>({desks:s.officeDesks.map(d=>[d.x,d.body.left,d.body.top,d.body.width,d.body.height]),doors:s.doors.map(d=>[d.x,d.y,d.kind]),platforms:s.platforms.getChildren().map(p=>[p.body.x,p.body.y,p.body.width,p.body.height]),hero:[s.player.body.width,s.player.body.height,s.player.body.offset.x,s.player.body.offset.y],enemies:s.enemies.countActive()}));
  if(baseline)assert.deepEqual(geometry,baseline,'architecture must not change physical geometry or actors');else baseline=geometry;
  await p.locator('#game canvas').screenshot({path:`docs/reception-design/${mode}.png`});
  await p.keyboard.down('d');await p.keyboard.press('w');await p.waitForFunction(()=>s.player.x>=328);await p.keyboard.up('d');await p.waitForFunction(()=>s.player.body.blocked.down&&Math.abs(s.player.body.bottom-s.officeDesks[0].body.top)<.5);
  assert.equal(await p.evaluate(()=>s.floor),0);if(mode==='after'){
   await p.locator('#game canvas').screenshot({path:'docs/reception-design/jump.png'});
   await p.setViewportSize({width:844,height:390});await p.waitForTimeout(200);await p.locator('#game canvas').screenshot({path:'docs/reception-design/mobile.png'});
  }
  assert.deepEqual(errors,[]);await p.close();console.log('PASS '+mode+': same desks, doors, floor colliders, actors and hitbox; actual jump/landing.');
 }
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
