/* Pointer-based controls share game actions with the keyboard, including multiple fingers. */
(() => {
  'use strict';
  let preferred=null;
  let movementMode='stick';
  const stickConfig={radius:46,deadZone:.25,downThreshold:.52,upThreshold:.52,downDominance:1.1};
  function attach(scene){
    const panel=document.getElementById('touch-controls'),area=document.getElementById('play-area');
    if(!panel||!area)return null;
    const toggle=document.getElementById('touch-toggle'),toolbar=document.getElementById('touch-toolbar');
    const pause=document.getElementById('touch-pause'),sound=document.getElementById('touch-sound'),fullscreen=document.getElementById('touch-fullscreen');
    const hint=document.getElementById('touch-hint'),start=document.getElementById('game-action');
    const modeButton=document.getElementById('touch-mode'),stickZone=document.getElementById('touch-stick-zone');
    const stickBase=document.getElementById('touch-stick-base');
    const buttons=[...panel.querySelectorAll('[data-touch-action]')];
    const pointers=new Map(),pressed=new Set(),listeners=[];
    let enabled=preferred??(navigator.maxTouchPoints>0||matchMedia('(any-pointer: coarse)').matches),lastSync='',destroyed=false;
    const listen=(node,event,handler,options)=>{node.addEventListener(event,handler,options);listeners.push(()=>node.removeEventListener(event,handler,options));};
    const activeState=()=>scene.outdoorVisit?.scene?.gameState||scene.gameState;
    const holds=(pointer,action)=>pointer.actions?pointer.actions.has(action):pointer.action===action;
    const isDown=action=>[...pointers.values()].some(pointer=>holds(pointer,action));
    function resetStick(){
      if(!stickZone)return;
      stickZone.dataset.active='false';stickBase.style.left='50%';stickBase.style.top='50%';
      stickBase.style.setProperty('--stick-dx','0px');stickBase.style.setProperty('--stick-dy','0px');
    }
    function moveStick(pointer,event){
      const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y,distance=Math.hypot(dx,dy);
      const scale=distance>stickConfig.radius?stickConfig.radius/distance:1;
      stickBase.style.setProperty('--stick-dx',`${dx*scale}px`);stickBase.style.setProperty('--stick-dy',`${dy*scale}px`);
      const actions=new Set(),threshold=stickConfig.radius*stickConfig.deadZone;
      // A mostly vertical pull is down only, so stairs/HDD do not cause horizontal drift.
      const down=dy>stickConfig.radius*stickConfig.downThreshold;
      if(Math.abs(dx)>threshold&&!(down&&dy>Math.abs(dx)*stickConfig.downDominance))actions.add(dx<0?'left':'right');
      if(down)actions.add('crouch');
      if(dy < -stickConfig.radius*stickConfig.upThreshold)actions.add('jump');
      for(const action of actions)if(!isDown(action))pressed.add(action);
      pointer.actions=actions;paint();
    }
    function paint(){buttons.forEach(button=>{const held=isDown(button.dataset.touchAction);button.classList.toggle('held',held);button.setAttribute('aria-pressed',String(held));});}
    function release(id){
      const pointer=pointers.get(id);if(!pointer)return;
      pointers.delete(id);
      if(pointer.kind==='stick')resetStick();
      try{if(pointer.capture.hasPointerCapture(id))pointer.capture.releasePointerCapture(id);}catch(_){/* Already cancelled by the browser. */}
      paint();
    }
    function cancel(id){const pointer=pointers.get(id);release(id);for(const action of pointer?.actions||[pointer?.action])if(!isDown(action))pressed.delete(action);}
    function clear(){[...pointers.keys()].forEach(release);pressed.clear();}
    function sync(){
      if(destroyed)return;
      const key=[activeState(),scene.weapon,scene.isMuted,enabled,start?.hidden,start?.textContent].join('/');
      if(key===lastSync)return;lastSync=key;
      if(activeState()!=='playing')clear();
      stickZone?.setAttribute('aria-disabled',String(activeState()!=='playing'));
      buttons.forEach(button=>{button.disabled=activeState()!=='playing';});
      pause.disabled=!['playing','paused'].includes(activeState());
      pause.textContent=activeState()==='paused'?'▶ Pokračovat':'|| Pauza';
      pause.dataset.paused=String(activeState()==='paused');
      sound.textContent=scene.isMuted?'Zvuk: vyp.':'Zvuk: zap.';
      sound.setAttribute('aria-pressed',String(!scene.isMuted));
      const retry=activeState()==='lose'&&scene.pacing?.state.checkpoint?'OBNOVIT ZÁLOHU':'ZNOVU';
      if(start&&!start.hidden){start.textContent=enabled?(activeState()==='menu'?'KLEPNI = HRÁT':activeState()==='paused'?'KLEPNI = POKRAČOVAT':`KLEPNI = ${retry}`):(activeState()==='menu'?'ENTER nebo kliknutí = HRÁT':activeState()==='paused'?'ESC / KLIK = POKRAČOVAT':`ENTER / R / KLIK = ${retry}`);}
    }
    function placeStart(){
      const canvas=scene.game.canvas.getBoundingClientRect(),shell=area.querySelector('.game-shell').getBoundingClientRect();
      start.style.left=`${canvas.left-shell.left+canvas.width*0.321}px`;
      start.style.top=`${canvas.top-shell.top+canvas.height*0.70}px`;
    }
    function refresh(){if(!destroyed){scene.scale.refresh();placeStart();}}
    function setMovementMode(value){
      clear();movementMode=stickZone?value:'buttons';panel.dataset.movement=movementMode;
      document.body.classList.toggle('touch-stick-layout',enabled&&movementMode==='stick');
      if(modeButton){
        modeButton.textContent=movementMode==='stick'?'Ovládání: palec':'Ovládání: tlačítka';
        modeButton.dataset.mode=movementMode;
        modeButton.setAttribute('aria-label',movementMode==='stick'?'Přepnout na směrová tlačítka':'Přepnout na ovladač pod palcem');
      }
      if(hint)hint.textContent=movementMode==='stick'?'Polož levý palec na ovladač a táhni vlevo nebo vpravo. Tažení nahoru = skok, dolů = skrčení, schody a odpojení HDD. Napravo je pouze střelba. Nejlépe na šířku.':'Drž ▼ pro skrčení; u schodů přejdeš dál a u HDD odpojíš disk. Pohyb, skok a střelbu můžeš kombinovat.';
      resetStick();requestAnimationFrame(refresh);
    }
    scene.scale.on('resize',placeStart);listeners.push(()=>scene.scale.off('resize',placeStart));
    function mode(value){
      clear();enabled=value;panel.hidden=!enabled;toolbar.hidden=!enabled;hint.hidden=!enabled;
      document.body.classList.toggle('touch-layout',enabled);
      document.body.classList.toggle('touch-stick-layout',enabled&&movementMode==='stick');
      toggle.setAttribute('aria-expanded',String(enabled));toggle.textContent=enabled?'Skrýt dotykové ovládání':'Dotykové ovládání';
      lastSync='';sync();requestAnimationFrame(refresh);
    }
    listen(panel,'pointerdown',event=>{
      if(stickZone?.contains(event.target)){
        if(!enabled||movementMode!=='stick'||activeState()!=='playing'||event.button!==0||[...pointers.values()].some(p=>p.kind==='stick'))return;
        event.preventDefault();event.stopPropagation();
        const r=stickZone.getBoundingClientRect(),pointer={kind:'stick',capture:stickZone,x:event.clientX,y:event.clientY,actions:new Set()};
        pointers.set(event.pointerId,pointer);stickZone.setPointerCapture(event.pointerId);
        stickBase.style.left=`${event.clientX-r.left}px`;stickBase.style.top=`${event.clientY-r.top}px`;stickZone.dataset.active='true';
        moveStick(pointer,event);return;
      }
      const button=event.target.closest('[data-touch-action]');
      if(!button||button.disabled||event.button!==0||!enabled)return;
      event.preventDefault();event.stopPropagation();
      const action=button.dataset.touchAction;
      if(!isDown(action))pressed.add(action);
      pointers.set(event.pointerId,{action,capture:button});
      button.setPointerCapture(event.pointerId);paint();
    },{passive:false});
    listen(panel,'pointermove',event=>{
      const pointer=pointers.get(event.pointerId);if(!pointer)return;
      event.preventDefault();
      if(pointer.kind==='stick'){moveStick(pointer,event);return;}
      const button=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-touch-action]');
      if(!button||!panel.contains(button)||button.disabled){cancel(event.pointerId);return;}
      if(button.dataset.touchAction!==pointer.action){pointer.action=button.dataset.touchAction;pressed.add(pointer.action);paint();}
    },{passive:false});
    listen(document,'pointerup',event=>release(event.pointerId));
    listen(document,'pointercancel',event=>cancel(event.pointerId));
    listen(panel,'lostpointercapture',event=>cancel(event.pointerId));
    const keyboardIds={Space:-1,Enter:-2,NumpadEnter:-3};
    listen(window,'keydown',event=>{
      const control=event.target.closest?.('button,a');
      if(!control||!(event.code in keyboardIds))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(event.repeat||control.disabled)return;
      if(control.dataset.touchAction){
        const action=control.dataset.touchAction;if(!isDown(action))pressed.add(action);
        pointers.set(keyboardIds[event.code],{action,capture:control});paint();
      }else control.click();
    },{capture:true});
    listen(window,'keyup',event=>{if(event.code in keyboardIds)release(keyboardIds[event.code]);},{capture:true});
    listen(window,'blur',clear);
    listen(window,'resize',()=>{clear();requestAnimationFrame(refresh);});
    listen(document,'visibilitychange',()=>{clear();if(document.hidden&&activeState()==='playing')scene.togglePause();});
    function activate(button,handler){
      let touchAt=-Infinity;
      // A second finger may not produce a compatibility click; handle its release directly.
      listen(button,'pointerup',event=>{if(event.pointerType!=='touch'||button.disabled)return;event.preventDefault();touchAt=performance.now();handler();});
      listen(button,'click',event=>{if(event.detail!==0&&performance.now()-touchAt<650)return;handler();});
    }
    activate(toggle,()=>{preferred=!enabled;mode(preferred);});
    if(modeButton)activate(modeButton,()=>setMovementMode(movementMode==='stick'?'buttons':'stick'));
    activate(pause,()=>{clear();scene.togglePause();sync();});
    const unlockAudio=()=>{if(!scene.isMuted&&scene.audioCtx?.state==='suspended')scene.audioCtx.resume().catch(()=>{});};
    listen(area,'pointerdown',unlockAudio,{capture:true});
    activate(sound,()=>{scene.isMuted=!scene.isMuted;unlockAudio();sync();});
    fullscreen.hidden=!document.fullscreenEnabled||!area.requestFullscreen;
    activate(fullscreen,async()=>{
      clear();try{if(document.fullscreenElement)await document.exitFullscreen();else await area.requestFullscreen();}
      catch(_){if(!destroyed)hint.textContent='Celou obrazovku tady prohlížeč nepovolil.';}
    });
    listen(document,'fullscreenchange',()=>{clear();fullscreen.textContent=document.fullscreenElement?'Zmenšit':'[ ] Celá obrazovka';requestAnimationFrame(refresh);});
    setMovementMode(movementMode);mode(enabled);
    const controller={get enabled(){return enabled;},get movementMode(){return movementMode;},stickConfig,isDown,justPressed(action){const result=pressed.has(action);pressed.delete(action);return result;},clear,sync,
      destroy(){destroyed=true;clear();listeners.forEach(remove=>remove());}};
    scene.events.once('shutdown',()=>controller.destroy());return controller;
  }
  window.ITHeroTouchControls={attach};
})();
