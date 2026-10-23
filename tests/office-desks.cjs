const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:1280,height:1000}}),errors=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/community-config.js*',r=>r.fulfill({body:'window.ITHeroCommunityConfig={apiBaseUrl:""};',contentType:'text/javascript'}));
 await p.route('**/game.js*',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({').replace('this.buildOffice();',"this.registry.set('officeDeskSeed','office-test');this.buildOffice();")});});
 await p.goto(process.env.IT_HERO_PREVIEW_URL||'http://127.0.0.1:8000');await p.locator('#game-action').click();
 async function isolate(){await p.evaluate(()=>{window.s=__g.scene.getScene('ITGame');s.enemies.clear(true,true);s.dbpm.tick=()=>{};s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.genZ.state.nextAt=Infinity;s.founders.state.nextAt=Infinity;s.lastHit=Infinity;});}
 await isolate();
 const initial=await p.evaluate(()=>{
  const D=ITHeroOfficeDesks,list=s.officeDesks;
  const shades=s.children.list.filter(o=>o.getData?.('officeBackdrop'));
  if(shades.length!==9||shades.some(o=>o.body||o.depth!==-8.5||o.fillAlpha!==.36))throw Error('background contrast layer');
  for(const type of ['wood','modern']){const c=document.createElement('canvas');c.width=88;c.height=38;const ctx=c.getContext('2d');ctx.drawImage(s.textures.get('office-desk-'+type).getSourceImage(),0,0);const pixel=ctx.getImageData(8,24,1,1).data;if(pixel[0]+pixel[1]+pixel[2]<600||pixel[3]!==255)throw Error('dark desk legs in loaded PNG');}
  for(const d of list){const a=d.getBounds(),b=d.body;if(a.top!==b.top||a.left!==b.left||a.width!==88||b.height!==38)throw Error('visual/body mismatch');if(d.decorations.length<2||d.decorations.length>5)throw Error('count');if(d.decorations.some(i=>i.body||i.depth>=s.player.depth||i.y>=b.top))throw Error('decoration collision/depth');}
  const describe=()=>list.map(d=>[d.x,d.y,d.getData('officeDesk').type,d.decorations.map(i=>i.getData('deskItem'))]);
  const a=D.seeded('fixed'),b=D.seeded('fixed');for(let i=0;i<100;i++)if(a()!==b())throw Error('seed');
  const keys=s.textures.getTextureKeys().filter(k=>/^office-(desk|item)-/.test(k));D.createDeskTextures(s);if(keys.length!==s.textures.getTextureKeys().filter(k=>/^office-(desk|item)-/.test(k)).length)throw Error('texture leak');
  return {description:describe(),textures:keys.length,count:list.length,variants:[...new Set(list.map(d=>d.getData('officeDesk').type))],combinations:new Set(list.map(d=>JSON.stringify(d.decorations.map(i=>i.getData('deskItem'))))).size};
 });assert.equal(initial.count,18);assert.equal(initial.textures,27);assert.equal(initial.variants.length,2);assert(initial.combinations>10);
 fs.mkdirSync('/tmp/it-hero-tests/office-desks',{recursive:true});
 for(const id of ['boy','girl']){
  await p.evaluate(id=>{ITHeroPlayer.state.id=id;s.heroFrames=s.playerFrames[id];},id);
  for(let i=0;i<18;i++){
   await p.evaluate(i=>{const d=s.officeDesks[i],floor=d.getData('officeDesk').floor;s.floor=floor;s.updateHUD();s.cameras.main.setScroll(0,d.body.bottom-420);s.player.body.reset(d.x-100,d.body.bottom-40);s.player.setVelocity(0);},i);
   await p.waitForFunction(()=>s.player.body.blocked.down);await p.keyboard.down('d');await p.keyboard.press('w');
   await p.waitForFunction(i=>s.player.x>=s.officeDesks[i].x-2,i);await p.keyboard.up('d');
   await p.waitForFunction(i=>s.player.body.blocked.down&&Math.abs(s.player.body.bottom-s.officeDesks[i].body.top)<.5,i);
   assert(await p.evaluate(i=>Math.abs(s.player.getBounds().bottom-s.officeDesks[i].getBounds().top)<1,i),'visible feet/tabletop alignment');
   if(id==='boy'&&i%2===0){await p.waitForTimeout(200);await p.locator('#game canvas').screenshot({path:`/tmp/it-hero-tests/office-desks/floor-${i/2+1}.png`});}
   await p.keyboard.down('a');await p.waitForFunction(i=>s.player.x<s.officeDesks[i].x-100,i);await p.keyboard.up('a');await p.waitForFunction(i=>s.player.body.blocked.down&&Math.abs(s.player.body.bottom-s.officeDesks[i].body.bottom)<3,i);
  }
 }
 await p.evaluate(()=>s.scene.restart());await p.waitForFunction(()=>__g.scene.getScene('ITGame').gameState==='menu');await p.locator('#game-action').click();await isolate();
 assert.deepEqual(await p.evaluate(()=>s.officeDesks.map(d=>[d.x,d.y,d.getData('officeDesk').type,d.decorations.map(i=>i.getData('deskItem'))])),initial.description,'same seed after restart');assert.equal(await p.evaluate(()=>s.textures.getTextureKeys().filter(k=>/^office-(desk|item)-/.test(k)).length),27);
 await p.setViewportSize({width:844,height:390});await p.waitForTimeout(250);await p.locator('#game canvas').screenshot({path:'/tmp/it-hero-tests/office-desks/mobile.png'});assert.deepEqual(errors,[]);
 console.log('PASS 18 desks / 9 floors: 36 real keyboard jumps and walk-offs with boy/girl, exact visible/physics surface, 2 variants, 2–5 nonphysical decorations, varied layouts, deterministic seed/restart, 27 shared textures without growth, mobile and no browser errors.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
