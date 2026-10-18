/* Shared pixel poses, anchored to the same feet. No changes to physics bodies. */
(() => {
 'use strict';
 function canvas(scene,key,w,h,draw){if(scene.textures.exists(key))return key;const t=scene.textures.createCanvas(key,w,h);t.context.imageSmoothingEnabled=false;draw(t.context);t.refresh();return key;}
 function complete(scene,frames,{prefix='motion',sameWalk=false}={}){
  const source=scene.textures.get(frames.idle).getSourceImage(),w=source.width,h=source.height;
  const make=(pose,draw)=>canvas(scene,`${prefix}-${pose}`,w,h,draw);
  const step=sign=>c=>{const split=Math.floor(h*.7),mid=Math.floor(w/2);c.drawImage(source,0,0,w,split,0,0,w,split);c.drawImage(source,0,split,mid,h-split,-sign*2,split,mid,h-split);c.drawImage(source,mid,split,w-mid,h-split,mid+sign*2,split,w-mid,h-split);};
  if(!frames.walk||sameWalk)frames.walk=make('walk',step(1));
  if(!frames.walk_alt)frames.walk_alt=make('walk-alt',step(-1));
  if(!frames.attack)frames.attack=make('attack',c=>{c.drawImage(source,0,0);const x=Math.round(w*.57),y=Math.round(h*.42);c.fillStyle='#17212c';c.fillRect(x,y,Math.round(w*.2),5);c.fillStyle='#ecb48c';c.fillRect(x+Math.round(w*.15),y,5,4);});
  if(!frames.contact)frames.contact=frames.attack;
  if(!frames.hit||sameWalk)frames.hit=make('hit',c=>{const split=h-10;c.drawImage(source,0,0,w,split,2,0,w,split);c.drawImage(source,0,split,w,10,0,split,w,10);});
  if(!frames.defeat||sameWalk)frames.defeat=make('defeat',c=>{c.drawImage(source,0,h*.4,w,h*.6,0,h*.55,w,h*.45);c.drawImage(source,0,0,w,h*.4,2,h*.15,w,h*.4);});
  return frames;
 }
 const variants=[{id:'blonde',name:'BLOND',hair:'#d6ac58',light:'#f7d782',top:'#9f3551'},{id:'black',name:'ČERNOVLASÁ',hair:'#191d29',light:'#475064',top:'#31556b'},{id:'brown',name:'HNĚDOVLASÁ',hair:'#683b29',light:'#a36940',top:'#48614c'}];
 function secretaries(scene,base={idle:'secretary',contact:'secretary-scream'}){return variants.map(v=>{
  const frames={};for(const pose of ['idle','contact','attack'])frames[pose]=canvas(scene,`secretary-${v.id}-${pose}`,64,80,c=>{
   // Keep the established atlas body, shading and facial detail. Only the hair,
   // blouse palette and throwing arm change; all three share identical gameplay.
   c.drawImage(scene.textures.get(pose==='contact'?base.contact:base.idle).getSourceImage(),0,0);
   const pixels=c.getImageData(0,0,64,80),d=pixels.data;
   const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),hair=rgb(v.hair),top=rgb(v.top);
   for(let y=0;y<80;y++)for(let x=0;x<64;x++){
    const i=(y*64+x)*4,[r,g,b]=d.slice(i,i+3);if(!d[i+3])continue;
    const golden=r>100&&g>65&&r>g*1.04&&g>b*1.35;
    const headHair=y<33&&golden&&(y<14||x<30||x>44);
    if(headHair){if(y>25&&x<30){d[i+3]=0;continue;}const shade=.48+(r+g)/550;for(let k=0;k<3;k++)d[i+k]=Math.min(255,Math.round(hair[k]*shade));}
    if(y>30&&y<57&&r>g*1.5&&r>b*1.2){const shade=.5+r/240;for(let k=0;k<3;k++)d[i+k]=Math.min(255,Math.round(top[k]*shade));}
   }
   c.putImageData(pixels,0,0);
   const r=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
   // Short layered bob; leave the original eyes, glasses, face and expression.
   r(v.hair,24,10,5,12);r(v.light,25,10,2,8);r(v.hair,25,21,5,4);r(v.hair,44,12,3,12);r(v.light,44,12,1,7);
   if(pose==='attack'){r(v.top,43,32,11,6);r('#e9b18c',51,31,7,5);r('#17212c',56,28,7,9);r('#eee6ce',57,29,6,7);}
  });return {...v,frames:complete(scene,frames,{prefix:`secretary-${v.id}`})};});}
 window.ITHeroMotion={complete,secretaries,variants};
})();
