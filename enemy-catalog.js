/* Office enemy catalogue. Profiles share the existing default attack system.
 * Floor numbers in placements are 1–9. Existing enemies are not configured here.
 */
(() => {
  'use strict';
  const profiles = {
    security_guard: {
      id:'security_guard',name:'BEZPEČÁK',enabled:true,idleDuration:650,movementCycle:3400,
      health:4,speed:45,patrol:24,attackInterval:1900,attackRange:380,
      attackType:'office-weapons',projectile:'default',damage:1,score:100,
      contactPose:'stop',attackPose:'radio',contactEffect:'firewall',
      projectiles:[{key:'handcuffs',weight:4,spin:240},{key:'fireball',weight:1,speed:285}],
      frameWidth:80,frameHeight:96,renderHeight:92,
      body:{width:32,height:88,x:24,y:8},
      art:{
        path:'assets/characters/security_guard.png',
        poses:{idle:[239,35,355,729],stop:[841,33,385,726],radio:[1411,48,368,716],walk:[1411,48,368,716]},
        facing:{idle:'left',stop:'front',radio:'right',walk:'right'},
        anchors:{idle:{x:160,y:729},stop:{x:192,y:726},radio:{x:210,y:716},walk:{x:210,y:716}}
      }
    },
    hr_manager: {
      id:'hr_manager',name:'HR MANAŽERKA',enabled:true,idleDuration:600,movementCycle:3500,
      health:4,speed:43,patrol:24,attackInterval:1850,attackRange:380,
      attackType:'office-weapons',projectile:'default',damage:1,score:100,
      contactPose:'stop',attackPose:'documents',contactEffect:'whip',
      projectiles:[{key:'red-heel',weight:1,spin:280},{key:'red-tennis-ball',weight:1,speed:195}],
      frameWidth:80,frameHeight:96,renderHeight:92,
      body:{width:26,height:88,x:27,y:8},
      art:{
        path:'assets/characters/managers_readable.png',
        poses:{idle:[225,6,227,504],stop:[669,10,223,500],walk:[1117,6,230,504],documents:[1117,6,230,504]},
        facing:{idle:'left',stop:'front',walk:'right',documents:'right'},
        anchors:{idle:{x:115,y:504},stop:{x:114,y:500},walk:{x:123,y:504},documents:{x:123,y:504}}
      }
    },
    design_manager: {
      id:'design_manager',name:'MANAŽER DESIGNU',enabled:true,idleDuration:800,movementCycle:3800,
      health:4,speed:39,patrol:18,attackInterval:1950,attackRange:380,
      attackType:'office-weapons',projectile:'default',damage:1,score:100,
      contactPose:'scream',attackPose:'golf',contactEffect:'scream',
      projectiles:[{key:'golf-ball',weight:1,speed:310,spin:240}],
      frameWidth:80,frameHeight:112,renderHeight:108,
      body:{width:24,height:104,x:28,y:8},
      art:{
        path:'assets/characters/managers_readable.png',
        poses:{idle:[223,513,223,505],explain:[644,512,257,506],tablet:[644,512,257,506],walk:[1092,513,312,505]},
        facing:{idle:'left',explain:'left',tablet:'left',walk:'right'},
        anchors:{idle:{x:112,y:505},explain:{x:130,y:506},tablet:{x:130,y:506},walk:{x:164,y:505}}
      }
    }
  };
  const placements = [
    {id:'security_guard',floor:1,x:420},
    {id:'security_guard',floor:2,x:420},
    {id:'security_guard',floor:3,x:450},
    {id:'hr_manager',floor:6,x:420},
    {id:'hr_manager',floor:8,x:180},
    {id:'design_manager',floor:4,x:205},
    {id:'design_manager',floor:8,x:430},
    {id:'design_manager',floor:9,x:430}
  ];
  const attacks = new Map();
  function preload(scene) {
    Object.values(profiles).filter(p=>p.enabled).forEach(p=>{
      if(!p.art?.path)throw new Error(`Missing reference artwork: ${p.id}`);
      scene.load.image(`trio-source-${p.id}`,p.art.path);
    });
  }
  function createTextures(scene, profile) {
    const art=profile.art;
    if(!art?.poses?.idle)throw new Error(`Missing idle pose: ${profile.id}`);
    const source=scene.textures.get(art.sourceKey||`trio-source-${profile.id}`).getSourceImage();
    const frames={};
    for(const [pose,rect] of Object.entries(art.poses)){
      const key=`trio-${profile.id}-${pose}`;
      if(!scene.textures.exists(key)){
        const canvas=scene.textures.createCanvas(key,profile.frameWidth,profile.frameHeight);
        canvas.context.imageSmoothingEnabled=false;
        // Scale all poses identically, preserving the reference proportions.
        // Each pose can specify footX/footY to align feet without resizing limbs.
        const [x,y,w,h]=rect;
        const scale=profile.renderHeight/art.poses.idle[3];
        const foot=art.anchors?.[pose]||{x:w/2,y:h};
        canvas.context.drawImage(source,x,y,w,h,
          Math.round(profile.frameWidth/2-foot.x*scale),Math.round(profile.frameHeight-foot.y*scale),
          Math.round(w*scale),Math.round(h*scale));
        canvas.refresh();
      }
      frames[pose]=key;
    }
    if(profile.contactEffect==='scream'){
      for(let i=0;i<2;i++){
        const pose=i?'scream_alt':'scream',key=`trio-${profile.id}-${pose}`;frames[pose]=key;
        if(scene.textures.exists(key))continue;
        const canvas=scene.textures.createCanvas(key,profile.frameWidth,profile.frameHeight),c=canvas.context;
        c.imageSmoothingEnabled=false;c.drawImage(scene.textures.get(frames.idle).getSourceImage(),0,0);
        // Face animation is baked into the sprite, so eyes/mouth keep the head's anchor.
        c.fillStyle='#e5a17c';c.fillRect(34,14,9,12);
        for(const x of [32-i,39+i]){
          c.fillStyle='#4a302b';c.fillRect(x,12,4,1);
          c.fillStyle='#17212c';c.fillRect(x-1,15,6,3);c.fillRect(x,14,4,5);
          c.fillStyle='#fff8e4';c.fillRect(x,15,4,3);
          c.fillStyle='#17212c';c.fillRect(x+1,15,1,2);
        }
        c.fillStyle='#522c29';c.fillRect(35,22,6,5+i);
        c.fillStyle='#17212c';c.fillRect(36,22,4,6+i);
        c.fillStyle='#fff5da';c.fillRect(36,22,4,1);
        c.fillStyle='#dc6974';c.fillRect(37,26+i,2,1);
        canvas.refresh();
      }
    }
    window.ITHeroMotion.complete(scene,frames,{prefix:`trio-${profile.id}`,sameWalk:profile.behavior==='sap'});
    if(profile.id==='design_manager'){
      for(const phase of ['golf','golf_follow']){
        const key=`trio-${profile.id}-${phase}`;frames[phase]=key;
        if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,profile.frameWidth,profile.frameHeight),c=t.context;c.imageSmoothingEnabled=false;c.save();c.translate(profile.frameWidth,0);c.scale(-1,1);c.drawImage(scene.textures.get(frames.idle).getSourceImage(),0,0);c.restore();c.strokeStyle='#17212c';c.lineWidth=4;c.beginPath();c.moveTo(43,57);c.lineTo(phase==='golf'?67:62,phase==='golf'?25:96);c.stroke();c.strokeStyle='#c8d9df';c.lineWidth=2;c.stroke();c.fillStyle='#d5e4dc';c.fillRect(phase==='golf'?64:59,phase==='golf'?23:94,10,4);c.fillStyle='#efb68d';c.fillRect(40,54,7,5);t.refresh();}
      }
    }
    return frames;
  }
  function create(scene,floors,options={}) {
    const catalog=options.profiles||profiles;
    const layout=options.placements||placements;
    const frames=new Map();
    Object.values(catalog).filter(p=>p.enabled).forEach(p=>frames.set(p.id,createTextures(scene,p)));
    const enemies=layout.filter(place=>catalog[place.id]?.enabled).map((place,index)=>{
      const profile=catalog[place.id];
      if(!Number.isInteger(place.floor)||place.floor<1||place.floor>floors.length)throw new Error(`Invalid enemy floor: ${place.floor}`);
      const e=scene.enemies.create(place.x,floors[place.floor-1]-profile.frameHeight/2,frames.get(profile.id).idle);
      e.setDepth(22).setCollideWorldBounds(true);
      e.body.setSize(profile.body.width,profile.body.height).setOffset(profile.body.x,profile.body.y);
      Object.assign(e,{kind:profile.id,profile,poses:frames.get(profile.id),floorIndex:place.floor-1,
        hp:profile.health,baseX:place.x,patrol:profile.patrol,direction:index%2?1:-1,
        lastAttack:scene.time.now,contactUntil:0,poseUntil:0,hitUntil:0,defeated:false});
      return e;
    });
    const pose=(e,name)=>{
      const actual=e.poses[name]?name:'idle';
      e.setTexture(e.poses[actual]);
      const facing=e.profile.art.facing?.[actual]||'right';
      const direction=e.facingDirection||e.direction;
      e.setFlipX(facing==='front'?false:facing==='left'?direction>0:direction<0);
    };
    const manager={enemies,
      update(e,time){
        if(e.profile.behavior==='dbpm'){scene.dbpm.update(e,pose);return;}
        if(e.profile.behavior==='sap'){window.ITHeroSAP.update(scene,e,time,pose);return;}
        window.ITHeroTrioAttacks.update(scene,e,time);
        if(e.defeated)return;
        if(e.floorIndex!==scene.floor){e.setVelocityX(0);return;}
        if(scene.pacing?.isWinding(e)){e.setVelocityX(0);return;}
        if(time<e.hitUntil){e.setVelocityX(0);pose(e,'hit');return;}
        if(time<e.contactUntil||time<e.poseUntil){e.setVelocityX(0);if(e.kind==='design_manager')pose(e,time<e.contactUntil?(Math.floor(time/100)%2?'scream':'scream_alt'):time<e.poseUntil-170?'golf':'golf_follow');return;}
        if(e.x<e.baseX-e.patrol)e.direction=1;
        if(e.x>e.baseX+e.patrol)e.direction=-1;
        if(e.kind==='design_manager'&&time>(e.nextAmbientAt||0)&&Math.abs(e.x-scene.player.x)<450){e.nextAmbientAt=time+14000;scene.enemyDialogue?.(e,'ambient');}
        const resting=time%(e.profile.movementCycle||3400)<(e.profile.idleDuration||0);
        e.facingDirection=e.direction;
        e.setVelocityX(resting?0:e.direction*e.profile.speed);
        pose(e,resting?'idle':Math.floor(time/180)%2?'walk':'walk_alt');
        if(Math.abs(e.x-scene.player.x)<e.profile.attackRange&&Math.abs(e.y-scene.player.y)<100&&time-e.lastAttack>e.profile.attackInterval){
          e.lastAttack=time;
          if(scene.pacing)scene.pacing.queue(e,()=>manager.attack(e),()=>{e.facingDirection=scene.player.x>=e.x?1:-1;pose(e,e.profile.attackPose);});
          else manager.attack(e);
        }
      },
      attack(e){
        if(scene.gameState!=='playing'||e.defeated||e.floorIndex!==scene.floor||Math.abs(e.y-scene.player.y)>=100)return;
        if(e.profile.behavior==='dbpm'){scene.dbpm.attack(e,pose);return;}
        if(e.profile.behavior==='sap'){window.ITHeroSAP.attack(scene,e,pose);return;}
        const attack=attacks.get(e.profile.attackType);
        if(!attack)throw new Error(`Unknown attack: ${e.profile.attackType}`);
        e.facingDirection=scene.player.x>=e.x?1:-1;
        pose(e,e.profile.attackPose);e.poseUntil=scene.time.now+350;e.setVelocityX(0);
        scene.enemyDialogue?.(e,'combat');
        attack(scene,e);
      },
      contact(e){
        if(scene.gameState!=='playing'||e.defeated||e.floorIndex!==scene.floor)return;
        if(e.profile.behavior==='dbpm'){scene.dbpm.attack(e,pose,'melee');return;}
        if(e.profile.behavior==='sap'){window.ITHeroSAP.attack(scene,e,pose,'melee');return;}
        scene.pacing?.cancel(e);
        scene.takeDamage(e.x,e.profile.damage);
        scene.enemyDialogue?.(e,e.kind==='design_manager'?'contact':'combat');
        if(scene.time.now<e.contactUntil)return;
        e.facingDirection=scene.player.x>=e.x?1:-1;
        e.contactUntil=scene.time.now+650;e.setVelocityX(0);pose(e,e.profile.contactPose);
        window.ITHeroTrioAttacks.contact(scene,e);
      },
      hit(e){if(e.profile.behavior==='dbpm'){scene.dbpm.hit(e,pose);return;}scene.pacing?.cancel(e);e.hitUntil=scene.time.now+160;if(e.profile.behavior==='sap')window.ITHeroSAP.hit(scene,e);pose(e,'hit');},
      defeat(e){
        if(e.profile.behavior==='dbpm'){scene.dbpm.defeat(e,pose);return;}
        scene.pacing?.cancel(e);
        if(e.profile.behavior==='sap')window.ITHeroSAP.defeat(scene,e);
        window.ITHeroTrioAttacks.clear(e);
        e.defeated=true;e.setVelocity(0,0);e.body.enable=false;pose(e,'defeat');
        scene.tweens.add({targets:e,alpha:0,...(e.profile.behavior==='sap'?{scaleY:0.5,angle:18}:{}),duration:260,onComplete:()=>e.destroy()});
      }
    };
    return manager;
  }
  attacks.set('office-weapons',(scene,e)=>window.ITHeroTrioAttacks.projectile(scene,e));
  attacks.set('default',(scene,e)=>{
    const direction=scene.player.x>=e.x?1:-1;
    const key=e.profile.projectile==='default'?'folder':e.profile.projectile;
    // A shared hand-height above the feet also works for the taller design manager.
    const originY=e.body.bottom+(e.profile.projectileOffsetY??-34);
    const shot=scene.enemyShots.create(e.x+direction*24,originY,key).setDepth(25).setScale(1.5);
    shot.body.setAllowGravity(false);
    shot.setVelocity(direction*245,-45).setAngularVelocity(direction*360);
    shot.setData('expires',scene.time.now+1900).setData('damage',e.profile.damage);
    scene.tone(170,0.06,'triangle');
  });
  window.ITHeroEnemyCatalog={profiles,placements,preload,create,createTextures,
    registerAttack(type,handler){attacks.set(type,handler);}
  };
})();
