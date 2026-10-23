/* Run a local server first: python -m http.server 8000. No external assets/tools. */
const {chromium}=require('playwright'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage();await p.route('**/game.js*',async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor();
 const files=await p.evaluate(()=>{const s=__g.scene.getScene('ITGame');for(const key of s.textures.getTextureKeys().filter(k=>/^office-(desk|item)-/.test(k)))s.textures.remove(key);ITHeroOfficeDesks.createDeskTextures(s);return Object.fromEntries(s.textures.getTextureKeys().filter(k=>/^office-(desk|item)-/.test(k)).map(k=>[k,s.textures.get(k).getSourceImage().toDataURL().split(',')[1]]));});
 fs.mkdirSync('assets/office-desks',{recursive:true});for(const [key,data]of Object.entries(files))fs.writeFileSync('assets/office-desks/'+key+'.png',Buffer.from(data,'base64'));console.log('Exported '+Object.keys(files).length+' transparent textures.');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
