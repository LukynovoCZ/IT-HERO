const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8000/character-preview.html');await p.waitForFunction(()=>document.querySelectorAll('.dialogue-card').length===12);
 assert.equal(await p.locator('.dialogue-card').count(),12);assert(await p.locator('#character-dialogue').innerText().then(t=>t.includes('Neviděli jste tu Laca?')&&t.includes('SAP TO VYŘEŠÍ!')));
 assert(await p.evaluate(()=>ITHeroSAP.quotes===ITHeroDialogue.lines('sap_integrator','combat')&&ITHeroColleague.quotes.coffee===ITHeroDialogue.lines('it_colleague','coffee')&&ITHeroOldBadger.blockLines===ITHeroDialogue.lines('old_badger','block')));
 const box=p.getByRole('textbox',{name:'STARÝ AJŤÁK: Nabídka piva',exact:true,includeHidden:true});await box.locator('..').locator('summary').click();await box.fill('Nová zkušební hláška\nDalší návrh');await p.reload();
 assert.equal(await box.inputValue(),'Nová zkušební hláška\nDalší návrh');assert(await p.evaluate(()=>ITHeroDialogue.lines('old_it','beer')[0]==='Ááá, plznička '),'Draft must not silently change game');
 const download=p.waitForEvent('download');await p.locator('#dialogue-download').click();const file=await download;assert.equal(file.suggestedFilename(),'it-hero-hlasky.json');const fs=require('node:fs');const exported=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(exported.find(c=>c.id==='old_it').groups[0].lines[0],'Nová zkušební hláška');
 await p.locator('#dialogue-reset').click();assert((await box.inputValue()).startsWith('Ááá, plznička '));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 console.log('PASS dialogue catalogue: 12 characters, shared live sources, readable mobile layout, editing and persistence, JSON export, reset, drafts isolated from game.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
