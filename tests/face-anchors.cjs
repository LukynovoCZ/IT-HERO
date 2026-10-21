const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();await page.route('**/character-preview.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__faces=new Phaser.Game({')});});
 await page.goto('http://127.0.0.1:8000/character-preview.html');await page.waitForFunction(()=>__faces.scene.scenes[0].entries?.length===25);
 const result=await page.evaluate(()=>{
  const scene=__faces.scene.scenes[0];const pixels=key=>{const im=scene.textures.get(key).getSourceImage(),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);return {data:ctx.getImageData(0,0,c.width,c.height).data,w:c.width};};
  const anchors={idle:[36,22],walk:[43,22],'walk-alt':[36,22],explain:[36,22],tablet:[36,22],scream:[38,21],scream_alt:[38,21],golf:[43,22],golf_follow:[43,22],hit:[38,22],defeat:[38,39]};
  const poses=Object.entries(anchors).map(([pose,[cx,cy]])=>{const key='trio-design_manager-'+pose,a=pixels(key),b=pixels('free-'+key);let changed=0,outside=0;for(let i=0;i<a.data.length;i+=4){if(a.data.slice(i,i+4).some((v,j)=>v!==b.data[i+j])){changed++;const x=i/4%a.w,y=Math.floor(i/4/a.w);if(x<cx-4||x>cx+4||y<cy-2||y>cy)outside++;}}return {pose,changed,outside};});
  const union=pixels('free-preview-legacy-2-idle'),approved=pixels('union-public-idle');
  return {poses,approvedUnion:Array.from(union.data).every((v,i)=>v===approved.data[i])};
 });
 assert(result.poses.every(p=>p.changed>0&&p.outside===0),JSON.stringify(result.poses));assert(result.approvedUnion,'Public union must use the approved drawn sprite');
 await page.selectOption('#zoom','2');await page.locator('#game').screenshot({path:'/tmp/it-hero-tests/face-fixes-gallery.png'});
 console.log('PASS all eleven moustache poses alter only upper-lip/curl pixels, mirrored golf anchor, approved naturally shaded union artwork.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
