/* SAP miniboss: tunable range attacks, cancellable windups and a small HUD. */
(() => {
  'use strict';
  const config = {
    meleeRange: 76, helmetRange: 250, range: 460, windup: 450,
    meleeDamage: 2, meleeCooldown: 2100, helmetCooldown: 1700, penCooldown: 2400,
    helmetSpeed: 220, helmetGravity: 330, helmetLifetime: 1800,
    penSpeed: 410, penGap: 150, penLifetime: 1150, quoteInterval: 6500
  };
  const quotes = window.ITHeroDialogue.lines('sap_integrator','combat');
  const profile = {
    id:'sap_integrator',name:'ŠÉF SAP',enabled:true,behavior:'sap',health:8,speed:32,
    patrol:65,attackRange:460,attackInterval:1750,attackType:'sap',damage:1,score:500,
    contactPose:'melee',attackPose:'ranged',frameWidth:112,frameHeight:80,renderHeight:68,
    body:{width:22,height:66,x:45,y:14},projectiles:[{key:'sap-helmet'},{key:'sap-pen'}],
    art:{path:'assets/characters/sap_integrator.png',poses:{idle:[130,82,340,778],walk:[130,82,340,778],melee:[580,20,480,840],ranged:[1200,145,530,715],hit:[130,82,340,778],defeat:[130,82,340,778]},anchors:{idle:{x:170,y:778},walk:{x:170,y:778},melee:{x:250,y:840},ranged:{x:260,y:715},hit:{x:170,y:778},defeat:{x:170,y:778}},facing:{idle:'left',walk:'left',melee:'left',ranged:'right',hit:'left',defeat:'left'}}
  };
  function textures(scene) {
    const make=(key,w,h,draw)=>{if(scene.textures.exists(key))return;const g=scene.make.graphics({add:false});draw(g);g.generateTexture(key,w,h);g.destroy();};
    make('sap-helmet',28,22,g=>{
      g.fillStyle(0x172331).fillEllipse(14,10,27,19);
      g.fillStyle(0xc5d5dc).fillEllipse(14,9,23,15);
      g.fillStyle(0x7bc64e).fillRect(5,6,4,8).fillRect(20,6,3,8);
      g.fillStyle(0x26394a).fillRect(11,3,3,10).fillRect(16,4,3,9);
      g.lineStyle(2,0x172331).beginPath().moveTo(6,16).lineTo(14,21).lineTo(23,15).strokePath();
    });
    make('sap-pen',28,8,g=>{
      g.fillStyle(0x10294c).fillRect(3,2,22,5);
      g.fillStyle(0x2877e2).fillRect(5,2,17,3);
      g.fillStyle(0xd2e8ee).fillTriangle(0,4,6,1,6,7).fillRect(18,1,7,1);
    });
  }
  function cancel(e) {
    (e.sapTimers||[]).forEach(timer=>timer.remove(false));e.sapTimers=[];
    e.sapEffect?.destroy();e.sapEffect=null;e.sapBusy=false;
  }
  function valid(scene,e) {return e.active&&!e.defeated&&e.floorIndex===scene.floor&&scene.gameState==='playing'&&!scene.transitioning;}
  function later(scene,e,delay,fn) {
    e.sapTimers ||= [];
    const timer=scene.time.delayedCall(delay,()=>{
      e.sapTimers=(e.sapTimers||[]).filter(item=>item!==timer);
      if(!valid(scene,e)||scene.time.now<e.hitUntil){cancel(e);return;}
      fn();
    });
    e.sapTimers.push(timer);
  }
  function fire(scene,e,type,direction) {
    textures(scene);
    const helmet=type==='helmet', c=e.profile.combat;
    const shot=scene.enemyShots.create(e.x+direction*29,e.body.bottom-34,helmet?'sap-helmet':'sap-pen').setDepth(26);
    shot.setFlipX(direction>0).setVelocity(direction*(helmet?c.helmetSpeed:c.penSpeed),helmet?-115:0);
    shot.body.setAllowGravity(false);
    if(helmet) {shot.body.setAllowGravity(true);shot.body.setGravityY(c.helmetGravity-scene.physics.world.gravity.y);}
    shot.setAngularVelocity(direction*(helmet?270:100));
    shot.body.setSize(helmet?22:21,helmet?15:5,true);
    shot.setData('floor',e.floorIndex).setData('damage',1).setData('expires',scene.time.now+(helmet?c.helmetLifetime:c.penLifetime));
  }
  function attack(scene,e,pose,forced) {
    if(!valid(scene,e)||e.sapBusy||scene.time.now<(e.sapNextAttack||0)||scene.time.now<e.hitUntil)return;
    const c=e.profile.combat, distance=Math.abs(scene.player.x-e.x);
    if(distance>c.range||Math.abs(scene.player.body.bottom-e.body.bottom)>100)return;
    const type=forced||(distance<=c.meleeRange?'melee':distance<=c.helmetRange?'helmet':'pens');
    const direction=scene.player.x>=e.x?1:-1;e.facingDirection=direction;e.sapBusy=true;
    e.sapNextAttack=scene.time.now+(type==='melee'?c.meleeCooldown:type==='helmet'?c.helmetCooldown:c.penCooldown);
    e.setVelocityX(0);e.setAngle(0);pose(e,type==='melee'?'melee':'ranged');
    e.poseUntil=scene.time.now+c.windup+(type==='pens'?c.penGap*2:150);
    if(type==='melee') {
      e.sapEffect=scene.add.graphics().setDepth(27);
      e.sapEffect.lineStyle(3,0xffd465).lineBetween(e.x+direction*16,e.body.bottom-35,e.x+direction*23,e.body.bottom-70);
      later(scene,e,c.windup,()=>{
        const g=e.sapEffect;g?.clear().lineStyle(4,0xb9cfdb).lineBetween(e.x+direction*12,e.body.bottom-27,e.x+direction*c.meleeRange,e.body.bottom-27);
        g?.lineStyle(5,0x23394b).lineBetween(e.x+direction*(c.meleeRange-5),e.body.bottom-34,e.x+direction*(c.meleeRange-5),e.body.bottom-20);
        const dx=scene.player.x-e.x, feet=scene.player.body.bottom;
        if(dx*direction>=-8&&Math.abs(dx)<=c.meleeRange&&feet>e.body.bottom-35&&scene.player.body.top<e.body.bottom-15)scene.takeDamage(e.x,c.meleeDamage);
        scene.tone(120,0.1,'triangle');
      });
    } else if(type==='helmet')later(scene,e,c.windup,()=>fire(scene,e,'helmet',direction));
    else for(let i=0;i<3;i++)later(scene,e,c.windup+i*c.penGap,()=>fire(scene,e,'pen',direction));
    later(scene,e,c.windup+(type==='pens'?c.penGap*2:0)+180,()=>{e.sapBusy=false;e.sapEffect?.destroy();e.sapEffect=null;});
  }
  function hud(scene,e,visible) {
    if(!e.sapHud) {
      e.sapHud=scene.add.container(300,58).setScrollFactor(0).setDepth(85);
      e.sapBar=scene.add.graphics();
      e.sapLabel=scene.add.text(8,3,'',{fontFamily:'monospace',fontSize:'12px',color:'#ffffff'});
      e.sapHud.add([e.sapBar,e.sapLabel]);
    }
    e.sapHud.setVisible(visible);
    if(!visible)return;
    e.sapBar.clear().fillStyle(0x11283a).fillRect(0,0,360,34).fillStyle(0x394950).fillRect(8,22,344,7).fillStyle(0x9ee766).fillRect(8,22,344*Math.max(0,e.hp)/e.profile.health,7);
    e.sapLabel.setText(`ŠÉF SAP – GLOBÁLNÍ INTEGRÁTOR   ${e.hp}/${e.profile.health}`);
  }
  function update(scene,e,time,pose) {
    const active=valid(scene,e);hud(scene,e,active);
    if(!active){cancel(e);e.sapIntro?.destroy();e.sapIntro=null;e.setVelocityX(0);return;}
    if(!e.sapIntroduced){
      e.sapIntroduced=true;e.sapNextAttack=time+1600;
      const text=scene.add.text(480,107,'ŠÉF SAP – GLOBÁLNÍ INTEGRÁTOR\nSvětová řešení. Lokální problémy.',{fontFamily:'monospace',fontSize:'16px',color:'#dcf6a2',align:'center',backgroundColor:'#102b28',padding:{x:12,y:8}}).setOrigin(0.5,0).setScrollFactor(0).setDepth(86);
      e.sapIntro=text;scene.time.delayedCall(3200,()=>{text.destroy();if(e.sapIntro===text)e.sapIntro=null;});
      e.sapNextQuote=time+config.quoteInterval;
    }
    if(time<e.hitUntil){e.setVelocityX(0);pose(e,'hit');return;}
    if(time>e.sapNextQuote&&Math.abs(scene.player.x-e.x)<450){scene.popText(e.x,e.y-55,Phaser.Utils.Array.GetRandom(quotes),'#b6efca');e.sapNextQuote=time+config.quoteInterval+Math.random()*2500;}
    if(e.sapBusy){e.setVelocityX(0);return;}
    const distance=Math.abs(scene.player.x-e.x);
    if(distance<110&&time<e.sapNextAttack-650){e.direction=scene.player.x>e.x?-1:1;}
    else {if(e.x<e.baseX-e.patrol)e.direction=1;if(e.x>e.baseX+e.patrol)e.direction=-1;}
    if(e.x<100)e.direction=1;if(e.x>860)e.direction=-1;
    e.facingDirection=e.direction;e.setVelocityX(e.direction*e.profile.speed);
    pose(e,Math.floor(time/180)%2?'walk':'idle');
    e.setAngle(Math.sin(time/110)*1.2);
    attack(scene,e,pose);
  }
  profile.combat=config;
  ITHeroEnemyCatalog.profiles.sap_integrator=profile;
  ITHeroEnemyCatalog.placements.push({id:'sap_integrator',floor:5,x:650});
  window.ITHeroSAP={profile,config,quotes,textures,update,attack,cancel,
    defeat(scene,e){cancel(e);e.sapHud?.destroy();e.sapIntro?.destroy();},
    hit(scene,e){cancel(e);e.sapNextAttack=Math.max(e.sapNextAttack||0,scene.time.now+650);}
  };
})();
