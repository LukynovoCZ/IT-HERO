const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/game.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('new Phaser.Game({','window.__g=new Phaser.Game({')});});await p.goto('http://127.0.0.1:8000');await p.locator('#game-action').waitFor();
 const result=await p.evaluate(()=>{const s=__g.scene.getScene('ITGame'),image=key=>{const c=s.textures.get(key).getSourceImage();return c.getContext('2d').getImageData(0,0,64,80).data;},problems=[];
  const equalRect=(a,b,box,label)=>{const [x,y,w,h]=box;for(let j=y;j<y+h;j++)for(let k=x;k<x+w;k++){const i=(j*64+k)*4;if([0,1,2,3].some(n=>a[i+n]!==b[i+n])){problems.push(`${label}: ${k},${j}`);return;}}};
  for(const variant of s.secretaryVariants){for(const pose of ['idle','contact','attack']){const base=image(pose==='contact'?'secretary-scream':'secretary'),frame=image(variant.frames[pose]);
   for(let y=0;y<32;y++)for(let x=14;x<49;x++){const i=(y*64+x)*4;if(base[i+3]===0&&frame[i+3]!==0)problems.push(`${variant.id}/${pose}: added floating pixel ${x},${y}`);}
   equalRect(base,frame,[28,18,15,5],`${variant.id}/${pose} eyes/glasses`);
   if(pose==='contact'){equalRect(base,frame,[7,4,12,14],`${variant.id} left hand`);equalRect(base,frame,[49,4,14,13],`${variant.id} right hand`);}
   else equalRect(base,frame,[24,43,7,3],`${variant.id} resting hand`);
  }
  const idle=image(variant.frames.idle);for(const pose of ['walk','walk_alt','attack'])equalRect(idle,image(variant.frames[pose]),[0,0,50,27],`${variant.id}/${pose} fixed head anchor`);
  }
  const c=document.createElement('canvas');c.width=1024;c.height=960;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#18352a';ctx.fillRect(0,0,c.width,c.height);['idle','contact','attack'].forEach((pose,j)=>{const keys=[pose==='contact'?'secretary-scream':'secretary',...s.secretaryVariants.map(v=>v.frames[pose])];keys.forEach((key,i)=>ctx.drawImage(s.textures.get(key).getSourceImage(),i*256,j*320,256,320));});return {problems,sheet:c.toDataURL().split(',')[1]};});
 fs.mkdirSync('/tmp/it-hero-tests',{recursive:true});fs.writeFileSync('/tmp/it-hero-tests/secretary-hair.png',Buffer.from(result.sheet,'base64'));assert.deepEqual(result.problems,[]);assert.deepEqual(errors,[]);console.log('PASS secretary hair: all 3 variants/poses, no floating added hair pixels, original eyes/glasses and raised/resting hands preserved, head anchored throughout walk and throw.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
