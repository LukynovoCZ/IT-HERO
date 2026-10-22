/* DBPM: same-floor pursuit and cancellable, active-time attacks. No runtime dependencies. */
(() => {
  'use strict';
  const config={health:6,score:250,speed:98,minX:55,maxX:905,maxActive:1,
    jumpVelocity:-530,jumpCooldown:650,lookAhead:44,retreatDistance:102,
    initialDelay:1200,arrivalDelay:900,arrivalDuration:1400,meleeRange:82,meleeWindup:350,meleeActive:110,meleeCooldown:1500,
    throwRange:430,throwWindup:450,throwCooldown:2300,recovery:250,hitStun:180,
    laptop:{speed:245,launchY:-130,gravity:360,spin:330,lifetime:1900},
    baguette:{speed:315,launchY:-165,gravity:500,spin:520,lifetime:1500},
    demandMin:12000,demandMax:18000,demandWindup:500,demandLifetime:5000,demandHealth:2,
    placements:[{floor:4,x:140,enabled:true},{floor:6,x:225,encounter:'sixth_first',enabled:true},{floor:6,x:500,encounter:'sixth_second',after:'sixth_first',enabled:true},{floor:8,x:820,health:8,speed:105,enabled:false}]};
  const frame=index=>[index*160,0,160,96];
  const profile={id:'dbpm',name:'BYZNYSÁK',enabled:true,behavior:'dbpm',health:config.health,
    speed:config.speed,patrol:425,attackRange:config.throwRange,attackInterval:config.throwCooldown,
    attackType:'dbpm',damage:1,score:config.score,contactPose:'melee',attackPose:'throw_laptop',
    frameWidth:160,frameHeight:96,renderHeight:96,previewHeight:82,body:{width:26,height:80,x:67,y:16},
    projectiles:[{key:'dbpm-laptop'},{key:'dbpm-baguette'}],
    art:{path:'assets/characters/dbpm.png',poses:{idle:frame(0),walk:frame(1),walk_alt:frame(2),jump:frame(3),
      melee:frame(4),throw_laptop:frame(5),throw_baguette:frame(6),demand:frame(7),hit:frame(0),defeat:frame(8)}}};
  ITHeroEnemyCatalog.profiles.dbpm=profile;
  config.placements.filter(p=>p.enabled).forEach(p=>ITHeroEnemyCatalog.placements.push({...p,id:'dbpm'}));

  function textures(scene){
    const make=(key,w,h,draw)=>{if(scene.textures.exists(key))return;const g=scene.make.graphics({add:false});draw(g);g.generateTexture(key,w,h);g.destroy();};
    make('dbpm-laptop',30,23,g=>{
      g.fillStyle(0x142332).fillRect(4,0,24,17).fillRect(0,17,30,6);
      g.fillStyle(0x6b8b98).fillRect(7,3,18,11);g.fillStyle(0xb3d7d0).fillRect(9,5,13,2);
      g.fillStyle(0x87958e).fillRect(3,18,23,2);g.fillStyle(0x314a52).fillRect(12,21,8,1);
    });
    make('dbpm-baguette',34,12,g=>{
      g.fillStyle(0x3b281f).fillRect(2,2,30,8).fillRect(0,4,34,4);
      g.fillStyle(0xc27c32).fillRect(3,3,27,6);g.fillStyle(0xf3c76d).fillRect(5,3,22,3);
      for(let x=7;x<28;x+=7)g.fillStyle(0xffe2a1).fillRect(x,2,2,5);
    });
    make('dbpm-demand',58,56,g=>{
      g.fillStyle(0x122d27).fillRect(0,0,58,56);g.fillStyle(0xf1eedb).fillRect(3,3,52,50);
      g.fillStyle(0x287d55).fillRect(3,3,52,12);g.fillStyle(0xa4e963).fillRect(7,7,18,3);
      g.fillStyle(0x96b5a0);for(let x=5;x<55;x+=13)g.fillRect(x,18,1,32);for(let y=18;y<52;y+=8)g.fillRect(5,y,48,1);
      g.fillStyle(0x73a376).fillRect(19,27,11,6).fillRect(32,35,11,6);g.fillStyle(0xdc9d63).fillRect(6,43,11,6);
    });
    make('dbpm-paper',10,12,g=>{g.fillStyle(0x1c3b31).fillRect(0,0,10,12);g.fillStyle(0xe3edcc).fillRect(1,1,8,10);g.fillStyle(0x4a936a).fillRect(2,3,6,2).fillRect(2,7,4,1);});
  }

  function create(scene,floors){
    textures(scene);
    const actors=scene.enemyTrio.enemies.filter(e=>e.kind==='dbpm');
    const demands=scene.physics.add.staticGroup();
    const state={clock:0,demand:null,shots:new Set(),fragments:[],deaths:new Map(),destroyed:false};
    const hud=scene.add.container(580,58).setScrollFactor(0).setDepth(103).setVisible(false);
    const bar=scene.add.graphics(),label=scene.add.text(8,3,'',{font:'12px monospace',color:'#f1eedb'});hud.add([bar,label]);
    const randomInterval=()=>Phaser.Math.Between(config.demandMin,config.demandMax);
    for(const e of actors){
      const place=config.placements.find(p=>p.floor===e.floorIndex+1&&p.x===e.baseX);
      e.hp=place?.health??config.health;e.maxHp=e.hp;e.dbpmSpeed=place?.speed??config.speed;
      e.dbpm={attack:null,throwCount:0,nextAttack:state.clock+config.initialDelay,nextDemand:state.clock+randomInterval(),
        encounter:place?.encounter,waitingFor:place?.after,arrival:null,announced:false,hitUntil:0,nextJump:0,nextSpeech:state.clock+1500,speech:null,speechUntil:0};
    }
    const sameFloor=e=>e.active&&!e.defeated&&!e.dbpm.waitingFor&&!e.dbpm.arrival&&e.floorIndex===scene.floor;
    function destroyShot(shot){if(shot.active)shot.destroy();state.shots.delete(shot);}
    function shatter(x,y){
      for(let i=0;i<6;i++){
        const image=scene.add.image(x+(i%3-1)*12,y+Math.floor(i/3)*8,'dbpm-paper').setDepth(31);
        state.fragments.push({image,floor:scene.floor,age:0,vx:(i-2.5)*42,vy:-110-Math.random()*70});
      }
    }
    function removeDemand(effects=false){
      const d=state.demand;if(!d)return;
      if(effects)shatter(d.image.x,d.image.y);
      d.image.destroy();d.label.destroy();state.demand=null;
    }
    function clear(e){
      e.dbpm.liftDoor?.destroy();e.dbpm.liftDoor=null;
      if(e.dbpm.arrival?.phase==='walk')e.dbpm.arrival={phase:'wait',at:state.clock+200};
      e.dbpm.attack?.warning?.destroy();e.dbpm.attack=null;e.dbpm.onFloor=false;e.dbpm.speech?.destroy();e.dbpm.speech=null;
      for(const shot of [...state.shots])if(shot.getData('dbpmOwner')===e)destroyShot(shot);
      if(state.demand?.owner===e)removeDemand();
      if(e.active){e.setVelocity(0,0);e.setAngle(0);}
    }
    function arrive(e){
      const d=e.dbpm,a=d.arrival,ground=floors[e.floorIndex];e.body.enable=false;e.setVelocity(0,0);
      if(a.phase==='wait'){
        e.setActive(false).setVisible(false);if(state.clock<a.at)return;
        a.phase='walk';a.started=state.clock;a.exitX=scene.player.x<500?560:440;
        d.liftDoor=scene.add.graphics().setDepth(21);
      }
      const p=Phaser.Math.Clamp((state.clock-a.started)/config.arrivalDuration,0,1),opening=Math.min(1,p*2);
      d.liftDoor.clear().fillStyle(0x14252c).fillRect(458,ground-142,84,142).fillStyle(0x80989b)
        .fillRect(458,ground-142,42*(1-opening),142).fillRect(542-42*(1-opening),ground-142,42*(1-opening),142);
      e.setActive(true).setVisible(true).setAlpha(Math.min(1,p*3)).setPosition(500+(a.exitX-500)*p,ground-48+(1-p)*8);
      e.setTexture(e.poses[Math.floor(state.clock/160)%2?'walk':'walk_alt']).setFlipX(a.exitX<500);
      if(!d.announced&&p>.2){d.announced=!!scene.dialogue.say(e,'dbpm','arrival',{priority:true,replace:true});}
      if(p>=1){
        d.liftDoor.destroy();d.liftDoor=null;d.arrival=null;d.onFloor=true;e.setAlpha(1);
        const x=Math.abs(scene.player.x-e.x)<55?(scene.player.x<500?560:440):e.x;
        e.body.reset(x,ground-48);e.body.enable=true;d.nextAttack=state.clock+config.initialDelay;d.nextDemand=state.clock+randomInterval();
      }
    }
    function say(e,group){
      if(!sameFloor(e))return;
      e.dbpm.speech=scene.dialogue.say(e,'dbpm',group)||e.dbpm.speech;
    }
    function track(shot,e,lifetime){
      shot.setData('killerId',e.kind).setData('dbpmOwner',e).setData('floor',e.floorIndex).setData('damage',1)
        .setData('activeExpires',state.clock+lifetime).setData('expires',scene.time.now+lifetime);
      state.shots.add(shot);return shot;
    }
    function fire(e,type,direction){
      const spec=config[type],shot=scene.enemyShots.create(e.x+direction*32,e.body.bottom-42,`dbpm-${type}`).setDepth(26);
      shot.body.setAllowGravity(true);shot.body.setGravityY(spec.gravity-scene.physics.world.gravity.y);
      shot.setVelocity(direction*spec.speed,spec.launchY).setAngularVelocity(direction*spec.spin).setFlipX(direction<0);
      shot.body.setSize(type==='laptop'?24:28,type==='laptop'?17:8,true);
      scene.tone(type==='laptop'?175:370,.08,'triangle');return track(shot,e,spec.lifetime);
    }
    function melee(e,direction){
      const shot=scene.enemyShots.create(e.body.center.x+direction*(e.body.halfWidth+config.meleeRange/2),e.body.bottom-27,'dbpm-baguette')
        .setDepth(27).setDisplaySize(config.meleeRange,17).setFlipX(direction<0);
      shot.body.setAllowGravity(false);shot.body.setSize(34,18,true);
      track(shot,e,config.meleeActive);scene.tone(150,.09,'triangle');
    }
    function demandBase(x,floor,radius=29){
      const ground=floors[floor];
      const support=scene.obstacles.getChildren().find(o=>o.active&&o.body?.enable&&o.body.width>=78&&o.body.height<=42&&Math.abs(o.body.bottom-ground)<5&&x-radius>=o.body.left+1&&x+radius<=o.body.right-1);
      return support? support.body.top:ground;
    }
    function reserved(x,floor,radius=29){
      if(x-radius<config.minX||x+radius>config.maxX||Math.abs(x-scene.doors[floor].x)<radius+43||Math.abs(x-(scene.doors[floor].x===81?879:81))<radius+43||Math.abs(x-500)<95)return true;
      const ground=floors[floor],base=demandBase(x,floor),player=scene.player.body;
      if(player.left<x+radius+22&&player.right>x-radius-22)return true;
      if(scene.pacing?.reserved(x,floor,radius+5))return true;
      if([...scene.obstacles.getChildren(),...scene.platforms.getChildren()].some(o=>o.active&&o.body?.enable&&o.body.left<x+radius+2&&o.body.right>x-radius-2&&o.body.top<base-1&&o.body.bottom>base-56))return true;
      if(scene.enemies.getChildren().some(e=>e.active&&e.body?.enable&&e.body.left<x+radius+2&&e.body.right>x-radius-2&&e.body.bottom>base-56&&e.body.top<base))return true;
      if([...scene.coffees.getChildren(),...scene.upgrades.getChildren(),...scene.aidItems.getChildren(),...scene.colleague.items.getChildren()].some(o=>o.active&&Math.abs(o.x-x)<radius+16&&Math.abs(o.y-base)<65))return true;
      return false;
    }
    function demandPosition(e){
      const direction=scene.player.x>=e.x?1:-1;
      const options=[scene.player.x+direction*150,scene.player.x-direction*150,scene.player.x+direction*220,scene.player.x-direction*220,...scene.obstacles.getChildren().filter(o=>o.body?.width>=78&&o.body.height<=42&&Math.abs(o.body.bottom-floors[e.floorIndex])<5).map(o=>o.x),240,390,630,810];
      const x=options.find(x=>Math.abs(x-scene.player.x)>=110&&Math.abs(x-scene.player.x)<=260&&!reserved(x,e.floorIndex));
      return x===undefined?undefined:{x,base:demandBase(x,e.floorIndex)};
    }
    function spawnDemand(e){
      if(state.demand||!sameFloor(e))return false;
      const place=demandPosition(e);if(place===undefined)return false;const {x,base}=place;
      const image=demands.create(x,base-28,'dbpm-demand').setDepth(20).refreshBody();
      const text=scene.add.text(x,base-73,`DEMAND · ${config.demandHealth}`,{font:'bold 10px monospace',color:'#c7ff9c',backgroundColor:'#173c2e',padding:{x:3,y:2}}).setOrigin(.5).setDepth(21);
      state.demand={image,label:text,hp:config.demandHealth,owner:e,floor:e.floorIndex,expires:state.clock+config.demandLifetime,tintUntil:0};
      return true;
    }
    function begin(e,pose,forced){
      if(!sameFloor(e)||scene.gameState!=='playing'||scene.transitioning||e.dbpm.attack||state.clock<e.dbpm.hitUntil)return false;
      if(forced!=='demand'&&state.clock<e.dbpm.nextAttack)return false;
      const distance=Math.abs(scene.player.x-e.x);
      const type=forced||(distance<=config.meleeRange?'melee':e.dbpm.throwCount%2?'baguette':'laptop');
      if(type!=='demand'&&distance>(type==='melee'?config.meleeRange+10:config.throwRange))return false;
      if(type==='demand'&&(state.demand||demandPosition(e)===undefined))return false;
      const direction=scene.player.x>=e.x?1:-1;e.facingDirection=direction;e.direction=direction;
      const windup=type==='demand'?config.demandWindup:type==='melee'?config.meleeWindup:config.throwWindup;
      const warning=scene.add.text(e.x,e.body.top-16,'!',{font:'bold 22px monospace',color:'#ffda69',stroke:'#142d27',strokeThickness:4}).setOrigin(.5).setDepth(111);
      e.dbpm.attack={type,direction,warning,at:state.clock+windup,end:state.clock+windup+config.recovery,fired:false};
      e.dbpm.nextAttack=state.clock+(type==='melee'?config.meleeCooldown:config.throwCooldown);
      if(type==='demand')e.dbpm.nextDemand=state.clock+randomInterval();
      else if(type!=='melee')e.dbpm.throwCount++;
      pose(e,type==='demand'?'demand':type==='melee'?'melee':`throw_${type}`);e.setVelocityX(0);
      say(e,type==='demand'?'demand':'attack');return true;
    }
    const manager={state,actors,demands,config,hud,healthLabel:label,say,spawnDemand,demandPosition,
      isReserved(x,floor){const d=state.demand;return !!d&&d.floor===floor&&Math.abs(d.image.x-x)<60;},
      attack:begin,
      update(e,pose){
        if(!sameFloor(e)||!e.body.enable)return;
        const d=e.dbpm;
        if(state.clock<d.hitUntil){e.setVelocityX(0);pose(e,'hit');return;}
        if(d.attack){
          const a=d.attack;e.setVelocityX(0);a.warning.setPosition(e.x,e.body.top-16);
          if(!a.fired&&state.clock>=a.at){
            a.fired=true;a.warning.setVisible(false);
            if(a.type==='demand')spawnDemand(e);else if(a.type==='melee')melee(e,a.direction);else fire(e,a.type,a.direction);
          }
          if(state.clock>=a.end){a.warning.destroy();d.attack=null;}
          return;
        }
        const grounded=e.body.blocked.down||e.body.touching.down;
        if(grounded&&state.clock>=d.nextDemand&&!state.demand){if(begin(e,pose,'demand'))return;d.nextDemand=state.clock+1000;}
        if(grounded&&Math.abs(scene.player.x-e.x)<=config.throwRange&&Math.abs(scene.player.body.bottom-e.body.bottom)<120&&begin(e,pose))return;
        const dx=scene.player.x-e.x;let direction=dx>=0?1:-1;
        if(Math.abs(dx)<config.retreatDistance&&state.clock<d.nextAttack-550)direction=-direction;
        if(e.x<=config.minX)direction=1;if(e.x>=config.maxX)direction=-1;
        e.direction=direction;e.facingDirection=direction;e.setVelocityX(direction*e.dbpmSpeed);
        const obstacles=[...scene.obstacles.getChildren(),...demands.getChildren(),...(scene.pacing?.carts||[]).map(c=>c.sprite)];
        const blocked=direction>0?e.body.blocked.right:e.body.blocked.left;
        const ahead=obstacles.some(o=>{
          const b=o.body;if(!o.active||!b?.enable)return false;
          const gap=direction>0?b.left-e.body.right:e.body.left-b.right;
          return gap>=-8&&gap<config.lookAhead&&b.top<e.body.bottom-5&&b.bottom>e.body.bottom-110&&e.body.bottom-b.top<125;
        });
        if(grounded&&(blocked||ahead)&&state.clock>=d.nextJump){e.setVelocityY(config.jumpVelocity);d.nextJump=state.clock+config.jumpCooldown;}
        pose(e,grounded&&!ahead?(Math.floor(state.clock/150)%2?'walk':'walk_alt'):'jump');
        say(e,'chase');
      },
      hit(e,pose){
        e.dbpm.attack?.warning.destroy();e.dbpm.attack=null;e.dbpm.hitUntil=state.clock+config.hitStun;
        e.dbpm.nextAttack=Math.max(e.dbpm.nextAttack,state.clock+650);e.setVelocityX(0);pose(e,'hit');say(e,'hit');
      },
      defeat(e,pose){
        clear(e);e.defeated=true;e.body.enable=false;pose(e,'defeat');shatter(e.x,e.y-25);
        scene.dialogue.say(e,'dbpm','defeat',{replace:true,priority:true,persist:true});state.deaths.set(e,state.clock+650);
      },
      tick(delta){
        if(state.destroyed)return;
        const active=scene.gameState==='playing'&&!scene.transitioning;
        if(active)state.clock+=delta;
        for(const e of actors){if(!e.scene||!e.dbpm.waitingFor)continue;const previous=actors.find(p=>p.dbpm.encounter===e.dbpm.waitingFor);if(previous&&(previous.defeated||!previous.scene)){e.dbpm.waitingFor=null;e.dbpm.arrival={phase:'wait',at:state.clock+config.arrivalDelay};}}
        const selected=actors.filter(e=>e.scene&&!e.defeated&&!e.dbpm.waitingFor&&e.floorIndex===scene.floor).slice(0,config.maxActive);
        for(const e of actors){
          if(!e.scene){clear(e);continue;}
          if(e.defeated&&state.deaths.has(e)&&e.floorIndex===scene.floor&&['playing','paused'].includes(scene.gameState)){
            e.body.enable=false;e.setVisible(true);if(active){e.setAlpha(Math.max(0,(state.deaths.get(e)-state.clock)/650));e.y+=delta*.007;}continue;
          }
          if(!selected.includes(e)||['lose','win','restarting'].includes(scene.gameState)||scene.transitioning){
            clear(e);if(e.body)e.body.enable=false;e.setActive(false).setVisible(false);
            if(e.defeated){state.deaths.delete(e);e.destroy();}continue;
          }
          if(e.dbpm.arrival){if(active)arrive(e);continue;}
          if(!e.dbpm.onFloor&&active){e.dbpm.onFloor=true;e.dbpm.nextAttack=state.clock+config.initialDelay;e.dbpm.nextDemand=state.clock+randomInterval();e.dbpm.nextSpeech=state.clock+1500;}
          e.setActive(true).setVisible(true);e.body.enable=true;

          e.dbpm.attack?.warning.setVisible(active&&!e.dbpm.attack.fired);
        }
        for(const shot of [...state.shots]){
          if(!shot.active){state.shots.delete(shot);continue;}
          if(shot.getData('floor')!==scene.floor||['lose','win','restarting'].includes(scene.gameState)||scene.transitioning||state.clock>=shot.getData('activeExpires')){destroyShot(shot);continue;}
          shot.setData('expires',scene.time.now+Math.max(0,shot.getData('activeExpires')-state.clock));
        }
        const d=state.demand;
        if(d){
          if(d.floor!==scene.floor||!d.owner.active||d.owner.defeated||['lose','win','restarting'].includes(scene.gameState)||scene.transitioning)removeDemand();
          else if(state.clock>=d.expires)removeDemand(true);
          else if(state.clock>=d.tintUntil)d.image.clearTint();
        }
        for(const fx of [...state.fragments]){
          if(active){fx.age+=delta;fx.vy+=500*delta/1000;fx.image.x+=fx.vx*delta/1000;fx.image.y+=fx.vy*delta/1000;fx.image.angle+=delta*.2;fx.image.setAlpha(1-fx.age/600);}
          if(fx.age>=600||fx.floor!==scene.floor||['lose','win','restarting'].includes(scene.gameState)||scene.transitioning){fx.image.destroy();state.fragments.splice(state.fragments.indexOf(fx),1);}
        }
        for(const [e,end] of state.deaths)if(state.clock>=end||!e.active){if(e.active)e.destroy();state.deaths.delete(e);}
        const target=selected.find(e=>!e.defeated&&e.active);hud.setVisible(active&&!!target);
        if(target){bar.clear().fillStyle(0x18342c).fillRect(0,0,360,33).fillStyle(0x3b5b4c).fillRect(8,22,344,6).fillStyle(0xe4bb69).fillRect(8,22,344*Math.max(0,target.hp)/target.maxHp,6);label.setText(`BYZNYSÁK – VŠE KOMPLIKUJE  ${target.hp}/${target.maxHp}`);}
      },
      destroy(){
        if(state.destroyed)return;state.destroyed=true;actors.forEach(clear);removeDemand();for(const shot of [...state.shots])destroyShot(shot);
        state.fragments.forEach(f=>f.image.destroy());state.fragments=[];state.deaths.clear();demands.destroy(true);hud.destroy();
      }
    };
    scene.physics.add.collider(scene.player,demands);scene.physics.add.collider(scene.enemies,demands);
    scene.physics.add.collider(scene.playerShots,demands,(shot,image)=>{
      const d=state.demand;if(!shot.active||!d||d.image!==image||d.floor!==scene.floor)return;
      d.hp-=shot.getData('damage')||1;shot.destroy();
      if(d.hp<=0)removeDemand(true);else{d.label.setText(`DEMAND · ${d.hp}`);d.image.setTintFill(0xffffff);d.tintUntil=state.clock+100;}
    });
    scene.physics.add.collider(scene.enemyShots,demands,shot=>{if(shot.active)shot.destroy();});
    scene.events.once('shutdown',()=>manager.destroy());return manager;
  }
  window.ITHeroDBPM={config,profile,textures,create};
})();
