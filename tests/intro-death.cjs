const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 require('node:fs').mkdirSync('/tmp/it-hero-tests',{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const page=await browser.newPage();page.setDefaultTimeout(10000);
  const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.route('**/game.js*',async route=>{
   const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__testGame = new Phaser.Game({')});
  });
  await page.goto('http://127.0.0.1:8000');
  await page.locator('#game-action').waitFor({state:'visible'});
  assert.equal(await page.locator('.eyebrow').textContent(),'PTG PIXEL OFFICE ARCADE');
  assert.equal(await page.locator('.version').textContent(),'BUILD 0.9.0');
  const intro=await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');return {title:s.overlaySub.text,body:s.overlayBody.text}});
  assert.equal(intro.title,'NO MORE MEETING');assert.ok(intro.body.includes('životně důležité misi'));
  assert.ok(requests.some(url=>url.endsWith('game.js?v=0.9.0')));
  await page.locator('.mission-story summary').click();
  assert.ok(await page.locator('.mission-story').innerText().then(t=>t.includes('9029/775 v LínémX')));
  console.log('PASS updated header, intro mission, expanded story and versioned script');
  const lines=[];
  for(let i=0;i<11;i++){
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='playing');
   await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');s.energy=1;s.lastHit=-3000;s.takeDamage(s.player.x+100)});
   await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').overlayTitle.text==='DOSTALI TĚ!' && window.__testGame.scene.getScene('ITGame').overlay.visible);
   const result=await page.evaluate(()=>{const s=window.__testGame.scene.getScene('ITGame');const b=s.overlayBody.getBounds();return {body:s.overlayBody.text,y:b.y,bottom:b.bottom,sub:s.overlaySub.text}});
   assert.equal(result.sub,'TVŮJ NOVÝ ÚKOL:');assert.ok(result.y>185 && result.bottom<355,'Death quote must fit between subtitle and restart button');
   lines.push(result.body.split('\n\n')[0]);
   if(i===0) await page.screenshot({path:'/tmp/it-hero-tests/death-new.png'});
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>window.__testGame.scene.getScene('ITGame').gameState==='menu');
  }
  assert.equal(new Set(lines.slice(0,10)).size,10);assert.notEqual(lines[9],lines[10]);
  assert.ok(lines.some(t=>t.includes('vysokozdvižných')));assert.ok(lines.some(t=>t.includes('dotazník')));
  assert.deepEqual(errors,[]);
  console.log('PASS 11 actual deaths/restarts: all 10 quotes shown, no adjacent repetition, readable text, no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
