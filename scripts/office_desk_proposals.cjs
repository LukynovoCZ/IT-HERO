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
  code+=`
{const D=window.ITHeroOfficeDesks;Object.assign(D.structure,${JSON.stringify({metal:v.metal,highlight:v.highlight,legWidth:v.width})});D.background.alpha=${v.dim};
   Object.assign(D.palettes.wood,${JSON.stringify({top:v.id==='C'?'#ffdda0':'#f5d49a',edge:v.id==='C'?'#d99a54':'#c18a50',drawer:v.id==='C'?'#ddd2b5':'#b9c5ca'})});
   Object.assign(D.palettes.modern,${JSON.stringify(v.id==='B'?{top:'#fff8df',edge:'#b9c8cc',drawer:'#eceddf'}:{top:'#edf2ed',edge:'#abbcc6',drawer:'#d0d9de'})});
   const preload=D.preload;D.preload=scene=>{const load=scene.load.image;scene.load.image=function(key,...args){return key.startsWith('office-desk-')?this:load.call(this,key,...args);};try{preload(scene);}finally{scene.load.image=load;}};}`;
  return r.fulfill({body:code,contentType:'text/javascript'});
 });
 await p.route('**/game.js*',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({').replace('this.buildOffice();',"this.registry.set('officeDeskSeed','proposal-review');this.buildOffice();")});});
 await p.goto(process.env.IT_HERO_PREVIEW_URL||'http://127.0.0.1:8000');await p.locator('#game-action').click();
 await p.evaluate(dim=>{const s=__g.scene.getScene('ITGame');s.enemies.clear(true,true);s.player.body.reset(230,4280);s.player.setVelocity(0);s.nextHelperAt=Infinity;s.colleague.state.nextAt=Infinity;s.oldBadger.state.nextAt=Infinity;s.genZ.state.nextAt=Infinity;s.founders.state.nextAt=Infinity;s.officeDesks.forEach((d,i)=>d.setTexture(i%2?'office-desk-modern':'office-desk-wood'));},v.dim);
 await p.waitForTimeout(600);await p.locator('#game canvas').screenshot({path:`docs/office-desks/proposals/${v.id}.png`});await p.close();console.log('Captured '+v.id);
 }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
