/* Player appearance only: both choices use identical physics and controls. */
(()=>{'use strict';
 const state={id:'boy'},poses=['idle','walk','walk_alt','jump','attack','crouch','hit','defeat'];
 function preload(scene){scene.load.image('hero-girl-source','assets/characters/hero-girl.png?v=0.24.0');}
 function textures(scene,boy={idle:'hero',walk:'hero-walk',crouch:'hero-duck',jump:'hero'}){
  if(!scene.textures.exists('girl-idle')){
   const image=scene.textures.get('hero-girl-source').getSourceImage(),cw=Math.floor(image.width/4),ch=Math.floor(image.height/2),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,image.width,image.height).data;
   poses.forEach((pose,index)=>{const ox=index%4*cw,oy=Math.floor(index/4)*ch;let left=cw,top=ch,right=0,bottom=0;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[((oy+y)*image.width+ox+x)*4+3]>170){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    const w=right-left+1,h=bottom-top+1,height=pose==='crouch'?49:pose==='defeat'?40:76,scale=Math.min(height/h,62/w),dw=Math.round(w*scale),dh=Math.round(h*scale),t=scene.textures.createCanvas('girl-'+pose,64,80),c=t.context;c.imageSmoothingEnabled=false;c.drawImage(image,ox+left,oy+top,w,h,Math.round((64-dw)/2),80-dh,dw,dh);const data=c.getImageData(0,0,64,80);for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]>170?255:0;c.putImageData(data,0,0);t.refresh();
   });
  }
  scene.playerFrames={boy:{...boy,crouch:'hero-duck',jump:boy.jump||'hero'},girl:Object.fromEntries(poses.map(p=>[p,'girl-'+p]))};
  scene.heroFrames=scene.playerFrames[state.id];return scene.playerFrames;
 }
 function key(scene,pose='idle',id=state.id){return (scene.playerFrames||scene.source?.playerFrames)?.[id]?.[pose]||(id==='girl'?'girl-'+pose:pose==='walk'?'hero-walk':pose==='crouch'?'hero-duck':'hero');}
 function sync(scene){const picker=document.getElementById('player-choice');if(!picker)return;picker.hidden=scene.gameState!=='menu';picker.disabled=scene.gameState!=='menu';for(const input of picker.querySelectorAll('input'))input.checked=input.value===state.id;}
 function attach(scene){
  const picker=document.getElementById('player-choice');scene.heroFrames=scene.playerFrames[state.id];if(!picker)return;
  const change=event=>{if(scene.gameState!=='menu'||!['boy','girl'].includes(event.target.value))return;state.id=event.target.value;scene.heroFrames=scene.playerFrames[state.id];scene.player.setTexture(key(scene));sync(scene);};
  const stop=event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();scene.handleStart();scene.game.canvas.focus({preventScroll:true});}};picker.addEventListener('change',change);picker.addEventListener('keydown',stop);
  for(const label of picker.querySelectorAll('label')){const id=label.querySelector('input').value,canvas=label.querySelector('canvas'),c=canvas.getContext('2d');c.clearRect(0,0,64,80);c.imageSmoothingEnabled=false;c.drawImage(scene.textures.get(key(scene,'idle',id)).getSourceImage(),0,0);}
  scene.events.once('shutdown',()=>{picker.removeEventListener('change',change);picker.removeEventListener('keydown',stop);});sync(scene);
 }
 window.ITHeroPlayer={state,preload,textures,key,attach,sync};
})();
