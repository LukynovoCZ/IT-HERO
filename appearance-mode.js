/* Two visual sets share poses, feet and hitboxes. Only six office characters change. */
(() => {
 'use strict';
 const state={original:false,god:false,training:false};
 const kindOf=key=>{
  if(key.endsWith('-source'))return null;
  if(key==='rainbow-flag')return 'flag';
  if(/^(union|legacy-union|preview-legacy-2)(-|$)/.test(key))return 'union';
  if(/^(manager|legacy-manager|preview-legacy-3)(-|$)/.test(key))return 'manager';
  if(/^(specialist|legacy-specialist|preview-legacy-5)(-|$)/.test(key))return 'specialist';
  if(key.startsWith('trio-design_manager-'))return 'design';
  if(key.startsWith('trio-sap_integrator-'))return 'sap';
  if(key.startsWith('badger-'))return 'senior';
  return null;
 };
 function draw(c,kind,w,h,key){
  const r=(color,x,y,a,b)=>{c.fillStyle=color;c.fillRect(x,y,a,b);};
  if(kind==='flag'){
   r('#f7cf48',4,3,48,30);r('#26332f',15,11,3,5);r('#26332f',36,11,3,5);r('#26332f',16,25,22,3);r('#26332f',12,20,4,5);r('#26332f',38,20,4,5);
  }else if(kind==='union'){
   // Keep warm skin pixels intact; shorten only the blonde hair outside the face.
   const im=c.getImageData(0,0,w,h),d=im.data;
   for(let y=0;y<35;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4,R=d[i],G=d[i+1],B=d[i+2];
    const highlight=y<15&&R>150&&G>140&&B>100&&R<G*1.15&&G<B*1.3;
    const hair=d[i+3]&&(highlight||R>65&&G>45&&R>G*1.02&&R<G*1.42&&G>B*1.3);
    if(!hair)continue;
    if(y>=18&&(x<27||x>48)){d[i+3]=0;continue;}
    if(y<18||x<29||x>48){const light=(R+G)/500;d[i]=Math.round((highlight?150:98)*light);d[i+1]=Math.round((highlight?110:61)*light);d[i+2]=Math.round((highlight?75:37)*light);}
   }c.putImageData(im,0,0);
   // Swept-back hair, a dark tie at the nape and a single long tapered ponytail.
   const dy=key.includes('contact')||key.includes('whistle')?2:0,dx=key.endsWith('-hit')?2:0;
   c.save();c.translate(dx,dy);
   r('#39291f',24,15,4,5);r('#68472f',24,14,3,5);r('#9b7250',25,15,1,3);
   r('#241f1b',22,18,4,3);r('#ac8b54',23,19,2,1);
   r('#35271f',19,21,6,6);r('#35271f',17,26,6,7);r('#35271f',18,32,4,5);
   r('#68472f',20,21,4,6);r('#68472f',18,26,4,7);r('#68472f',19,32,2,4);
   r('#9b7250',21,22,1,5);r('#9b7250',19,27,1,6);r('#4c3425',20,34,2,3);
   c.restore();
   // The original white beard belongs to the same brown hair palette.
   const beard=c.getImageData(0,0,w,h);for(let y=25;y<34;y++)for(let x=28;x<47;x++){const i=(y*w+x)*4,d=beard.data;if(d[i+3]&&Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])<35&&d[i]>95){const l=d[i]/255;d[i]=Math.round(62+97*l);d[i+1]=Math.round(43+80*l);d[i+2]=Math.round(29+61*l);}}c.putImageData(beard,0,0);
  }else if(kind==='manager'){
   // Stepped jaw edges and the silver hair palette keep the goatee in the face.
   r('#626569',29,25,7,2);r('#96999b',30,26,5,3);r('#bfc0bd',31,27,3,3);r('#73777a',31,30,3,1);
  }else if(kind==='design'){
   // Exact upper-lip coordinates in the normalized atlas, including mirrored golf art.
   const pose=key.slice('trio-design_manager-'.length);
   const anchors={idle:[36,22],walk:[43,22],'walk-alt':[36,22],explain:[36,22],tablet:[36,22],scream:[38,21],scream_alt:[38,21],golf:[43,22],golf_follow:[43,22],hit:[38,22],defeat:[38,39]};
   const [x,y]=anchors[pose]||anchors.idle;
   // Thin silver whiskers sit above the lips; the mouth and nose remain visible.
   r('#686765',x-3,y,3,1);r('#686765',x+1,y,3,1);
   r('#a8a49c',x-2,y,2,1);r('#a8a49c',x+1,y,2,1);
   r('#686765',x-4,y-1,2,1);r('#686765',x+3,y-1,2,1);
   r('#bcb7aa',x-4,y-2,1,1);r('#bcb7aa',x+4,y-2,1,1);
  }else if(kind==='sap'){
   const im=c.getImageData(0,0,w,h),d=im.data;let top=40;
   for(let y=8;y<38;y++){let count=0;for(let x=45;x<65;x++){const i=(y*w+x)*4;if(d[i+3]&&d[i]>d[i+1]*1.1&&d[i+1]>d[i+2]*1.1)count++;}if(count>=6){top=y;break;}}
   for(let y=top;y<top+9;y++)for(let x=44;x<66;x++){const i=(y*w+x)*4;if(d[i+3]&&d[i]>d[i+1]*1.1&&d[i+1]>d[i+2]*1.1&&y<top+3+(65-x)*.23){const shade=(x+y)%4;d[i]=30+shade*5;d[i+1]=26+shade*4;d[i+2]=28+shade*4;}}c.putImageData(im,0,0);
  }else if(kind==='senior'){
   const im=c.getImageData(0,0,w,h),d=im.data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!d[i+3])continue;
    if(!key.includes('stomp')&&y>29&&y<62&&!(d[i]>d[i+1]*1.2&&d[i+1]>d[i+2]*1.1)){const l=(d[i]+d[i+1]+d[i+2])/3;d[i]=Math.round(l*.25);d[i+1]=Math.round(l*.52);d[i+2]=Math.min(255,Math.round(l*.86+20));}
    if((y<18||key.includes('stomp')&&y>50&&y<65)&&x>23&&x<57){const l=(d[i]+d[i+1]+d[i+2])/3;d[i]=Math.min(255,170+l*.3);d[i+1]=Math.min(255,115+l*.3);d[i+2]=Math.min(255,83+l*.25);}
   }c.putImageData(im,0,0);
   // Public disguise: a charcoal bowler with a curved crown, band and brim.
   const brim=key.includes('stomp')?59:14;
   if(!key.includes('stomp'))c.clearRect(23,0,35,15);
   r('#121b23',35,brim-12,10,1);r('#121b23',32,brim-11,16,2);r('#121b23',30,brim-9,20,2);r('#121b23',28,brim-7,24,7);
   r('#34434f',35,brim-10,10,1);r('#34434f',32,brim-9,15,2);r('#26353f',30,brim-7,20,6);
   r('#101820',28,brim-2,24,3);r('#637178',30,brim-2,20,1);
   r('#111b23',24,brim+1,32,3);r('#46535c',26,brim+1,28,1);

  }else if(kind==='specialist'){
   if(key.includes('spray'))return;
   // Replace only saturated cloth pixels. Pole, body, hair and poses stay intact.
   const im=c.getImageData(0,0,w,h),d=im.data;let xs=[],ys=[];
   for(let y=0;y<55;y++)for(let x=77;x<w;x++){const i=(y*w+x)*4,R=d[i],G=d[i+1],B=d[i+2];if(d[i+3]&&Math.max(R,G,B)-Math.min(R,G,B)>70&&Math.max(R,G,B)>120){xs.push(x);ys.push(y);d[i]=247;d[i+1]=207;d[i+2]=72;}}
   c.putImageData(im,0,0);if(xs.length){const x=Math.round((Math.min(...xs)+Math.max(...xs))/2),y=Math.round((Math.min(...ys)+Math.max(...ys))/2);r('#23302e',x-5,y-4,2,3);r('#23302e',x+3,y-4,2,3);r('#23302e',x-4,y+4,8,2);r('#23302e',x-6,y+1,2,3);r('#23302e',x+4,y+1,2,3);}
  }
 }
 function prepare(scene){
  const map=new Map();for(const key of scene.textures.getTextureKeys()){
   if(key.startsWith('free-'))continue;const kind=kindOf(key);if(!kind)continue;
   const src=scene.textures.get(key).getSourceImage();if(!src?.width)continue;
   const alt=`free-${key}`;if(!scene.textures.exists(alt)){const t=scene.textures.createCanvas(alt,src.width,src.height);t.context.imageSmoothingEnabled=false;t.context.drawImage(src,0,0);draw(t.context,kind,src.width,src.height,key);t.refresh();}map.set(key,alt);
  }
  scene.appearanceMap=map;
  const sync=()=>{const visit=o=>{if(o.texture){const current=o.texture.key,base=current.startsWith('free-')?current.slice(5):current,alt=map.get(base);if(alt){const key=state.original?base:alt;if(key!==current)o.setTexture(key);}}if(o.list)o.list.forEach(visit);};scene.children.list.forEach(visit);};
  scene.events.on('postupdate',sync);scene.events.once('shutdown',()=>scene.events.off('postupdate',sync));sync();return map;
 }
 function texture(scene,key){return state.original?key:scene.appearanceMap?.get(key)||key;}
 window.ITHeroAppearance={state,prepare,texture,kindOf};
})();
