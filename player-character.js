/* Player appearance only: both choices use identical physics and controls. */
(()=>{'use strict';
 const state={id:'boy'},poses=['idle','walk','walk_alt','jump','attack','crouch','hit','defeat'];
 function preload(scene){scene.load.image('hero-girl-source','assets/characters/hero-girl.png?v=0.24.0');scene.load.image('hero-girl-walk-source','assets/characters/hero-girl-walk.png?v=0.26.9');scene.load.image('hero-boy-walk-source','assets/characters/hero-boy-walk.png?v=0.28.1');}
 function walkTextures(scene,prefix,sourceKey){
  if(!scene.textures.exists(prefix+'-walk-0')){
   const image=scene.textures.get(sourceKey).getSourceImage(),cw=Math.floor(image.width/4),ch=Math.floor(image.height/2),source=document.createElement('canvas');source.width=image.width;source.height=image.height;const ctx=source.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data,bounds=[];
   for(let i=0;i<8;i++){const ox=i%4*cw,oy=Math.floor(i/4)*ch;let l=cw,r=0,t=ch,b=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((oy+y)*image.width+ox+x)*4+3]>170){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}bounds.push({l,r,t,b});}
   // One scale for the entire walk/shoot cycle: the torso must not resize at each step.
   const width=Math.max(...bounds.map(b=>b.r-b.l+1)),height=Math.max(...bounds.map(b=>b.b-b.t+1)),scale=Math.min(76/height,62/width),scaleY=76/height;
   bounds.forEach((b,i)=>{const t=scene.textures.createCanvas(prefix+'-walk-'+(i>=4?'attack-':'')+(i%4),64,80),c=t.context,w=cw*scale,h=ch*scaleY;c.imageSmoothingEnabled=false;c.drawImage(image,i%4*cw,Math.floor(i/4)*ch,cw,ch,Math.round(32-cw*scale/2),Math.round(80-(b.b+1)*scaleY),w,h);const data=c.getImageData(0,0,64,80);for(let a=3;a<data.data.length;a+=4)data.data[a]=data.data[a]>170?255:0;c.putImageData(data,0,0);t.refresh();});
  }
 }
 function textures(scene,boy={idle:'hero',walk:'hero-walk',crouch:'hero-duck',jump:'hero'}){
  if(!scene.textures.exists('girl-idle')){
   const image=scene.textures.get('hero-girl-source').getSourceImage(),cw=Math.floor(image.width/4),ch=Math.floor(image.height/2),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;
   poses.forEach((pose,index)=>{const ox=index%4*cw,oy=Math.floor(index/4)*ch;let left=cw,top=ch,right=0,bottom=0;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((oy+y)*image.width+ox+x)*4+3]>170){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    const w=right-left+1,h=bottom-top+1,height=pose==='crouch'?49:pose==='defeat'?40:76,scale=Math.min(height/h,62/w),dw=Math.round(w*scale),dh=Math.round(h*scale),t=scene.textures.createCanvas('girl-'+pose,64,80),c=t.context;c.imageSmoothingEnabled=false;c.drawImage(image,ox+left,oy+top,w,h,Math.round((64-dw)/2),80-dh,dw,dh);const data=c.getImageData(0,0,64,80);for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]>170?255:0;c.putImageData(data,0,0);t.refresh();
   });
  }
  walkTextures(scene,'girl','hero-girl-walk-source');
  walkTextures(scene,'boy','hero-boy-walk-source');
  scene.playerFrames={boy:{...boy,crouch:'hero-duck',jump:boy.jump||'hero'},girl:Object.fromEntries(poses.map(p=>[p,'girl-'+p]))};
  scene.playerFrames.boy.walk='boy-walk-0';scene.playerFrames.boy.walk_alt='boy-walk-2';
  scene.playerFrames.girl.walk='girl-walk-0';scene.playerFrames.girl.walk_alt='girl-walk-2';
  scene.heroFrames=scene.playerFrames[state.id];return scene.playerFrames;
 }
 function key(scene,pose='idle',id=state.id){return (scene.playerFrames||scene.source?.playerFrames)?.[id]?.[pose]||(id==='girl'?'girl-'+pose:pose==='walk'?'hero-walk':pose==='crouch'?'hero-duck':'hero');}
 function cycleKey(scene,phase,attacking=false,id=state.id){const prefix=id==='girl'?'girl':'boy';return scene.textures.exists(prefix+'-walk-0')?prefix+'-walk-'+(attacking?'attack-':'')+(Math.floor(phase)%4):key(scene,attacking?'attack':Math.floor(phase)%2?'walk_alt':'walk',id);}
 const walks=new WeakMap();
 function movementKey(scene,time,{moving,grounded,crouching=false,attacking=false,period=130}){
  const player=scene.player;let walk=walks.get(player);if(!walk)walks.set(player,walk={x:player.x,travel:0,active:false,frame:0});
  const distance=Math.abs(player.x-walk.x);walk.x=player.x;
  walk.active=!!(moving&&grounded&&!crouching);
  if(walk.active&&distance<30){walk.travel+=distance;walk.frame=Math.floor(walk.travel/18)%4;}else if(!moving){walk.travel=0;walk.frame=0;}
  if(crouching)return key(scene,'crouch');
  if(walk.active&&scene.textures.exists((state.id==='girl'?'girl':'boy')+'-walk-0'))return cycleKey(scene,walk.frame,attacking);
  return key(scene,attacking?'attack':!grounded?'jump':moving?(Math.floor(time/period)%2?'walk_alt':'walk'):'idle');
 }
 function attackKey(scene){const walk=walks.get(scene.player);return walk?.active?cycleKey(scene,walk.frame,true):key(scene,'attack');}
 function sync(scene){const picker=document.getElementById('player-choice');if(!picker)return;picker.hidden=scene.gameState!=='menu';picker.disabled=scene.gameState!=='menu';for(const input of picker.querySelectorAll('input'))input.checked=input.value===state.id;}
 function attach(scene){
  const picker=document.getElementById('player-choice');scene.heroFrames=scene.playerFrames[state.id];if(!picker)return;
  const change=event=>{if(scene.gameState!=='menu'||!['boy','girl'].includes(event.target.value))return;state.id=event.target.value;scene.heroFrames=scene.playerFrames[state.id];scene.player.setTexture(key(scene));sync(scene);};
  const stop=event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();scene.handleStart();scene.game.canvas.focus({preventScroll:true});}};picker.addEventListener('change',change);picker.addEventListener('keydown',stop);
  for(const label of picker.querySelectorAll('label')){const id=label.querySelector('input').value,canvas=label.querySelector('canvas'),c=canvas.getContext('2d');c.clearRect(0,0,64,80);c.imageSmoothingEnabled=false;c.drawImage(scene.textures.get(key(scene,'idle',id)).getSourceImage(),0,0);}
  scene.events.once('shutdown',()=>{picker.removeEventListener('change',change);picker.removeEventListener('keydown',stop);});sync(scene);
 }
 window.ITHeroPlayer={state,preload,textures,key,cycleKey,movementKey,attackKey,attach,sync};
})();
