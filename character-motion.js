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
 const variants=[{id:'blonde',name:'BLOND',hair:['#715435','#aa7e44','#d5ab62','#f2d192','#fff0c3'],top:'#9f3551'},{id:'black',name:'ČERNOVLASÁ',hair:['#141823','#252a38','#3b4253','#596273','#7d8794'],top:'#31556b'},{id:'brown',name:'HNĚDOVLASÁ',hair:['#34241f','#553626','#805237','#ae7950','#d5a572'],top:'#48614c'}];
 function secretaries(scene,base={idle:'secretary',contact:'secretary-scream'}){return variants.map(v=>{
  const frames={};for(const pose of ['idle','contact','attack'])frames[pose]=canvas(scene,`secretary-${v.id}-${pose}`,64,80,c=>{
   // Keep the established atlas body, shading and facial detail. Only the hair,
   // blouse palette and throwing arm change; all three share identical gameplay.
   c.drawImage(scene.textures.get(pose==='contact'?base.contact:base.idle).getSourceImage(),0,0);
   const pixels=c.getImageData(0,0,64,80),d=pixels.data;
   const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),top=rgb(v.top),hair=v.hair.map(rgb);
   // Masks follow the atlas head in each pose. Raised arms and the warm skin
   // colours must never be used as a proxy for hair or burgundy clothing.
   const contact=pose==='contact';
   const faceAt=(x,y)=>(y>=13&&y<=17&&x>=33&&x<=40)||(y>=18&&y<=23&&x>=27&&x<=43)||(y>=24&&y<=26&&x>=28&&x<=40)||(y>=27&&y<=29&&x>=29&&x<=38)||(y>=20&&y<=26&&x>=25&&x<=27);
   const hairAt=(x,y)=>{
    if(faceAt(x,y))return false;
    if(y>=(contact?8:7)&&y<=12)return x>=(contact?23:20)&&x<=44;
    if(y>=13&&y<=17)return x>=(contact?21:18)&&x<=44;
    if(y>=18&&y<=23)return (x>=(contact?21:17)&&x<=26)||(x>=43&&x<=45);
    if(y>=24&&y<=29)return (x>=(contact?21:16)&&x<=25)||(x>=39&&x<=45);
    return false;
   };
   const trimAt=(x,y)=>contact
    ? (y>=26&&y<=38&&x>=14&&x<=24)||(y>=(x>=44?27:29)&&y<=32&&x>=40&&x<=46)
    : (y>=24+Math.max(0,Math.floor((x-15)/3))&&y<=35&&x>=14&&x<=25)||(y>=(x>=44?27:x>=42?28:30)&&y<=32&&x>=40&&x<=46);
   for(let y=0;y<80;y++)for(let x=0;x<64;x++){
    const i=(y*64+x)*4,[red,green,blue]=d.slice(i,i+3);if(!d[i+3])continue;
    const clothing=red>green*1.6&&blue>green*.85,collar=green>=red*.9&&blue>=red*.65;
    if(trimAt(x,y)&&!clothing&&!collar){d[i+3]=0;continue;}
    if(hairAt(x,y)){
     const luminance=red*.299+green*.587+blue*.114;
     const color=hair[luminance<65?0:luminance<115?1:luminance<170?2:luminance<215?3:4];
     for(let k=0;k<3;k++)d[i+k]=color[k];
    }
    if(y>28&&y<59&&red>45&&red>green*1.6&&blue>green*1.1){const shade=.4+red/230;for(let k=0;k<3;k++)d[i+k]=Math.min(255,Math.round(top[k]*shade));}
   }
   c.putImageData(pixels,0,0);
   const r=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
   if(pose==='attack'){r(v.top,43,32,11,6);r('#e9b18c',51,31,7,5);r('#17212c',56,28,7,9);r('#eee6ce',57,29,6,7);}
  });return {...v,frames:complete(scene,frames,{prefix:`secretary-${v.id}`})};});}
 window.ITHeroMotion={complete,secretaries,variants};
})();
