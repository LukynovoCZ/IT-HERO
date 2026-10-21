/* Stable avatar IDs only: portraits are drawn from the game's own textures. */
(()=>{'use strict';
 const choices=[
 ['hero','AJŤÁK','hero'],['secretary_blonde','SEKRETÁŘKA – BLOND','secretary-blonde-idle'],['secretary_black','SEKRETÁŘKA – ČERNOVLASÁ','secretary-black-idle'],['secretary_brown','SEKRETÁŘKA – HNĚDOVLASÁ','secretary-brown-idle'],
 ['union','ODBORÁŘ','union'],['manager','MANAŽER','manager'],['old_it','STARÝ AJŤÁK','old-it'],['specialist','SPECIALISTKA','specialist'],
 ['security_guard','Security master','trio-security_guard-idle'],['hr_manager','HR MANAŽERKA','trio-hr_manager-idle'],['design_manager','MANAŽER DESIGNU','trio-design_manager-idle'],['sap_integrator','ŠÉF SAP','trio-sap_integrator-idle'],
 ['it_colleague','IT KOLEGA','colleague-idle'],['old_badger','SENIOR MASTER','badger-idle'],['dbpm','PROJEKŤÁK DBPM','trio-dbpm-idle'],['gen_z_girl','GEN Z – HOLKA','gen-z-girl-idle'],['gen_z_boy','GEN Z – KLUČINA','gen-z-boy-idle'],
 ['jarda','DžejTý','outdoor-jarda-0'],['smoker_grey','KOLEGA U KOŠE – ŠEDOVLASÝ','outdoor-smoker-0'],['smoker_brown','KOLEGA U KOŠE – HNĚDOVLASÝ','outdoor-smoker-1'],['smoker_woman','KOLEGYNĚ U KOŠE','outdoor-smoker-2'],['jay','SOJKA','outdoor-jay'],['rabbit_one','KRÁLÍK 1','outdoor-rabbit-0'],['rabbit_two','KRÁLÍK 2','outdoor-rabbit-1'],['hero_girl','AJŤAČKA','girl-idle']
 ].map(([id,name,key])=>({id,name,key}));
 const crops={hero:[18,3,30,33],union:[22,4,29,30],manager:[21,2,29,30],old_it:[52,2,33,34],specialist:[52,2,27,33],security_guard:[24,3,32,35],hr_manager:[24,3,32,36],design_manager:[27,1,25,33],sap_integrator:[43,8,25,27],old_badger:[21,1,38,34],it_colleague:[31,5,34,32],dbpm:[64,1,36,36]};
 const normalize=id=>choices.some(a=>a.id===id)?id:'hero';
 function portrait(scene,id,size=64){
  const entry=choices.find(a=>a.id===normalize(id));if(entry.key.startsWith('outdoor-'))ITHeroOutdoor.textures(scene);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=size;canvas.className='player-avatar';canvas.setAttribute('aria-label',entry.name);canvas.setAttribute('role','img');
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#143a33';c.fillRect(0,0,size,size);
  const key=ITHeroAppearance.texture(scene,entry.key);if(!scene.textures.exists(key))return canvas;const source=scene.textures.get(key).getSourceImage();if(crops[entry.id]){c.drawImage(source,...crops[entry.id],4,4,size-8,size-8);return canvas;}const scratch=document.createElement('canvas');scratch.width=source.width;scratch.height=source.height;const sc=scratch.getContext('2d');sc.drawImage(source,0,0);const data=sc.getImageData(0,0,source.width,source.height).data;
  let top=source.height,left=source.width,right=0,bottom=0;for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(data[(y*source.width+x)*4+3]>160){top=Math.min(top,y);bottom=Math.max(bottom,y);}
  const animal=['jay','rabbit_one','rabbit_two'].includes(entry.id),headBottom=animal?bottom:top+Math.ceil((bottom-top+1)*.32);
  for(let y=top;y<=headBottom;y++)for(let x=0;x<source.width;x++)if(data[(y*source.width+x)*4+3]>160){left=Math.min(left,x);right=Math.max(right,x);}
  const side=Math.max(right-left+1,headBottom-top+1)+6,x=(left+right-side)/2,y=top-3;c.drawImage(source,x,y,side,side,4,4,size-8,size-8);return canvas;
 }
 function cell(scene,row){const wrap=document.createElement('span');wrap.className='score-player';wrap.append(portrait(scene,row.avatar,40),document.createTextNode(row.name));return wrap;}
 window.ITHeroAvatars={choices,normalize,portrait,cell};
})();
