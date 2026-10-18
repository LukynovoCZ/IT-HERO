/* Neutral, temporary blockers. Both appearances share one state machine and collider. */
(() => {
  'use strict';
  const config={spawnDelayMin:25000,spawnDelayMax:45000,blockingDurationMin:5000,blockingDurationMax:8000,
    walkSpeed:32,maxActive:1,collisionWidth:26,collisionHeight:64,minDistanceFromPlayer:135,
    doorSafeRadius:105,dialogueCooldown:3100,bubbleDuration:3100,arrivalDistance:20,leaveDuration:500};
  const variants=['girl','boy'],poses=['idle','walk','stop','phone-scroll','look-up','shrug','leave'];
  function textures(scene){
    const result={};
    for(const variant of variants){
      result[variant]={};
      for(const pose of poses){
        const key=`gen-z-${variant}-${pose}`;result[variant][pose]=key;if(scene.textures.exists(key))continue;
        const g=scene.make.graphics({add:false}),girl=variant==='girl';
        const step=pose==='walk'||pose==='leave',shrug=pose==='shrug',up=pose==='look-up';
        const r=(c,x,y,w,h)=>g.fillStyle(c).fillRect(x,y,w,h);
        const poly=(c,points)=>g.fillStyle(c).fillPoints(points.map(([x,y])=>({x,y})),true);
        const blob=(c,x,y,w,h)=>{r(c,x+1,y,w-2,h);r(c,x,y+1,w,h-2);};
        const ink=0x19202b,skin=0xe5a17c,light=0xf7c49a;
        const cloth=girl?0x365c8a:0xd6d4d1,shade=girl?0x223c60:0x999fa8;
        const pants=girl?0x555747:0x282d36,pantsLight=girl?0x72725a:0x414752;
        // Readable 16-bit silhouettes: shaped curls, bomber/hoodie, cargo pockets and chunky sneakers.
        // All seven frames keep y=4..79 and identical physical dimensions for both variants.
        blob(ink,14,30,14,29);blob(girl?0x393f38:0x303540,15,32,11,25);
        r(0x66716b,17,36,2,17);r(0x101b25,22,36,2,19);r(0xbb7d42,17,48,3,3);
        poly(ink,[[25,51],[45,51],[47,66],[46,75],[36,76],[34,62],[32,76],[23,75],[22,65]]);
        poly(pants,[[26,52],[43,52],[44,64],[43,74],[37,74],[35,59],[32,66],[30,74],[24,73],[25,63]]);
        r(pantsLight,26,56,3,14);r(pantsLight,38,56,3,15);r(0x18212b,33,56,2,14);
        blob(girl?0x383c32:0x222833,23,59,8,8);blob(pantsLight,24,59,7,6);r(ink,25,61,5,1);
        blob(girl?0x383c32:0x222833,39,60,7,7);r(pantsLight,40,61,5,3);r(ink,40,61,5,1);
        const left=step?20:23,right=step?39:36;
        blob(ink,left,73,13,7);blob(ink,right,73,14,7);
        r(0xa3a9aa,left+2,74,8,2);r(0xf2eee3,left+1,76,11,3);
        r(girl?0xa95543:0x487189,left+6,75,3,2);r(0xffffff,left+2,77,6,1);
        r(0xb3b9b7,right+2,74,8,2);r(0xf7f3e9,right+1,76,12,3);
        r(girl?0xa95543:0x487189,right+6,75,3,2);r(0xffffff,right+2,77,7,1);
        poly(ink,[[25,28],[42,28],[49,33],[49,50],[44,55],[24,55],[19,48],[20,35]]);
        poly(cloth,[[26,29],[41,29],[47,34],[46,48],[43,53],[25,53],[21,47],[22,35]]);
        r(shade,23,46,23,7);r(girl?0x527ca8:0xefebe0,27,32,15,16);
        if(girl){
          // Open blue bomber over a grey tee, copper/yellow sleeve bands, no branding.
          r(0xb9b9b0,31,32,7,18);r(0x8e9292,34,34,2,12);
          r(0x27466f,27,33,3,18);r(0x6c94b2,27,33,1,13);r(0x27466f,39,33,3,18);
          r(0x864732,21,38,6,3);r(0xd19a4d,21,41,6,2);r(0x9a5036,44,38,5,3);r(0xd9ac5b,44,41,5,2);
        }else{
          // Soft oversized hoodie with a simple abstract chest motif and drawstrings.
          r(0xe8e5df,28,33,13,14);r(0x747f8d,30,30,3,4);r(0xadb5b9,35,30,4,4);
          r(0x4d5664,29,38,2,6);r(0x4d5664,32,40,3,2);r(0x4d5664,37,38,2,6);
          r(0xa3a8ab,28,47,14,1);r(0xede8dd,28,48,13,3);
        }
        r(ink,23,31,3,18);r(0x87948e,24,33,1,13);r(ink,43,32,3,14);
        // Wavy copper hair / cropped sides with a generous dark broccoli crown.
        if(girl){
          for(const [x,y,w,h] of [[25,7,18,12],[22,13,24,15],[22,24,6,10],[42,24,6,10]])blob(0x512b2b,x,y,w,h);
          blob(0x9d4030,25,5,18,20);blob(0xb95132,28,4,10,9);
          for(const [x,y] of [[23,15],[22,22],[24,28],[41,15],[42,23],[43,28]])blob(0xc45b37,x,y,5,7);
          r(0xe78a4d,29,6,5,2);r(0xe78a4d,25,15,2,4);r(0x7d352b,23,24,2,6);
        }else{
          blob(0x342a28,25,9,21,16);r(0x85614c,27,17,3,8);r(0x6a4b3e,42,17,3,7);
        }
        blob(ink,28,13,17,18);blob(skin,29,14,15,16);r(light,30,15,10,8);
        r(0xcb866b,42,17,2,9);r(0xf3b68e,33,22,6,4);r(0xa96452,37,24,4,1);
        const eyeY=up?18:21;
        r(0x63382f,30,eyeY-2,5,1);r(0x63382f,39,eyeY-2,4,1);
        r(0xffead2,31,eyeY,3,2);r(ink,32,eyeY,2,2);r(0xffead2,39,eyeY,3,2);r(ink,40,eyeY,2,2);
        r(0x824b46,35,27,6,1);r(0xeeb99c,34,29,6,1);
        if(girl){
          poly(0x84392e,[[27,8],[41,7],[44,12],[40,15],[33,12],[29,17],[26,20],[25,14]]);
          poly(0xc5663d,[[28,8],[38,7],[35,10],[30,13],[27,17],[27,12]]);
          r(0xe19055,29,8,5,1);r(0xd47141,26,18,2,6);r(0x632d2a,43,19,2,8);
        }else{
          for(const [x,y,w,h] of [[26,7,8,7],[32,4,8,8],[38,6,8,8],[23,11,8,8],[29,11,8,7],[36,10,8,8],[41,12,7,7]]){
            blob(0x241f24,x,y,w,h);blob(0x53382d,x+1,y+1,w-2,h-2);r(0x86563a,x+2,y+1,3,1);r(0x35282a,x+1,y+h-2,w-3,1);
          }
          r(0x201f27,29,18,3,1);r(0x3f2c28,40,18,3,2);
        }
        // Large black headphones around the neck are separate from the face/hair.
        r(ink,29,30,14,3);blob(ink,27,31,7,7);blob(ink,39,31,7,7);
        r(0x68767e,29,33,3,3);r(0x5a6973,41,33,3,3);r(0x97a3a6,29,32,2,1);
        if(shrug){
          poly(ink,[[22,35],[17,33],[14,36],[19,44],[26,43]]);
          poly(cloth,[[22,36],[18,35],[16,37],[20,42],[25,41]]);blob(skin,12,32,7,5);r(light,13,32,4,2);
        }else{
          poly(ink,[[22,35],[19,40],[24,48],[33,47],[33,43],[26,43],[25,36]]);
          poly(cloth,[[22,37],[21,41],[25,46],[30,45],[26,43],[24,37]]);blob(skin,29,43,7,5);
        }
        poly(ink,[[46,35],[50,39],[49,47],[42,49],[40,44],[45,42]]);
        poly(cloth,[[46,37],[48,40],[47,45],[43,46],[42,44],[46,42]]);blob(skin,40,43,7,5);
        if(girl){
          if(shrug){r(0xac603a,17,37,4,2);r(0xdcb66c,18,39,3,1);}
          else{poly(0xac603a,[[21,40],[23,39],[26,43],[24,44]]);r(0xdcb66c,22,41,2,1);}
          r(0xac603a,46,39,2,3);r(0xdcb66c,46,42,2,1);
        }
        // Angled dark smartphone; a moving thumb makes scrolling readable at 1×.
        blob(ink,34,38,10,14);r(0x455866,36,39,6,11);r(0x80bec7,36,40,5,8);
        r(0xd1f0df,37,42,3,1);r(0xbbddd4,37,pose==='phone-scroll'?45:46,3,1);
        blob(light,pose==='phone-scroll'?37:39,46,4,3);r(0x8faaa8,38,50,2,1);
        g.generateTexture(key,64,80);g.destroy();
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
  window.ITHeroGenZ={config,variants,poses,textures,create};
})();
