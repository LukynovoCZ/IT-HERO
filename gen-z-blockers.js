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
        const g=scene.make.graphics({add:false}),girl=variant==='girl',walk=pose==='walk'||pose==='leave',shrug=pose==='shrug';
        const r=(c,x,y,w,h)=>g.fillStyle(c).fillRect(x,y,w,h);
        const ink=0x17212c,skin=0xe6a17b,hair=girl?0xa83e2c:0x382b27,cloth=girl?0x456da5:0xd4d6d5;
        // Fixed 64×80 canvas; the soles always end at y=79. Original pixel silhouettes.
        r(ink,16,34,12,25);r(girl?0x6d3941:0x414f55,17,35,9,22);r(0x98a2a1,18,38,2,15);
        r(ink,25,52,22,24);r(0x252d36,26,53,9,22);r(0x303742,36,53,10,22);
        r(0x454c54,27,59,6,7);r(0x454c54,38,59,6,7);r(ink,32,56,3,19);
        r(ink,23-(walk?3:0),74,13,6);r(ink,36+(walk?3:0),74,13,6);
        r(girl?0xe8bd6c:0xf5f1e5,24-(walk?3:0),75,11,4);r(0xf5f1e5,37+(walk?3:0),75,11,4);
        r(ink,22,29,26,26);r(cloth,23,30,24,24);r(girl?0x7294c2:0xf0efdf,26,31,17,15);
        r(girl?0x2f4d78:0xa8aeaf,23,46,24,8);r(ink,24,30,3,21);r(0x8da2ac,28,32,1,12);r(0x8da2ac,40,32,1,12);
        r(hair,26,5,17,girl?31:20);r(hair,24,9,21,girl?25:16);r(girl?0xd85a32:0x574139,27,5,13,5);if(girl)r(hair,30,4,8,2);
        if(!girl){for(const [x,y] of [[24,7],[29,4],[35,4],[41,6],[22,11]])r(0x49352b,x,y,7,7);r(0x8b6043,27,6,3,2);}
        r(ink,28,13,17,18);r(skin,29,13,15,17);r(0xf6c29a,30,14,10,9);
        r(ink,31,pose==='look-up'?18:21,3,2);r(ink,40,pose==='look-up'?18:21,3,2);r(0x8e4c40,36,27,6,1);
        r(hair,26,9,18,6);if(girl){r(0xd65c37,25,10,4,25);r(0xcf5637,43,12,3,21);}else{r(hair,26,10,4,10);r(0x342a2a,42,12,3,7);}
        // Headphones and backpack strap remain visible against either hoodie.
        if(!girl){r(ink,26,12,3,11);r(0x7c8993,26,16,3,6);r(ink,43,13,3,11);}
        r(ink,29,30,15,4);r(0x869ca7,29,33,5,5);r(0x869ca7,40,33,5,5);
        r(ink,shrug?17:23,35,7,14);r(cloth,shrug?18:24,35,5,12);r(skin,shrug?15:29,shrug?33:45,7,4);
        r(ink,44,35,7,14);r(cloth,45,35,5,12);r(skin,42,45,7,4);
        // Phone is always in hand. Scrolling changes the thumb/screen, not the anchor.
        r(ink,35,39,10,14);r(0x75b8c6,37,41,6,10);r(0xd7f5df,38,43,4,1);r(0xc9eae0,38,47,pose==='phone-scroll'?2:4,1);
        r(skin,pose==='phone-scroll'?38:40,46,3,3);
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
      e.bubble?.destroy();e.bubble=scene.add.text(Phaser.Math.Clamp(e.x,150,810),e.y-45,text,{font:'bold 11px monospace',color:'#f3f0d9',backgroundColor:'#203b36',wordWrap:{width:280},align:'center',padding:{x:6,y:5}}).setOrigin(.5,1).setDepth(108);
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
