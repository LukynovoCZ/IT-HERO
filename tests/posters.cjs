const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});page.setDefaultTimeout(10000);const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000'))external.push(r.url());});
  await page.route('**/game.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});});
  await page.goto('http://127.0.0.1:8000');await page.locator('#game-action').waitFor({state:'visible'});
  const catalog=await page.evaluate(()=>({
   defs:ITHeroPosters.definitions,
   posters:window.__testGame.scene.getScene('ITGame').posters.posters.map(p=>({floor:p.placement.floor,id:p.definition.id,key:p.image.texture.key,width:p.image.displayWidth,height:p.image.displayHeight})),
   count:window.__testGame.textures.getTextureKeys().filter(k=>k.startsWith('corporate-poster-')).length
  }));
  assert.equal(catalog.defs.length,12);assert.equal(catalog.posters.length,17);
  assert.equal(new Set(catalog.posters.map(p=>p.id)).size,12);
  for(let floor=1;floor<=9;floor++)assert.ok([1,2].includes(catalog.posters.filter(p=>p.floor===floor).length));
  const expected=[
   ['NEJVĚTŠÍ INOVACE\nVZNIKAJÍ V PÁTEK V OFISU','Spolupráce. Energie. Přítomnost.'],
   ['VYŘEŠENO ZNAMENÁ\nPŘEPOSLÁNO','Efektivní ticket management v moderní organizaci.'],
   ['CO FUNGUJE,\nTO ZMIGRUJEME','Transformace je cesta k budoucnosti.'],
   ['STRATEGICKY ALAJNOVÁNI.\nPRAKTICKY ZTRACENI.','Jedna vize. Mnoho směrů.'],
   ['PEOPLE FIRST.\nPROCESS ALWAYS.','Na lidech nám záleží. Proto máme jasná pravidla.'],
   ['HOME OFFICE JE BENEFIT.\nPRÁZDNÁ ŽIDLE JE PROBLÉM.','Společně tvoříme kulturu přítomnosti.'],
   ['SOFTWARE DEFINED VEHICLE.\nMEETING DEFINED COMPANY.','Budoucnost mobility vzniká spoluprací.'],
   ['KAŽDÝ PROBLÉM MÁ ŘEŠENÍ.\nDALŠÍ MEETING.','Sdílením perspektiv zrychlujeme rozhodování.'],
   ['FUTURE READY.\nPRODUCTION PENDING.','Inovace dnes. Implementace zítra.'],
   ['ZMĚNA JE\nJEDINÁ KONSTANTA','Reorganizace podporuje růst, pružnost a odolnost.'],
   ['POKUD TO NEJDE,\nTAK TO UDĚLEJTE AIČKEM.','Inovace neznají překážky.'],
   ['JE JEN JEDNO PRAVIDLO:\nVEDENÍ MÁ VŽDYCKY PRAVDU.','Naše hodnoty. Naše pravidla.']
  ];
  assert.deepEqual(catalog.defs.map(d=>[d.title,d.subtitle]),expected);
  assert.equal(catalog.count,12);
  assert.ok(catalog.posters.every(p=>p.width===72&&p.height===90));
  await page.keyboard.press('Enter');
  await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.enemies.clear(true,true);s.player.body.reset(240,4280);s.player.setVelocity(0,0)});
  await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').posters.tooltip.visible);
  assert.ok(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').posters.tooltip.text).then(t=>t.includes('PEOPLE FIRST.')&&t.includes('jasná pravidla.')));
  await page.screenshot({path:'/tmp/it-hero-tests/posters-tooltip.png'});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').posters.tooltip.visible);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').player.body.reset(500,4280));
  await page.waitForFunction(()=>!window.__testGame.scene.getScene('ITGame').posters.tooltip.visible);
  // New IDs, colors, dimensions and placements must work without game changes.
  const custom=await page.evaluate(()=>{
   const s=window.__testGame.scene.getScene('ITGame');
   const m=ITHeroPosters.mount(s,[4320],{
    definitions:[{id:'thirteen-test',title:'TEST TŘINÁCT',subtitle:'Nový plakát.',theme:'test',bgColor:'#ffffff',accentColor:'#cf3344',textColor:'#102030',icon:'chart',width:160,height:200}],
    placements:[{floor:1,x:340,y:-260,poster:'thirteen-test'}]
   });
   const result={width:m.posters[0].image.displayWidth,height:m.posters[0].image.displayHeight};
   m.destroy();return result;
  });
  assert.deepEqual(custom,{width:80,height:100});
  await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.energy=1;s.lastHit=-3000;s.takeDamage(s.player.x+100)});
  await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').overlayTitle.text==='DOSTALI TĚ!');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
  assert.equal(await page.evaluate(()=>window.__testGame.scene.getScene('ITGame').posters.posters.length),17);
  assert.equal(await page.evaluate(()=>window.__testGame.textures.getTextureKeys().filter(k=>k.startsWith('corporate-poster-')&&!k.includes('thirteen-test')).length),12);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  console.log('PASS 12 exact slogans, 17 placements across 9 floors, generated textures, proximity/pause tooltips, custom 13th poster, clean restart, no external requests');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
