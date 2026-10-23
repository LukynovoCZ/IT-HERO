/* Reproducible review screenshots; appearance overrides apply only in this browser. */
const {chromium}=require('playwright'),fs=require('node:fs');
const variants=[
 {id:'A',metal:'#c7d2d9',highlight:'#f6f4dd',width:4,dim:0},
 {id:'B',metal:'#e9e8d5',highlight:'#ffffff',width:4,dim:.20},
 {id:'C',metal:'#e4d6b6',highlight:'#fff7df',width:5,dim:.36}
];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{for(const v of variants){
 const p=await b.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});
 await p.route('**/community-config.js*',r=>r.fulfill({body:'window.ITHeroCommunityConfig={apiBaseUrl:""};',contentType:'text/javascript'}));
 await p.route('**/office-desks.js*',r=>{
  let code=fs.readFileSync('office-desks.js','utf8');
  code=code.replace("for(const [key,url] of Object.entries(textureSources))scene.load.image(key,url)","for(const [key,url] of Object.entries(textureSources))if(!key.startsWith('office-desk-'))scene.load.image(key,url)")
   .replace("metal='#3f515c'","metal='"+v.metal+"'").replaceAll("'#7d9098'","'"+v.highlight+"'")
   .replace('6,12,3,24','6,10,'+v.width+',26').replace('79,12,3,24','78,10,'+v.width+',26')
   .replace('6,12,1,24','6,10,2,26').replace('79,12,1,24','78,10,2,26');
  if(v.id==='B')code=code.replace("top:'#edf2ed',edge:'#abbcc6'","top:'#fff8df',edge:'#b9c8cc'").replace("drawer:'#d0d9de'","drawer:'#eceddf'");
  if(v.id==='C')code=code.replace("top:'#f5d49a',edge:'#c18a50'","top:'#ffdda0',edge:'#d99a54'").replace("drawer:'#b9c5ca'","drawer:'#ddd2b5'");
  return r.fulfill({body:code,contentType:'text/javascript'});
 });
 await p.route('**/game.js*',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({').replace('this.buildOffice();',"this.registry.set('officeDeskSeed','proposal-review');this.buildOffice();")});});
 await p.goto(process.env.IT_HERO_PREVIEW_URL||'http://127.0.0.1:8000');await p.locator('#game-action').click();
 await p.evaluate(dim=>{const s=__g.scene.getScene('ITGame');s.enemies.clear(true,true);s.player.body.reset(230,4280);s.player.setVelocity(0);s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.genZ.state.nextAt=Infinity;s.founders.state.nextAt=Infinity;s.officeDesks.forEach((d,i)=>d.setTexture(i%2?'office-desk-modern':'office-desk-wood'));if(dim)for(let floor=0;floor<9;floor++)s.add.rectangle(480,4320-floor*485-207,960,414,0x142c29,dim).setDepth(-8.5);},v.dim);
 await p.waitForTimeout(600);await p.locator('#game canvas').screenshot({path:`docs/office-desks/proposals/${v.id}.png`});await p.close();console.log('Captured '+v.id);
 }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
