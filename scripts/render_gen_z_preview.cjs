// Render the actual game textures at 3×. Requires the local HTTP server on :8000.
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.route('**/character-preview.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__preview=new Phaser.Game({')});});
  await page.goto('http://127.0.0.1:8000/character-preview.html');
  await page.waitForFunction(()=>window.__preview?.scene.scenes[0].entries?.length===15);
  const data=await page.evaluate(()=>{
   const scene=__preview.scene.scenes[0],frames=ITHeroGenZ.textures(scene);
   const canvas=document.createElement('canvas');canvas.width=960;canvas.height=700;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
   c.fillStyle='#102a26';c.fillRect(0,0,960,700);
   c.fillStyle='#e6eddd';c.font='bold 20px monospace';c.textAlign='center';c.fillText('GEN Z • VIZUÁLNÍ NÁVRH 0.14.2',480,30);
   for(const [row,variant] of ['girl','boy'].entries()){
    const y=94+row*320;c.fillStyle=variant==='girl'?'#df9c78':'#8dcdd3';c.font='bold 17px monospace';c.textAlign='left';c.fillText(variant==='girl'?'GEN Z – HOLKA':'GEN Z – KLUČINA',22,y-29);
    for(const [col,[pose,label]] of [['idle','Klid'],['phone-scroll','Scrollování'],['shrug','Pokrčení ramen']].entries()){
     const x=col*320;c.fillStyle='#183832';c.fillRect(x+20,y-14,280,264);c.strokeStyle='#42675a';c.strokeRect(x+20,y-14,280,264);
     c.fillStyle='#b5d6bd';c.font='12px monospace';c.textAlign='center';c.fillText(label,x+160,y-2);
     c.drawImage(scene.textures.get(frames[variant][pose]).getSourceImage(),x+64,y+3,192,240);
     c.fillStyle='#97bf80';c.fillRect(x+21,y+243,278,2);
    }
   }
   c.fillStyle='#adc2ba';c.font='12px monospace';c.textAlign='center';c.fillText('Skutečné herní snímky • ostré pixely • zvětšení 3× • společná výška 76 px',480,686);
   return canvas.toDataURL('image/png').split(',')[1];
  });
  fs.writeFileSync('docs/gen-z-visuals-0.14.2.png',Buffer.from(data,'base64'));
  console.log('Rendered docs/gen-z-visuals-0.14.2.png from actual game textures');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
