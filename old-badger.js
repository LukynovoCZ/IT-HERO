/* Old Badger: a separate, indestructible body. Only a descending head stomp wins. */
(() => {
  'use strict';
  const config={spawnIntervalMin:25000,spawnIntervalMax:45000,walkSpeed:28,minX:55,maxX:905,
    jumpVelocity:-520,jumpCooldown:700,lookAhead:24,
    pauseDuration:950,stompBounceVelocity:-330,sinkAnimationDuration:1250,scoreReward:150,
    exitDuration:1200,quoteInterval:7000,stompTolerance:9,eatDuration:1800};
  const lines=window.ITHeroDialogue.lines('old_badger','ambient');
  const blockLines=window.ITHeroDialogue.lines('old_badger','block');
  const art={path:'assets/characters/old_badger.png',poses:{idle:[104,114,344,594],walk:[578,116,388,601],block:[1062,119,378,589],stomp:[1542,493,442,218]},anchors:{idle:{x:170,y:594},walk:{x:169,y:601},block:{x:186,y:589},stomp:{x:226,y:218}}};
  function preload(scene){scene.load.image('badger-source',art.path);}
  function createTextures(scene){
    const frames={},source=scene.textures.get('badger-source').getSourceImage();
    for(const [pose,[x,y,w,h]] of Object.entries(art.poses)){
      const key=`badger-${pose}`;frames[pose]=key;if(scene.textures.exists(key))continue;
      const canvas=scene.textures.createCanvas(key,80,80);canvas.context.imageSmoothingEnabled=false;
      const scale=76/art.poses.idle[3],foot=art.anchors[pose]||{x:w/2,y:h};
      canvas.context.drawImage(source,x,y,w,h,Math.round(40-foot.x*scale),Math.round(80-foot.y*scale),Math.round(w*scale),Math.round(h*scale));canvas.refresh();
    }return frames;
  }
  function create(scene,floors){
    const frames=createTextures(scene),group=scene.physics.add.group({allowGravity:false,immovable:true});
    const state={clock:0,nextAt:Phaser.Math.Between(config.spawnIntervalMin,config.spawnIntervalMax),entity:null,effects:[]};
    const colliders=[];
    const schedule=()=>state.nextAt=state.clock+Phaser.Math.Between(config.spawnIntervalMin,config.spawnIntervalMax);
    function clear(){
      const e=state.entity;
      if(e){if(e.savedCameraOffset&&scene.cameras.main?.followOffset)scene.cameras.main.setFollowOffset(e.savedCameraOffset.x,e.savedCameraOffset.y);e.snack?.destroy();e.speech?.destroy();e.door?.destroy();e.stars?.destroy();e.clearMask(true);e.maskGraphics?.destroy();e.destroy();state.entity=null;}
      state.effects.forEach(fx=>fx.graphics.destroy());state.effects=[];
    }
    function safeSpawn(){
      const ground=floors[scene.floor];
      if(scene.pacing?.reserved(500,scene.floor,95)||scene.genZ?.isReserved(500,scene.floor,110))return false;
      if(Math.abs(scene.player.x-500)<95&&Math.abs(scene.player.body.bottom-ground)<150)return false;
      if(scene.helperVisit?.source==='lift'&&scene.helperVisit.floor===scene.floor)return false;
      return !scene.obstacles.getChildren().some(o=>o.active&&o.body&&o.body.left<522&&o.body.right>478&&o.body.top<ground&&o.body.bottom>ground-75);
    }
    function spawn(){
      if(state.entity||scene.gameState!=='playing'||scene.transitioning)return false;
      if(!safeSpawn()){state.nextAt=state.clock+1500;return false;}
      const floor=scene.floor,ground=floors[floor];
      const e=group.create(500,ground-40,frames.walk).setDepth(22).setAlpha(0);
      e.body.setSize(36,70).setOffset(22,10).setAllowGravity(false).setImmovable(false);e.body.pushable=false;e.body.enable=false;
      Object.assign(e,{floorIndex:floor,phase:'exit',started:state.clock,baseX:500,direction:scene.player.x<500?1:-1,
        actionAt:state.clock+config.exitDuration+config.pauseDuration,nextQuote:state.clock+config.quoteInterval,
        blockUntil:0,lastFootstep:0,nextJump:0,stomped:false});
      e.door=scene.add.graphics().setDepth(17);state.entity=e;schedule();scene.tone(520,0.08,'triangle');return true;
    }
    function speak(e,pool){
      if(state.clock<e.nextQuote)return;
      const text=Phaser.Utils.Array.GetRandom(pool);e.nextQuote=state.clock+config.quoteInterval;
      e.speech?.destroy();e.speech=scene.add.text(e.x,e.body.top-16,text,{font:'bold 11px monospace',color:'#fff0c7',backgroundColor:'#27332e',wordWrap:{width:240},align:'center',padding:{x:6,y:5}}).setOrigin(0.5,1).setDepth(107);e.speechUntil=state.clock+2800;
      scene.posters.showMessage(`SENIOR MASTER\n${text}`,5000);
    }
    function impact(x,y,dust=false){
      const graphics=scene.add.graphics().setDepth(28);state.effects.push({graphics,x,y,started:state.clock,dust});
      if(state.effects.length>12)state.effects.shift().graphics.destroy();
    }
    function block(shot){
      const e=state.entity;if(!shot.active||!e||e.stomped||!e.body.enable)return;
      const x=shot.x,y=shot.y;shot.destroy();e.blockUntil=state.clock+220;impact(x,y);scene.tone(380,0.025,'triangle');speak(e,blockLines);
    }
    function intercept(shot){
      const e=state.entity;
      if(!shot.active||!e||e.stomped||!e.body.enable||e.floorIndex!==scene.floor)return false;
      const body=shot.body,dx=e.body;
      const line=new Phaser.Geom.Line(body.prev.x+body.halfWidth,body.prev.y+body.halfHeight,body.center.x,body.center.y);
      const bounds=new Phaser.Geom.Rectangle(dx.left-body.halfWidth,dx.top-body.halfHeight,dx.width+body.width,dx.height+body.height);
      if(Phaser.Geom.Intersects.LineToRectangle(line,bounds)){block(shot);return true;}return false;
    }
    function stomp(e){
      if(e!==state.entity||e.stomped||!e.body.enable||scene.gameState!=='playing')return false;
      e.snack?.destroy();e.snack=null;e.stomped=true;e.phase='sink';e.started=state.clock;e.setVelocity(0,0);e.body.enable=false;e.speech?.destroy();e.speech=null;
      e.door?.destroy();e.door=null;
      scene.player.setVelocityY(config.stompBounceVelocity);
      // Keep the head/sink animation above the fixed lower HUD while the hero bounces.
      e.savedCameraOffset=scene.cameras.main.followOffset.clone();
      scene.cameras.main.setFollowOffset(e.savedCameraOffset.x,35);
      scene.score+=config.scoreReward;scene.updateHUD();scene.popText(e.x,e.y-65,`+${config.scoreReward} SENIOR MASTER`,'#f7d887');scene.tone(80,0.16,'triangle');
      e.maskGraphics=scene.make.graphics({add:false}).fillStyle(0xffffff).fillRect(0,floors[e.floorIndex]-180,960,180);
      e.setMask(e.maskGraphics.createGeometryMask());e.stars=scene.add.graphics().setDepth(28);impact(e.x,floors[e.floorIndex]-2,true);return true;
    }
    function canStomp(player,e){
      if(e.stomped||!e.body.enable||e.phase==='exit')return false;
      const p=player.body,b=e.body,previousBottom=p.prev.y+p.height;
      const overlap=Math.min(p.right,b.right)-Math.max(p.left,b.left);
      return p.velocity.y>0&&previousBottom<=b.top+config.stompTolerance&&p.bottom>=b.top&&overlap>=6;
    }
    function configurePhysics(){
      // Registered before the ordinary enemy overlap: a destroyed shot cannot hurt someone behind him.
      colliders.push(scene.physics.add.overlap(scene.playerShots,group,shot=>block(shot),()=>scene.gameState==='playing'&&!scene.transitioning));
      colliders.push(scene.physics.add.collider(scene.player,group,undefined,(player,e)=>{
        if(scene.gameState!=='playing'||scene.transitioning||e.stomped||!e.body.enable)return false;
        if(canStomp(player,e)){stomp(e);return false;}return true;
      }));
      colliders.push(scene.physics.add.collider(group,scene.platforms));
      colliders.push(scene.physics.add.collider(group,scene.obstacles));
      // Deliberately no enemyShots × badger collider or overlap.
    }
    function update(delta){
      if(['lose','win','restarting'].includes(scene.gameState)){clear();return;}
      if(state.entity&&state.entity.floorIndex!==scene.floor){clear();return;}
      if(scene.gameState!=='playing'||scene.transitioning)return;
      state.clock+=delta;
      state.effects=state.effects.filter(fx=>{
        const age=state.clock-fx.started,duration=fx.dust?480:200;
        if(age>duration){fx.graphics.destroy();return false;}
        const t=age/duration;fx.graphics.clear().setAlpha(1-t);
        for(let i=0;i<6;i++){const angle=i*Math.PI/3;fx.graphics.fillStyle(fx.dust?0xa6afa0:i%2?0xffd15e:0xe9f8fa).fillRect(fx.x+Math.cos(angle)*(5+t*20),fx.y+Math.sin(angle)*(4+t*12)-(fx.dust?t*6:0),fx.dust?5:3,fx.dust?4:3);}return true;
      });
      const e=state.entity;
      if(!e){if(state.clock>=state.nextAt)spawn();return;}
      const ground=floors[e.floorIndex],age=state.clock-e.started;
      if(e.phase==='sink'){
        const progress=age/config.sinkAnimationDuration;
        if(progress>=1){const x=e.x;scene.tone(62,0.08,'triangle');clear();impact(x,ground-2,true);return;}
        if(age<180){const scale=1-age/400;e.setScale(1,scale).setY(ground-40*scale);}
        else {e.setScale(1).setTexture(frames.stomp).setY(ground-40+40*Phaser.Math.Clamp((age-450)/Math.max(1,config.sinkAnimationDuration-450),0,1));}
        const g=e.stars;g.clear().setAlpha(1-progress);
        for(let i=0;i<3;i++){const x=e.x-20+i*20,y=ground-36-Math.sin(state.clock/130+i)*5;g.fillStyle(0xffd453).fillRect(x-2,y-5,4,10).fillRect(x-5,y-2,10,4);}return;
      }
      if(e.phase==='exit'){
        const t=Phaser.Math.Clamp(age/config.exitDuration,0,1),opening=Phaser.Math.Clamp(t*2,0,1);
        e.door.clear().fillStyle(0x14222b).fillRect(458,ground-146,84,146).fillStyle(0x687b84)
          .fillRect(458,ground-146,42*(1-opening),146).fillRect(542-42*(1-opening),ground-146,42*(1-opening),146);
        e.setAlpha(Phaser.Math.Clamp((t-0.25)*2,0,1)).setY(ground-40-(1-t)*8);
        if(t>=1){if(Math.abs(scene.player.x-e.x)<60&&Math.abs(scene.player.body.bottom-ground)<110)e.setX(scene.player.x<500?560:440);e.door.destroy();e.door=null;e.setAlpha(1).setY(ground-40).setTexture(frames.idle);e.body.reset(e.x,ground-40);e.body.enable=true;e.body.setAllowGravity(true);e.phase='idle';}return;
      }
      if(e.speech){e.speech.setPosition(Phaser.Math.Clamp(e.x,135,825),e.body.top-16);if(state.clock>=e.speechUntil){e.speech.destroy();e.speech=null;}}
      speak(e,lines);
      if(e.snack){
        if(state.clock<e.eatingUntil){
          e.setVelocityX(0);e.setTexture(frames.block);e.phase='eat';
          e.snack.setPosition(e.x+(e.direction>0?13:-13),e.body.top+24+Math.floor(state.clock/180)%2*2);
          return;
        }
        e.snack.destroy();e.snack=null;
      }
      const food=[...scene.coffees.getChildren(),...scene.aidItems.getChildren(),...scene.colleague.items.getChildren()]
        .find(item=>item.active&&['coffee','colleague-coffee','hotdog'].includes(item.texture.key)&&Math.abs(item.x-e.x)<25&&Math.abs(item.y-e.body.bottom)<40);
      if(food){
        const key=food.texture.key;
        food.getData('steam')?.destroy();food.getData('label')?.destroy();food.destroy();
        e.snack=scene.add.image(e.x,e.body.top+25,key).setScale(.7).setDepth(24);
        e.eatingUntil=state.clock+config.eatDuration;e.setVelocityX(0);e.phase='eat';
        scene.popText(e.x,e.body.top-18,key==='hotdog'?'PÁREK SNĚDEN':'KÁVA VYPITA', '#ffe4a2',1800);
        return;
      }
      if(state.clock<e.blockUntil){e.setVelocityX(0);e.setTexture(frames.block);return;}
      if(e.x<=config.minX){e.direction=1;e.phase='idle';e.actionAt=state.clock+config.pauseDuration;e.setX(config.minX+1);}
      if(e.x>=config.maxX){e.direction=-1;e.phase='idle';e.actionAt=state.clock+config.pauseDuration;e.setX(config.maxX-1);}
      if(state.clock<e.actionAt){e.setVelocityX(0);e.setTexture(frames.idle);return;}
      const grounded=e.body.blocked.down||e.body.touching.down;
      const obstacles=[...scene.obstacles.getChildren(),...(scene.pacing?.carts||[]).map(c=>c.sprite)];
      const ahead=obstacles.some(o=>{
        const b=o.body;if(!o.active||!b?.enable)return false;
        const gap=e.direction>0?b.left-e.body.right:e.body.left-b.right;
        return gap>=-8&&gap<config.lookAhead&&b.top<e.body.bottom-5&&b.bottom>e.body.bottom-125&&e.body.bottom-b.top<125;
      });
      const blocked=e.direction>0?e.body.blocked.right:e.body.blocked.left;
      if(grounded&&(ahead||blocked)&&state.clock>=e.nextJump){e.setVelocityY(config.jumpVelocity);e.nextJump=state.clock+config.jumpCooldown;}
      e.phase='walk';e.setVelocityX(e.direction*config.walkSpeed).setFlipX(e.direction<0);
      e.setTexture(Math.floor(state.clock/240)%2?frames.walk:frames.idle);
      if(state.clock-e.lastFootstep>700){scene.tone(70,0.025,'triangle');e.lastFootstep=state.clock;}
    }
    scene.events.once('shutdown',()=>{clear();colliders.forEach(c=>c.destroy());group.destroy(true);});
    return {state,group,spawn,update,clear,configurePhysics,canStomp,intercept};
  }
  window.ITHeroOldBadger={config,lines,blockLines,art,preload,createTextures,create};
})();
