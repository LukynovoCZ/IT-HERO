/* Two visual sets share poses, feet and hitboxes. Only six office characters change. */
(() => {
 'use strict';
 const state={original:false,god:false,training:false};
 const kindOf=key=>{
  if(key.endsWith('-source')||key.startsWith('union-public-'))return null;
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
 function preload(scene){scene.load.image('union-public-source','assets/characters/union-public.png?v=0.24.0');}
 function unionFrames(scene){
  if(scene.publicUnionFrames)return scene.publicUnionFrames;
  const source=scene.textures.get('union-public-source').getSourceImage(),cw=Math.floor(source.width/2),scratch=document.createElement('canvas');scratch.width=source.width;scratch.height=source.height;const sc=scratch.getContext('2d');sc.drawImage(source,0,0);const pixels=sc.getImageData(0,0,source.width,source.height).data,bounds=[];
  for(let k=0;k<2;k++){let left=cw,top=source.height,right=0,bottom=0;for(let y=0;y<source.height;y++)for(let x=0;x<cw;x++)if(pixels[(y*source.width+k*cw+x)*4+3]>160){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}bounds.push({x:k*cw+left,y:top,w:right-left+1,h:bottom-top+1});}
  const scale=Math.min(76/Math.max(...bounds.map(b=>b.h)),62/Math.max(...bounds.map(b=>b.w))),frames={};
  ['idle','contact'].forEach((pose,i)=>{const key='union-public-'+pose;frames[pose]=key;if(scene.textures.exists(key))return;const b=bounds[i],t=scene.textures.createCanvas(key,64,80),c=t.context;c.imageSmoothingEnabled=false;const w=Math.round(b.w*scale),h=Math.round(b.h*scale);c.drawImage(source,b.x,b.y,b.w,b.h,Math.round((64-w)/2),80-h,w,h);const data=c.getImageData(0,0,64,80);for(let j=3;j<data.data.length;j+=4)data.data[j]=data.data[j]>160?255:0;c.putImageData(data,0,0);t.refresh();});
  scene.publicUnionFrames=ITHeroMotion.complete(scene,frames,{prefix:'union-public'});return scene.publicUnionFrames;
 }
 function prepare(scene){
  const approvedUnion=unionFrames(scene);
  const map=new Map();for(const key of scene.textures.getTextureKeys()){
   if(key.startsWith('free-'))continue;const kind=kindOf(key);if(!kind)continue;
   const src=scene.textures.get(key).getSourceImage();if(!src?.width)continue;
   const alt=`free-${key}`;if(!scene.textures.exists(alt)){const t=scene.textures.createCanvas(alt,src.width,src.height);t.context.imageSmoothingEnabled=false;if(kind==='union'){const suffix=key.split('-').at(-1),pose=key.endsWith('walk-alt')?'walk_alt':key==='union-whistle'||suffix==='contact'?'contact':approvedUnion[suffix]?suffix:'idle';t.context.drawImage(scene.textures.get(approvedUnion[pose]).getSourceImage(),0,0);}else{t.context.drawImage(src,0,0);draw(t.context,kind,src.width,src.height,key);}t.refresh();}map.set(key,alt);
  }
  scene.appearanceMap=map;
  const sync=()=>{const visit=o=>{if(o.texture){const current=o.texture.key,base=current.startsWith('free-')?current.slice(5):current,alt=map.get(base);if(alt){const key=state.original?base:alt;if(key!==current)o.setTexture(key);}}if(o.list)o.list.forEach(visit);};scene.children.list.forEach(visit);};
  scene.events.on('postupdate',sync);scene.events.once('shutdown',()=>scene.events.off('postupdate',sync));sync();return map;
 }
 function texture(scene,key){return state.original?key:scene.appearanceMap?.get(key)||key;}
 window.ITHeroAppearance={state,preload,prepare,texture,kindOf};
})();
