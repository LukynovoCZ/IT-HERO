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
   const im=c.getImageData(0,0,w,h),d=im.data;for(let y=0;y<35;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,R=d[i],G=d[i+1],B=d[i+2];if(d[i+3]&&R>65&&G>45&&R>G*1.02&&R<G*1.42&&G>B*1.3){const light=(R+G)/500;d[i]=Math.round(98*light);d[i+1]=Math.round(61*light);d[i+2]=Math.round(37*light);}}c.putImageData(im,0,0);
   r('#3d2a20',22,19,4,13);r('#885b37',22,20,2,11);r('#b59b62',22,19,4,2);r('#513522',20,29,5,4);
  }else if(kind==='manager'){
   r('#483832',28,24,9,5);r('#66514a',30,27,5,5);r('#c6b5a2',31,28,2,3);
  }else if(kind==='design'){
   r('#3b2924',32,22,13,3);r('#3b2924',29,19,4,5);r('#3b2924',44,18,4,6);r('#efc19a',30,19,2,2);r('#efc19a',45,18,2,3);
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
   // Rounded bald crown replaces the pointed grey hair, preserving the beard.
   if(!key.includes('stomp')){c.clearRect(23,0,35,15);for(let y=7;y<17;y++){const half=Math.round(13*Math.sqrt(Math.max(0,1-((y-17)/11)**2)));r(y<10?'#dca07c':'#eeb58a',40-half,y,half*2,1);}r('#f8c99a',34,10,8,2);}
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
