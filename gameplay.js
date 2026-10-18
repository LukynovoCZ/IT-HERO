/* Tunable pacing, checkpoint and finale. All times are active play milliseconds. */
(() => {
  'use strict';
  const config={windup:400,trioWindup:500,checkpointFloor:5,bonusWindow:360000,maxTimeBonus:1200,
    disconnectDuration:1200,finalWarning:900,finalShotGap:230,finalRecovery:900};
  const routes=[
    {floor:2,bridges:[{x:430,rise:96,width:112},{x:550,rise:96,width:112}]},
    {floor:3,cart:{min:440,max:525,speed:30}},
    {floor:4,bridges:[{x:425,rise:96,width:120},{x:555,rise:96,width:120}],door:{x:620,period:4400,closed:1400}},
    {floor:7,bridges:[{x:430,rise:96,width:120},{x:560,rise:96,width:120}],door:{x:620,period:4600,closed:1400}},
    {floor:8,cart:{min:480,max:550,speed:24}}
  ];
  const checkpointKey='missionCheckpoint';
  const keyOf=e=>`${e.kind}/${e.floorIndex}/${e.baseX}`;
  function formatTime(ms){const total=Math.floor(ms/1000);return `${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toString().padStart(2,'0')}`;}
  function create(scene,floors,resume=false){
    const warnings=new Map(),carts=[],doors=[],bridges=[];
    const saved=scene.registry.get(checkpointKey);
    const state={elapsed:resume&&saved?saved.elapsed:0,checkpoint:!!saved,phase:'locked',finalElapsed:0,finalShots:0,disconnect:0,defeated:new Set(resume&&saved?saved.defeated:[])};
    const hud=scene.add.text(16,523,'',{font:'12px monospace',color:'#b9d8b9'}).setScrollFactor(0).setDepth(104);
    const checkpointHud=scene.add.text(944,523,'',{font:'12px monospace',color:'#a4e963'}).setOrigin(1,0).setScrollFactor(0).setDepth(104);
    const objective=scene.add.text(480,438,'',{font:'bold 14px monospace',color:'#f4e3a2',backgroundColor:'#15382e',padding:{x:8,y:5},align:'center'}).setOrigin(.5).setScrollFactor(0).setDepth(105).setVisible(false);
    const progress=scene.add.graphics().setScrollFactor(0).setDepth(106);
    // Flat metal service platforms provide an optional upper route over desks.
    for(const route of routes){
      const floor=route.floor-1,ground=floors[floor];
      for(const spec of route.bridges||[]){
        const bridge=scene.addStatic(scene.platforms,spec.x,ground-spec.rise,spec.width,8,0xc8c9b9,12);
        bridge.body.checkCollision.down=false;bridge.body.checkCollision.left=false;bridge.body.checkCollision.right=false;
        bridge.setData('serviceBridge',true);bridges.push(bridge);
        const g=scene.add.graphics().setDepth(13);g.fillStyle(0x475e58).fillRect(spec.x-spec.width/2,ground-spec.rise+4,spec.width,4);
        for(let x=spec.x-spec.width/2+8;x<spec.x+spec.width/2;x+=20)g.fillStyle(0x91b5a3).fillRect(x,ground-spec.rise-1,9,2);
      }
      if(route.bridges)scene.add.text(490,ground-117,'SERVISNÍ LÁVKA',{font:'bold 9px monospace',color:'#d7e3c9',backgroundColor:'#253e34',padding:{x:4,y:2}}).setOrigin(.5).setDepth(14);
      if(route.cart){
        if(!scene.textures.exists('service-cart')){
          const g=scene.make.graphics({add:false});g.fillStyle(0x25322f).fillRect(0,6,64,32);g.fillStyle(0x858d89).fillRect(3,8,58,24);g.fillStyle(0xf1eedb).fillRect(0,4,64,5);
          for(let x=8;x<58;x+=12)g.fillStyle(x%24?0x276b50:0xc7b57a).fillRect(x,0,8,4);
          g.fillStyle(0x101d23).fillRect(8,35,10,7).fillRect(46,35,10,7);g.fillStyle(0x9baca8).fillRect(11,37,4,3).fillRect(49,37,4,3);
          g.generateTexture('service-cart',64,42);g.destroy();
        }
        const cart=scene.physics.add.image(route.cart.min,ground-21,'service-cart').setImmovable(true).setDepth(15);
        cart.body.setAllowGravity(false);cart.body.setSize(64,38);cart.body.pushable=false;
        scene.physics.add.collider(scene.player,cart);scene.physics.add.collider(scene.enemies,cart);
        scene.physics.add.collider(scene.playerShots,cart,shot=>shot.destroy());scene.physics.add.collider(scene.enemyShots,cart,shot=>shot.destroy());
        carts.push({sprite:cart,floor,...route.cart,direction:1});
      }
      if(route.door){
        const spec=route.door,body=scene.addStatic(scene.obstacles,spec.x,ground-45,18,90,0x718a81,16);
        const glass=scene.add.rectangle(spec.x,ground-48,10,76,0xa9c4b3,.7).setDepth(17);
        const lamp=scene.add.rectangle(spec.x,ground-103,22,5,0x94df63).setDepth(17);
        scene.add.text(spec.x,ground-123,'DVEŘE',{font:'bold 8px monospace',color:'#dcebd1'}).setOrigin(.5).setDepth(17);
        doors.push({body,glass,lamp,floor,...spec});
      }
    }
    // The external HDD sits on its own small desk beside the director's exit.
    const ground=floors[8],hddX=scene.doors[8].x;
    scene.addStatic(scene.obstacles,hddX,ground-15,64,30,0x7b8680,18);
    const art=scene.add.graphics().setDepth(18);
    art.fillStyle(0x7b8680).fillRect(hddX-32,ground-31,64,31).fillStyle(0xf1eedb).fillRect(hddX-36,ground-36,72,7);
    art.lineStyle(3,0x142a28).lineBetween(hddX+6,ground-44,hddX+22,ground-44).lineBetween(hddX+22,ground-44,hddX+22,ground-58);
    art.fillStyle(0x182c36).fillRect(hddX-20,ground-51,30,14).fillStyle(0x66888a).fillRect(hddX-17,ground-48,24,2).fillStyle(0xa4e963).fillRect(hddX+3,ground-43,3,3);
    const hddLabel=scene.add.text(hddX,ground-78,'EXTERNÍ HDD',{font:'bold 10px monospace',color:'#a4e963',backgroundColor:'#193e31',padding:{x:4,y:3}}).setOrigin(.5).setDepth(20);
    const clearWarning=e=>{const pending=warnings.get(e);pending?.label.destroy();warnings.delete(e);if(e.active)e.setAngle(0);};
    const manager={state,carts,doors,bridges,config,
      reserved(x,floor,radius=20){return carts.some(cart=>cart.floor===floor&&x+radius>cart.min-32&&x-radius<cart.max+32);},
      timeBonus(){return Math.max(0,Math.floor(config.maxTimeBonus*(1-state.elapsed/config.bonusWindow)));},
      formatTime:()=>formatTime(state.elapsed),
      isWinding:e=>warnings.has(e),cancel:clearWarning,
      queue(e,fire,pose){
        if(warnings.has(e)||!e.active||e.defeated||scene.gameState!=='playing'||scene.transitioning||e.floorIndex!==scene.floor)return;
        const label=scene.add.text(e.x,e.body.top-18,'!',{font:'bold 22px monospace',color:'#ffda69',stroke:'#172b28',strokeThickness:4}).setOrigin(.5).setDepth(110);
        warnings.set(e,{remaining:e.profile?config.trioWindup:config.windup,label,fire,floor:e.floorIndex});
        e.setVelocityX(0);e.setAngle(scene.player.x>=e.x?-7:7);if(!e.profile)e.setFlipX(scene.player.x<e.x);pose?.();
      },
      recordDefeat(e){state.defeated.add(keyOf(e));},
      checkpoint(){
        if(state.checkpoint)return;
        const snapshot={floor:config.checkpointFloor-1,score:scene.score,weapon:scene.weapon,elapsed:state.elapsed,
          defeated:[...state.defeated]};
        scene.registry.set(checkpointKey,snapshot);state.checkpoint=true;
        scene.posters.showMessage('ZÁLOHA ULOŽENA • 5. PATRO\nPo smrti pokračuješ odsud s plným zdravím.',7000);
      },
      retainElapsed(){const cp=scene.registry.get(checkpointKey);if(cp)cp.elapsed=state.elapsed;},
      restore(){
        if(!resume||!saved)return false;
        scene.floor=saved.floor;scene.score=saved.score;scene.weapon=saved.weapon;scene.energy=scene.maxEnergy;
        for(const e of scene.enemies.getChildren().slice()){
          if(e.floorIndex<saved.floor||saved.defeated.includes(keyOf(e))){if(e.kind==='sap_integrator')window.ITHeroSAP.cancel(e);e.destroy();}
        }
        scene.player.body.reset(saved.floor%2?872:88,floors[saved.floor]-40);scene.player.setVelocity(0,0);
        scene.lastHit=scene.time.now;scene.physics.world.resume();scene.gameState='playing';scene.hideOverlay();
        scene.posters.showMessage('OBNOVENO ZE ZÁLOHY • 5. PATRO',5000);return true;
      },
      interrupt(){state.disconnect=0;},
      requestDisconnect(){if(scene.floor===8)scene.promptText.setText(scene.touchControls?.enabled?'PODRŽ ▼ U HDD':'PODRŽ S / ↓ NEBO E U HDD');},
      tick(delta){
        const active=scene.gameState==='playing'&&!scene.transitioning;
        if(active)state.elapsed+=delta;
        for(const [e,pending] of warnings){
          if(!e.active||e.defeated||scene.floor!==pending.floor||scene.transitioning||['lose','win'].includes(scene.gameState)){clearWarning(e);continue;}
          pending.label.setVisible(active).setPosition(e.x,e.body.top-18);
          if(!active)continue;
          e.setVelocityX(0);pending.remaining-=delta;
          if(pending.remaining<=0){clearWarning(e);if(Math.abs(scene.player.body.bottom-e.body.bottom)<130)pending.fire();}
        }
        for(const cart of carts){
          if(!active||cart.floor!==scene.floor){cart.sprite.setVelocityX(0);continue;}
          if(cart.sprite.x>=cart.max)cart.direction=-1;if(cart.sprite.x<=cart.min)cart.direction=1;
          cart.sprite.setVelocityX(cart.speed*cart.direction);
        }
        for(const door of doors){
          if(!active)continue;
          const closed=state.elapsed%door.period<door.closed;
          const occupied=[scene.player,...scene.enemies.getChildren()].some(e=>e.active&&e.body?.enable&&e.body.left<door.body.body.right-1&&e.body.right>door.body.body.left+1&&e.body.bottom>door.body.body.top&&e.body.top<door.body.body.bottom);
          const enabled=closed&&!occupied;
          door.body.body.enable=enabled;door.body.setAlpha(enabled?1:.18);door.glass.setAlpha(enabled?.7:.12);
          door.lamp.setFillStyle(enabled?0xe49355:state.elapsed%door.period>door.period-650?0xffdc6c:0x94df63);
        }
        hud.setText(`ČAS ${formatTime(state.elapsed)}  •  BONUS +${manager.timeBonus()}`);
        checkpointHud.setText(state.checkpoint?'ZÁLOHA: 5. PATRO ✓':'');
        const show=scene.gameState==='playing'&&!scene.posters.tooltip.visible;hud.setVisible(show);checkpointHud.setVisible(show);
        if(!active){objective.setVisible(false);progress.clear();}
      },
      objective(delta,{held,moving,grounded}){
        objective.setVisible(false);progress.clear();
        if(scene.floor!==8||scene.gameState!=='playing'||scene.transitioning){state.disconnect=0;return;}
        const near=Math.abs(scene.player.x-hddX)<74&&Math.abs(scene.player.body.bottom-ground)<65;
        const bossAlive=scene.enemies.getChildren().some(e=>e.active&&e.floorIndex===8&&e.kind==='manager'&&e.hp>0);
        if(bossAlive){state.disconnect=0;if(near)objective.setText('HDD HLÍDÁ ŠÉF • NEJDŘÍV HO PORAZ').setVisible(true);return;}
        if(state.phase==='locked'&&!near)return;
        if(state.phase==='locked'){state.phase='lastBurst';state.finalElapsed=0;scene.enemyShots.clear(true,true);}
        if(state.phase==='lastBurst'){
          state.finalElapsed+=delta;
          objective.setText('POSLEDNÍ SALVA!\n↑ PŘESKOČ ZLATÉ KARTY').setVisible(true);
          while(state.finalShots<3&&state.finalElapsed>=config.finalWarning+state.finalShots*config.finalShotGap){
            const shot=scene.enemyShots.create(690,ground-28,'gold-card').setDepth(26).setScale(1.5);
            shot.body.setAllowGravity(false);shot.setVelocityX(260).setAngularVelocity(300);
            shot.setData('floor',8).setData('damage',1).setData('expires',scene.time.now+1800);state.finalShots++;
          }
          if(state.finalElapsed>=config.finalWarning+2*config.finalShotGap+config.finalRecovery)state.phase='ready';
          return;
        }
        if(!near){state.disconnect=0;return;}
        const key=scene.touchControls?.enabled?'▼':'S / ↓ nebo E';
        objective.setText(`PODRŽ ${key} • ODPOJIT HDD`).setVisible(true);
        if(!held||moving||!grounded){state.disconnect=0;return;}
        state.disconnect+=delta;
        progress.fillStyle(0x18332b).fillRect(350,461,260,8).fillStyle(0xa4e963).fillRect(350,461,260*Math.min(1,state.disconnect/config.disconnectDuration),8);
        if(state.disconnect>=config.disconnectDuration){hddLabel.setText('HDD ODPOJEN');scene.finishMission(manager.timeBonus(),formatTime(state.elapsed));scene.registry.remove(checkpointKey);state.checkpoint=false;objective.setVisible(false);progress.clear();}
      },
      destroy(){for(const e of [...warnings.keys()])clearWarning(e);}
    };
    scene.events.once('shutdown',()=>manager.destroy());return manager;
  }
  window.ITHeroGameplay={config,routes,create,checkpointKey,formatTime};
})();
