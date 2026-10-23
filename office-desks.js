/* Side-view furniture. Texture y=0 is the exact solid landing surface. */
(()=>{'use strict';
 const palettes={
  wood:{top:'#ffdda0',edge:'#d99a54',grain:'#e2b676',drawer:'#ddd2b5'},
  modern:{top:'#edf2ed',edge:'#abbcc6',grain:'#d2dfdf',drawer:'#d0d9de'}
 };
 const structure={metal:'#e4d6b6',highlight:'#fff7df',legWidth:5};
 const background={color:0x142c29,alpha:.36,depth:-8.5};
 const items=['monitor','laptop','closed-laptop','keyboard','mouse','mug','papers','files','binders','pens','phone','mobile','lamp','plant','cactus','apple','banana','water','lunch','car','dinosaur','robot','hero-figure','controller','spaceship'];
 const themes=[
  {wood:.15,favorites:['monitor','phone','plant','pens']},
  {wood:.65,favorites:['monitor','keyboard','mug','papers']},
  {wood:.7,favorites:['monitor','papers','files','binders']},
  {wood:.6,favorites:['laptop','papers','car','robot']},
  {wood:.95,favorites:['mug','papers','files','banana']},
  {wood:.2,favorites:['plant','phone','papers','laptop']},
  {wood:.6,favorites:['binders','files','papers','lamp']},
  {wood:.9,favorites:['laptop','car','plant','mug']},
  {wood:1,favorites:['monitor','plant','car','pens']}
 ];
 const dimensions={width:88,height:38},depth={desk:10,decorations:12};
 function seeded(seed){let a=2166136261;for(const c of String(seed))a=Math.imul(a^c.charCodeAt(0),16777619);return ()=>{a+=0x6D2B79F5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
 function canvas(scene,key,w,h,draw){if(scene.textures.exists(key))return;const t=scene.textures.createCanvas(key,w,h),c=t.context;c.imageSmoothingEnabled=false;draw(c,(color,x,y,width,height)=>{c.fillStyle=color;c.fillRect(x,y,width,height);});t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}
 const textureSources={
  "office-desk-modern": "assets/office-desks/office-desk-modern.png",
  "office-desk-wood": "assets/office-desks/office-desk-wood.png",
  "office-item-apple": "assets/office-desks/office-item-apple.png",
  "office-item-banana": "assets/office-desks/office-item-banana.png",
  "office-item-binders": "assets/office-desks/office-item-binders.png",
  "office-item-cactus": "assets/office-desks/office-item-cactus.png",
  "office-item-car": "assets/office-desks/office-item-car.png",
  "office-item-closed-laptop": "assets/office-desks/office-item-closed-laptop.png",
  "office-item-controller": "assets/office-desks/office-item-controller.png",
  "office-item-dinosaur": "assets/office-desks/office-item-dinosaur.png",
  "office-item-files": "assets/office-desks/office-item-files.png",
  "office-item-hero-figure": "assets/office-desks/office-item-hero-figure.png",
  "office-item-keyboard": "assets/office-desks/office-item-keyboard.png",
  "office-item-lamp": "assets/office-desks/office-item-lamp.png",
  "office-item-laptop": "assets/office-desks/office-item-laptop.png",
  "office-item-lunch": "assets/office-desks/office-item-lunch.png",
  "office-item-mobile": "assets/office-desks/office-item-mobile.png",
  "office-item-monitor": "assets/office-desks/office-item-monitor.png",
  "office-item-mouse": "assets/office-desks/office-item-mouse.png",
  "office-item-mug": "assets/office-desks/office-item-mug.png",
  "office-item-papers": "assets/office-desks/office-item-papers.png",
  "office-item-pens": "assets/office-desks/office-item-pens.png",
  "office-item-phone": "assets/office-desks/office-item-phone.png",
  "office-item-plant": "assets/office-desks/office-item-plant.png",
  "office-item-robot": "assets/office-desks/office-item-robot.png",
  "office-item-spaceship": "assets/office-desks/office-item-spaceship.png",
  "office-item-water": "assets/office-desks/office-item-water.png"
};
 function preload(scene){for(const [key,url] of Object.entries(textureSources))scene.load.image(key,url+'?v=0.26.7');}
 function createDeskTextures(scene){
  for(const [type,p] of Object.entries(palettes))canvas(scene,'office-desk-'+type,88,38,(c,r)=>{
   const ink='#111f25',metal=structure.metal;
   r(ink,0,0,88,9);r(p.top,2,1,84,3);r(p.edge,2,4,84,3);r(p.grain,8,2,22,1);r(p.grain,51,2,24,1);
   r('#17272c',5,9,78,3); // underside shadow, inside the solid silhouette
   r(ink,4,9,7,29);r(metal,6,10,structure.legWidth,26);r(structure.highlight,6,10,2,26);
   r(ink,77,9,7,29);r(metal,78,10,structure.legWidth,26);r(structure.highlight,78,10,2,26);
   r(ink,53,11,23,27);r(p.drawer,55,12,19,24);r('#eef2e5',55,12,2,23);
   for(let y=19;y<36;y+=8){r('#61717b',57,y,16,1);r('#364650',63,y-4,6,2);}
   r('#14252a',11,35,42,3);r('#33474c',11,35,40,1);
  });
  for(const id of items)canvas(scene,'office-item-'+id,28,30,(c,r)=>{
   const ink='#13232c',white='#edf0dc',blue='#527caa',dark='#344452',green='#6fab58',red='#c1534a';
   const box=(x,y,w,h,color)=>{r(ink,x,y,w,h);r(color,x+1,y+1,w-2,h-2);};
   switch(id){
    case 'monitor':box(1,2,26,21,dark);r('#7992ac',3,4,21,1);r('#26374d',3,6,21,14);r('#425570',4,6,3,12);r(ink,12,23,4,4);r('#85939b',7,27,14,2);break;
    case 'laptop':box(4,9,21,16,blue);r('#29374e',6,11,17,11);r(ink,1,25,27,4);r('#c3cdd0',3,25,23,2);break;
    case 'closed-laptop':box(1,25,26,5,'#9caebc');r(white,12,26,4,1);break;
    case 'keyboard':box(0,25,28,5,'#9eaeb3');for(let x=3;x<26;x+=4)r(white,x,26,2,1);break;
    case 'mouse':box(10,23,8,7,'#94a7b5');r(white,13,24,1,2);break;
    case 'mug':box(5,17,12,13,white);box(17,19,6,7,white);r(ink,6,17,10,2);r('#70432b',7,18,8,2);r('#ffffff',7,21,2,7);break;
    case 'papers':for(let y=22;y<=27;y+=3){box(2,y,23,3,white);r('#8ca0ab',5,y+1,12,1);}break;
    case 'files':for(let y=13;y<=25;y+=6){box(2,y,24,5,white);r('#c6ae7c',4,y+2,8,1);}break;
    case 'binders':for(let i=0;i<3;i++){box(3+i*7,10-i%2*2,7,20+i%2*2,[blue,red,'#c6af79'][i]);r(white,5+i*7,15,3,5);r(ink,6+i*7,26,2,2);}break;
    case 'pens':box(8,20,13,10,blue);r('#d3ac53',10,10,2,14);r(white,15,12,2,12);r(red,19,9,2,15);break;
    case 'phone':box(2,22,24,8,'#81929a');box(2,19,24,5,dark);r(white,14,25,8,2);break;
    case 'mobile':box(7,25,15,5,dark);r(blue,9,26,10,2);break;
    case 'lamp':r(ink,8,27,16,3);r('#9aa9a6',15,12,3,15);r(ink,5,10,15,4);r('#dec87b',6,7,13,5);break;
    case 'plant':box(9,22,11,8,'#cfb186');r('#346c46',13,9,3,15);r(green,5,12,7,5);r('#89bf60',15,6,4,13);r('#438749',18,12,7,5);r('#8bbf63',8,8,4,8);break;
    case 'cactus':box(9,23,12,7,'#c18b64');r(ink,12,9,7,15);r(green,13,10,5,14);r(green,6,14,8,5);r(green,6,11,3,7);r(green,18,16,7,4);r(green,22,12,3,7);r('#b5d483',14,12,1,9);break;
    case 'apple':r(ink,12,18,3,4);box(7,21,14,9,red);r('#f29a69',9,22,3,2);break;
    case 'banana':r(ink,4,24,22,6);r('#e7c95b',5,25,18,4);r('#f3df84',7,23,15,4);r(ink,22,21,3,4);break;
    case 'water':box(10,13,9,17,'#7baebe');r(blue,11,10,7,4);r(white,12,20,5,5);r('#c9e6dc',11,15,2,5);break;
    case 'lunch':box(4,21,21,9,'#86ad83');r(white,5,21,19,2);r('#446b60',13,23,3,4);break;
    case 'car':r(ink,2,24,25,5);r(blue,3,23,23,4);r(blue,9,19,12,5);r('#a5c6d3',11,20,7,3);r(ink,5,27,5,3);r(ink,20,27,5,3);r(white,24,24,2,1);break;
    case 'dinosaur':r(ink,11,13,8,15);r(green,12,14,6,13);r(green,16,11,9,6);r('#b3cf78',18,13,1,1);r(green,6,23,8,5);r(green,3,21,4,4);r(ink,10,27,6,3);r(ink,19,27,5,3);r(green,17,21,6,3);break;
    case 'robot':box(10,10,10,7,'#b5b8c8');box(8,17,14,9,blue);r(white,12,12,2,1);r(white,17,12,2,1);r(red,12,19,5,3);r(ink,5,18,3,8);r(ink,22,18,3,8);r(ink,9,26,4,4);r(ink,18,26,4,4);break;
    case 'hero-figure':r(ink,9,10,11,9);r('#ad6b66',11,15,7,3);r(white,11,12,2,1);r(white,17,12,2,1);r('#635887',8,19,13,8);r(ink,5,19,4,10);r(ink,20,19,4,10);r(ink,9,27,4,3);r(ink,17,27,4,3);break;
    case 'controller':box(3,22,23,8,dark);r(ink,3,27,6,3);r(ink,20,27,6,3);r(white,7,24,5,2);r(white,9,23,1,4);r(red,21,24,2,2);r(green,18,26,2,2);break;
    case 'spaceship':r(ink,4,24,21,5);r('#a5b4c2',6,23,17,4);r('#c9d8d9',12,17,5,9);r(blue,13,18,3,6);r(red,4,27,5,2);r(red,20,27,5,2);break;
   }
  });
 }
 function generateDeskDecorations(scene,desk,config={}){
  const random=config.random||Math.random,theme=themes[config.floor||0]||themes[0];
  const count=2+Math.floor(random()*4),pool=[...items],chosen=[];
  if(config.monitor){chosen.push('monitor');pool.splice(pool.indexOf('monitor'),1);pool.splice(pool.indexOf('laptop'),1);}
  while(chosen.length<count){const favorites=pool.filter(id=>theme.favorites.includes(id)),source=favorites.length&&random()<.72?favorites:pool;const id=source[Math.floor(random()*source.length)];chosen.push(id);pool.splice(pool.indexOf(id),1);if(['monitor','laptop'].includes(id)){const other=pool.indexOf(id==='monitor'?'laptop':'monitor');if(other>=0)pool.splice(other,1);}}
  const list=config.decorations??chosen;
  if(list.length<2||list.length>5||list.some(id=>!items.includes(id)))throw Error('Desk decorations must contain 2–5 known item IDs');
  const wideIndex=list.findIndex(id=>['monitor','laptop'].includes(id));
  let cursor=desk.x-desk.displayWidth/2;
  return list.map((id,i)=>{const slot=wideIndex>=0&&list.length>2?(i===wideIndex?32:(desk.displayWidth-32)/(list.length-1)):desk.displayWidth/list.length;const texture='office-item-'+id,w=Math.min(28,slot-2),image=scene.add.image(cursor+slot/2,desk.body.top-1,texture).setOrigin(.5,1).setDisplaySize(w,30*w/28).setDepth(depth.decorations);image.setData('deskItem',id);cursor+=slot;return image;});
 }
 function shadeBackdrop(scene,ground,width){return scene.add.rectangle(width/2,ground-207,width,414,background.color,background.alpha).setDepth(background.depth).setData('officeBackdrop',true);}
 function createDesk(scene,config){
  createDeskTextures(scene);
  const random=config.random||Math.random,type=config.type||(random()<(themes[config.floor||0]||themes[0]).wood?'wood':'modern');
  if(!palettes[type])throw Error('Unknown desk type: '+type);
  const w=config.width??dimensions.width,h=config.height??dimensions.height;
  const desk=scene.add.image(config.x,config.ground-h/2,'office-desk-'+type).setDisplaySize(w,h).setDepth(depth.desk);
  scene.physics.add.existing(desk,true);scene.obstacles.add(desk);desk.body.setSize(w,h).updateFromGameObject();
  desk.setData('officeDesk',{type,floor:config.floor});desk.decorations=generateDeskDecorations(scene,desk,{...config,random});
  desk.once('destroy',()=>desk.decorations.forEach(image=>image.destroy()));return desk;
 }
 function placeDesks(scene,floorPlans,floors,options={}){
  const random=options.random||seeded(options.seed??Math.random());
  return floorPlans.flatMap((plan,floor)=>{const monitorIndex=Math.floor(random()*plan.desks.length);return plan.desks.map((x,index)=>createDesk(scene,{x,ground:floors[floor],floor,monitor:index===monitorIndex,random}));});
 }
 window.ITHeroOfficeDesks={palettes,structure,background,shadeBackdrop,items,themes,dimensions,depth,seeded,preload,createDeskTextures,createDesk,generateDeskDecorations,placeDesks};
})();
