/* Office enemy catalogue. Enable profiles as their reference artwork arrives.
 * Floor numbers in placements are 1–9. Existing enemies are not configured here.
 */
(() => {
  'use strict';
  const profiles = {
    security_guard: {
      id:'security_guard',name:'BEZPEČÁK',enabled:true,idleDuration:650,movementCycle:3400,
      health:4,speed:45,patrol:24,attackInterval:1900,attackRange:380,
      attackType:'default',projectile:'default',damage:1,score:100,
      contactPose:'stop',attackPose:'radio',
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
      attackType:'default',projectile:'default',damage:1,score:100,
      contactPose:'stop',attackPose:'documents',
      frameWidth:80,frameHeight:96,renderHeight:92,
      body:{width:26,height:88,x:27,y:8},
      art:{
        path:'assets/characters/hr_manager.png',
        poses:{idle:[215,9,302,814],stop:[783,10,291,815],walk:[1377,13,297,811],documents:[1377,13,297,811]},
        facing:{idle:'left',stop:'front',walk:'right',documents:'right'},
        anchors:{idle:{x:129.5,y:814},stop:{x:141,y:815},walk:{x:173.5,y:811},documents:{x:173.5,y:811}}
      }
    },
    design_manager: {
      id:'design_manager',name:'MANAŽER DESIGNU',enabled:true,idleDuration:800,movementCycle:3800,
      health:4,speed:39,patrol:18,attackInterval:1950,attackRange:380,
      attackType:'default',projectile:'default',damage:1,score:100,
      contactPose:'explain',attackPose:'tablet',
      frameWidth:80,frameHeight:112,renderHeight:108,
      body:{width:24,height:104,x:28,y:8},
      art:{
        path:'assets/characters/design_manager.png',
        poses:{idle:[180,37,288,975],explain:[583,38,375,973],tablet:[583,38,375,973],walk:[1042,41,369,970]},
        facing:{idle:'left',explain:'left',tablet:'left',walk:'right'},
        anchors:{idle:{x:145.5,y:975},explain:{x:170.5,y:973},tablet:{x:170.5,y:973},walk:{x:214.5,y:970}}
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
        if(e.defeated)return;
        if(e.floorIndex!==scene.floor){e.setVelocityX(0);return;}
        if(time<e.hitUntil){e.setVelocityX(0);pose(e,'hit');return;}
        if(time<e.contactUntil||time<e.poseUntil){e.setVelocityX(0);return;}
        if(e.x<e.baseX-e.patrol)e.direction=1;
        if(e.x>e.baseX+e.patrol)e.direction=-1;
        const resting=time%(e.profile.movementCycle||3400)<(e.profile.idleDuration||0);
        e.facingDirection=e.direction;
        e.setVelocityX(resting?0:e.direction*e.profile.speed);
        pose(e,resting?'idle':Math.floor(time/180)%2?'walk':'idle');
        if(Math.abs(e.x-scene.player.x)<e.profile.attackRange&&Math.abs(e.y-scene.player.y)<100&&time-e.lastAttack>e.profile.attackInterval){
          e.lastAttack=time;manager.attack(e);
        }
      },
      attack(e){
        if(scene.gameState!=='playing'||e.defeated||e.floorIndex!==scene.floor||Math.abs(e.y-scene.player.y)>=100)return;
        const attack=attacks.get(e.profile.attackType);
        if(!attack)throw new Error(`Unknown attack: ${e.profile.attackType}`);
        e.facingDirection=scene.player.x>=e.x?1:-1;
        pose(e,e.profile.attackPose);e.poseUntil=scene.time.now+350;e.setVelocityX(0);
        attack(scene,e);
      },
      contact(e){
        if(scene.gameState!=='playing'||e.defeated||e.floorIndex!==scene.floor)return;
        scene.takeDamage(e.x,e.profile.damage);
        if(scene.time.now<e.contactUntil)return;
        e.facingDirection=scene.player.x>=e.x?1:-1;
        e.contactUntil=scene.time.now+650;e.setVelocityX(0);pose(e,e.profile.contactPose);
      },
      hit(e){e.hitUntil=scene.time.now+160;pose(e,'hit');},
      defeat(e){
        e.defeated=true;e.setVelocity(0,0);e.body.enable=false;pose(e,'defeat');
        scene.tweens.add({targets:e,alpha:0,duration:260,onComplete:()=>e.destroy()});
      }
    };
    return manager;
  }
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
  window.ITHeroEnemyCatalog={profiles,placements,preload,create,
    registerAttack(type,handler){attacks.set(type,handler);}
  };
})();
