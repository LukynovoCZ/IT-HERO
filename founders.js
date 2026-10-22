/* Friendly paired cameo. Visual only: no bodies, damage or pickups. */
(()=>{'use strict';
 const poses=['idle','walk','walk_alt','greet','talk','approve'],config={firstMin:12000,firstMax:22000,intervalMin:22000,intervalMax:40000,duration:6000,fade:450};
 function preload(scene){scene.load.image('founders-source','assets/characters/laurin-klement.png');}
 function textures(scene){if(scene.textures.exists('founders-talk'))return;const source=scene.textures.get('founders-source').getSourceImage(),scratch=document.createElement('canvas');scratch.width=source.width;scratch.height=source.height;const ctx=scratch.getContext('2d');ctx.drawImage(source,0,0);const data=ctx.getImageData(0,0,source.width,source.height).data,cw=source.width/3,ch=source.height/2;
  const boxes=poses.map((pose,i)=>{const ox=i%3*cw,oy=Math.floor(i/3)*ch;let l=cw,t=ch,r=0,b=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(data[((oy+y)*source.width+ox+x)*4+3]>160){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return {pose,ox,oy,l,t,w:r-l+1,h:b-t+1};});const scale=76/Math.max(...boxes.map(b=>b.h));
  for(const b of boxes){const tex=scene.textures.createCanvas('founders-'+b.pose,128,84),c=tex.context;c.imageSmoothingEnabled=false;c.drawImage(source,b.ox+b.l,b.oy+b.t,b.w,b.h,Math.round((128-b.w*scale)/2),Math.round(84-b.h*scale),Math.round(b.w*scale),Math.round(b.h*scale));const pixels=c.getImageData(0,0,128,84);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>160?255:0;c.putImageData(pixels,0,0);tex.refresh();}
 }
 function create(scene,floors){textures(scene);const state={clock:0,nextAt:Phaser.Math.Between(config.firstMin,config.firstMax),entity:null};
  const schedule=()=>state.nextAt=state.clock+Phaser.Math.Between(config.intervalMin,config.intervalMax);
  function clear(){if(state.entity)scene.dialogue?.remove(state.entity);state.entity?.destroy();state.entity=null;}
  function safe(x){const ground=floors[scene.floor];if(Math.abs(scene.player.x-x)<110)return false;return ![...scene.obstacles.getChildren(),...scene.platforms.getChildren(),...scene.enemies.getChildren()].some(e=>e.active&&e.visible!==false&&e.body&&e.body.top<ground-2&&e.body.bottom>ground-76&&e.body.left<x+60&&e.body.right>x-60);}
  function spawn(options={}){if(state.entity||scene.gameState!=='playing'||scene.transitioning)return false;const x=options.x??Phaser.Utils.Array.Shuffle([165,235,315,405,555,635,745,815]).find(safe);if(x===undefined||!safe(x)){state.nextAt=state.clock+2500;return false;}const e=scene.add.image(x,floors[scene.floor],'founders-talk').setOrigin(.5,1).setDepth(21).setAlpha(0);e.floorIndex=scene.floor;e.started=state.clock;state.entity=e;scene.dialogue?.say(e,'laurin_klement','debate',{priority:true,duration:5500});schedule();return true;}
  function update(delta){if(scene.transitioning||!['playing','paused'].includes(scene.gameState)){clear();return;}if(state.entity&&state.entity.floorIndex!==scene.floor)clear();if(scene.gameState==='paused'){state.entity?.setVisible(false);return;}state.clock+=Math.min(delta,100);if(state.entity){const e=state.entity,age=state.clock-e.started;if(age>=config.duration){clear();return;}e.setVisible(true).setAlpha(Math.max(0,Math.min(1,age/config.fade,(config.duration-age)/config.fade))).setTexture(age<650?'founders-greet':Math.floor(age/1100)%2?'founders-talk':'founders-greet');}else if(state.clock>=state.nextAt)spawn();}
  scene.events.once('shutdown',clear);return {state,spawn,update,clear};
 }
 window.ITHeroFounders={config,preload,textures,create};
})();
