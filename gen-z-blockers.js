/* Neutral, temporary blockers. Both appearances share one state machine and collider. */
(() => {
  'use strict';
  const config={spawnDelayMin:25000,spawnDelayMax:45000,blockingDurationMin:5000,blockingDurationMax:8000,
    walkSpeed:32,maxActive:1,collisionWidth:26,collisionHeight:64,minDistanceFromPlayer:135,
    doorSafeRadius:105,dialogueCooldown:3100,bubbleDuration:3100,arrivalDistance:20,leaveDuration:500};
  const variants=['girl','boy'],poses=['idle','walk','stop','phone-scroll','look-up','shrug','leave'];
  const art={path:'assets/characters/gen_z_duo.png',columns:3,rows:2,height:76,alphaThreshold:192,
    columnsByPose:{idle:0,walk:1,stop:0,'phone-scroll':0,'look-up':0,shrug:2,leave:1}};
  function preload(scene){scene.load.image('gen-z-source',art.path);}
  function textures(scene){
    const result=Object.fromEntries(variants.map(v=>[v,Object.fromEntries(poses.map(p=>[p,`gen-z-${v}-${p}`]))]));
    if(!scene.textures.exists(result.girl.idle)){
      const image=scene.textures.get('gen-z-source').getSourceImage();
      const clean=document.createElement('canvas');clean.width=image.width;clean.height=image.height;
      const ctx=clean.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
      const pixels=ctx.getImageData(0,0,clean.width,clean.height);
      // Remove semitransparent fringe from the generated source; final sprites have hard alpha.
      for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=art.alphaThreshold?255:0;
      ctx.putImageData(pixels,0,0);
      const tileW=Math.floor(clean.width/art.columns),tileH=Math.floor(clean.height/art.rows);
      for(const [row,variant] of variants.entries()){
        const bounds=[];
        for(let col=0;col<art.columns;col++){
          let left=tileW,top=tileH,right=-1,bottom=-1;
          for(let y=0;y<tileH;y++)for(let x=0;x<tileW;x++){
            if(pixels.data[((row*tileH+y)*clean.width+col*tileW+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
          }
          if(right<left)throw new Error(`Empty Gen Z source cell ${variant}/${col}`);
          let footLeft=tileW,footRight=-1;
          for(let y=bottom-Math.ceil((bottom-top+1)*.09);y<=bottom;y++)for(let x=left;x<=right;x++){
            if(pixels.data[((row*tileH+y)*clean.width+col*tileW+x)*4+3]){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x);}
          }
          bounds.push({x:col*tileW+left,y:row*tileH+top,w:right-left+1,h:bottom-top+1,foot:(footLeft+footRight)/2-left});
        }
        for(const pose of poses){
          const key=result[variant][pose],b=bounds[art.columnsByPose[pose]],w=Math.round(b.w*art.height/b.h);
          const canvas=scene.textures.createCanvas(key,64,80),c=canvas.context;c.imageSmoothingEnabled=false;
          c.drawImage(clean,b.x,b.y,b.w,b.h,Math.round(32-b.foot*art.height/b.h),4,w,art.height);
          // These two small gestures are derived from the painted idle, preserving its face/style.
          if(pose==='phone-scroll'){
            const [x,y]=variant==='girl'?[44,28]:[42,26];
            const hand=document.createElement('canvas');hand.width=7;hand.height=7;hand.getContext('2d').drawImage(canvas.canvas,x,y,7,7,0,0,7,7);c.drawImage(hand,x,y-1);
          }
          if(pose==='look-up'){
            const head=document.createElement('canvas');head.width=24;head.height=23;
            head.getContext('2d').drawImage(canvas.canvas,23,4,24,23,0,0,24,23);
            c.clearRect(23,4,24,23);c.save();c.translate(35,26);c.rotate(-.055);c.drawImage(head,-12,-22);c.restore();
          }
          // Resample any edge lost to nearest-neighbour selection back to the common soles/top.
          const data=c.getImageData(0,0,64,80);
          for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]>=128?255:0;
          c.putImageData(data,0,0);let top=80,bottom=-1;
          for(let y=0;y<80;y++)for(let x=0;x<64;x++)if(data.data[(y*64+x)*4+3]){top=Math.min(top,y);bottom=Math.max(bottom,y);}
          if(top!==4||bottom!==79){const copy=document.createElement('canvas');copy.width=64;copy.height=80;copy.getContext('2d').drawImage(canvas.canvas,0,0);c.clearRect(0,0,64,80);c.drawImage(copy,0,top,64,bottom-top+1,0,4,64,76);}
          canvas.refresh();
        }
      }
    }
    if(!scene.textures.exists('gen-z-phone')){const g=scene.make.graphics({add:false});g.fillStyle(0x17212c).fillRect(0,0,14,22);g.fillStyle(0x75b8c6).fillRect(2,3,10,16);g.fillStyle(0xe9f7df).fillRect(4,6,6,2).fillRect(4,11,4,2);g.generateTexture('gen-z-phone',14,22);g.destroy();}
    return result;
  }
  function create(scene,floors){
    const frames=textures(scene),group=scene.physics.add.group({allowGravity:false,immovable:true});
    const random=(min,max)=>Phaser.Math.Between(min,max),state={clock:0,nextAt:random(config.spawnDelayMin,config.spawnDelayMax),entity:null,lastVariant:null};
    const schedule=()=>state.nextAt=state.clock+random(config.spawnDelayMin,config.spawnDelayMax);
    function clear(reschedule=true){const e=state.entity;if(e){e.bubble?.destroy();e.destroy();state.entity=null;}if(reschedule)schedule();}
    function bossFloor(floor){return floor===4||floor===8||scene.enemies.getChildren().some(e=>e.active&&!e.defeated&&e.floorIndex===floor&&['sap','dbpm'].includes(e.profile?.behavior));}
    function safe(x,floor=scene.floor){
      const ground=floors[floor],sweep=config.collisionWidth/2+config.arrivalDistance+6;
      if(floor!==scene.floor||bossFloor(floor)||x<160||x>800||Math.abs(x-500)<95)return false;
      const startX=x+(x<500?-1:1)*config.arrivalDistance;
      if(Math.min(Math.abs(scene.player.x-x),Math.abs(scene.player.x-startX))<config.minDistanceFromPlayer||[81,879].some(d=>Math.abs(d-x)<config.doorSafeRadius))return false;
      if(scene.pacing?.reserved(x,floor,sweep)||scene.dbpm?.isReserved(x,floor))return false;
      if(scene.obstacles.getChildren().some(o=>o.active&&o.body&&o.body.left<x+sweep&&o.body.right>x-sweep&&o.body.top<ground&&o.body.bottom>ground-100))return false;
      if(scene.enemies.getChildren().some(e=>e.active&&!e.defeated&&e.floorIndex===floor&&Math.abs(e.x-x)<90))return false;
      const helpers=[scene.oldBadger?.state.entity,scene.colleague?.state.visit?.sprite,scene.helperVisit?.sprite];
      if(helpers.some(e=>e?.active&&Math.abs(e.x-x)<90&&Math.abs(e.y-ground)<150))return false;
      if([...scene.coffees.getChildren(),...scene.aidItems.getChildren(),...scene.colleague.items.getChildren(),...scene.upgrades.getChildren()].some(i=>i.active&&Math.abs(i.x-x)<45&&Math.abs(i.y-ground)<100))return false;
      return true;
    }
    function say(e,category){
      if(state.clock<e.nextDialogue)return;
      const pool=ITHeroDialogue.lines('gen_z',category),text=Phaser.Utils.Array.GetRandom(pool);if(!text)return;
      e.bubble?.destroy();
      const textObject=scene.add.text(0,0,text,{font:'bold 11px monospace',color:'#192531',wordWrap:{width:258},align:'center',padding:{x:10,y:7}}).setOrigin(.5,1);
      const w=Math.ceil(textObject.width),h=Math.ceil(textObject.height),bg=scene.add.graphics();
      bg.fillStyle(0x17212c).fillRect(-w/2-2,-h-2,w+4,h+4).fillTriangle(-7,0,7,0,3,11);
      bg.fillStyle(0xfff6e8).fillRect(-w/2,-h,w,h).fillTriangle(-4,0,4,0,2,7);
      e.bubble=scene.add.container(Phaser.Math.Clamp(e.x,150,810),e.y-45,[bg,textObject]).setDepth(108);
      e.bubbleUntil=state.clock+config.bubbleDuration;e.nextDialogue=state.clock+config.dialogueCooldown;
    }
    function spawn(options={}){
      if(state.entity||config.maxActive<1||scene.gameState!=='playing'||scene.transitioning)return false;
      const x=options.x??Phaser.Utils.Array.Shuffle(Array.from({length:65},(_,i)=>160+i*10)).find(x=>safe(x));
      if(x===undefined||!safe(x))return false;
      // First draw is random; subsequent draws alternate, keeping the pair balanced.
      const variant=options.variant??(state.lastVariant?(state.lastVariant==='girl'?'boy':'girl'):Phaser.Utils.Array.GetRandom(variants));
      if(!variants.includes(variant))return false;
      const direction=x<500?1:-1,startX=x-direction*config.arrivalDistance;
      if(Math.abs(scene.player.x-startX)<config.minDistanceFromPlayer)return false;
      const e=group.create(startX,floors[scene.floor]-40,frames[variant].walk).setDepth(22);
      e.body.setSize(config.collisionWidth,config.collisionHeight).setOffset((64-config.collisionWidth)/2,80-config.collisionHeight);e.body.pushable=false;
      Object.assign(e,{variant,floorIndex:scene.floor,phase:'arrive',targetX:x,direction,started:state.clock,blockUntil:0,nextDialogue:0,bubbleUntil:0});
      e.setFlipX(direction<0);e.setVelocityX(direction*config.walkSpeed);state.entity=e;state.lastVariant=variant;schedule();return true;
    }
    const collider=scene.physics.add.collider(scene.player,group,undefined,()=>scene.gameState==='playing'&&!scene.transitioning);
    function update(delta){
      if(['lose','win','restarting'].includes(scene.gameState)||scene.transitioning||state.entity?.floorIndex!==undefined&&state.entity.floorIndex!==scene.floor){if(state.entity)clear();return;}
      if(scene.gameState!=='playing')return;
      state.clock+=delta;const e=state.entity;
      if(!e){if(state.clock>=state.nextAt&&!spawn()){state.nextAt=state.clock+2000;}return;}
      if(bossFloor(scene.floor)){clear();return;}
      if(e.bubble){e.bubble.setPosition(Phaser.Math.Clamp(e.x,150,810),e.body.top-12);if(state.clock>=e.bubbleUntil){e.bubble.destroy();e.bubble=null;}}
      if(e.phase==='arrive'){
        // Abort if the player, another actor or furniture enters the arrival corridor.
        const others=[...scene.enemies.getChildren(),scene.oldBadger?.state.entity];
        if(Math.abs(scene.player.x-e.x)<50||others.some(o=>o?.active&&o.floorIndex===scene.floor&&Math.abs(o.x-e.x)<50)){clear();return;}
        if((e.x-e.targetX)*e.direction>=0){e.setX(e.targetX).setVelocityX(0);e.phase='block';e.started=state.clock;e.blockUntil=state.clock+random(config.blockingDurationMin,config.blockingDurationMax);say(e,'block');}
        else e.setTexture(frames[e.variant][Math.floor(state.clock/180)%2?'walk':'idle']);
      }else if(e.phase==='block'){
        // Yield if a hostile or another solid NPC approaches; never trap the hero in combat.
        const nearby=[...scene.enemies.getChildren(),scene.oldBadger?.state.entity];
        if(nearby.some(o=>o?.active&&!o.defeated&&o.floorIndex===scene.floor&&Math.abs(o.x-e.x)<70)){clear();return;}
        const age=state.clock-e.started;
        const pose=Math.floor(age/900)%5===4?'look-up':Math.floor(age/240)%2?'phone-scroll':'stop';e.setTexture(frames[e.variant][pose]);
        if(age>config.dialogueCooldown)say(e,Math.floor(age/1000)%2?'work':'slang');
        if(state.clock>=e.blockUntil){e.phase='leave';e.started=state.clock;e.body.enable=false;e.setVelocityX(0);e.setTexture(frames[e.variant].shrug);say(e,'slang');}
      }else{
        const t=(state.clock-e.started)/config.leaveDuration;e.setAlpha(Math.max(0,1-t)).setTexture(frames[e.variant][t>.5?'leave':'shrug']);if(t>=1)clear(false);
      }
    }
    scene.events.once('shutdown',()=>{clear();collider.destroy();group.destroy(true);});
    return {state,group,frames,spawn,safe,clear,update,config,isReserved(x,floor,radius=60){const e=state.entity;return !!e&&e.floorIndex===floor&&Math.abs(e.x-x)<radius;}};
  }
  window.ITHeroGenZ={config,art,variants,poses,preload,textures,create};
})();
