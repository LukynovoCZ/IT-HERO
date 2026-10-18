/* Pointer-based controls share game actions with the keyboard, including multiple fingers. */
(() => {
  'use strict';
  let preferred=null;
  function attach(scene){
    const panel=document.getElementById('touch-controls'),area=document.getElementById('play-area');
    if(!panel||!area)return null;
    const toggle=document.getElementById('touch-toggle'),toolbar=document.getElementById('touch-toolbar');
    const pause=document.getElementById('touch-pause'),sound=document.getElementById('touch-sound'),fullscreen=document.getElementById('touch-fullscreen');
    const hint=document.getElementById('touch-hint'),start=document.getElementById('game-action');
    const buttons=[...panel.querySelectorAll('[data-touch-action]')];
    const pointers=new Map(),pressed=new Set(),listeners=[];
    let enabled=preferred??(navigator.maxTouchPoints>0||matchMedia('(any-pointer: coarse)').matches),lastSync='',destroyed=false;
    const listen=(node,event,handler,options)=>{node.addEventListener(event,handler,options);listeners.push(()=>node.removeEventListener(event,handler,options));};
    const isDown=action=>[...pointers.values()].some(pointer=>pointer.action===action);
    function paint(){buttons.forEach(button=>{const held=isDown(button.dataset.touchAction);button.classList.toggle('held',held);button.setAttribute('aria-pressed',String(held));});}
    function release(id){
      const pointer=pointers.get(id);if(!pointer)return;
      pointers.delete(id);
      try{if(pointer.capture.hasPointerCapture(id))pointer.capture.releasePointerCapture(id);}catch(_){/* Already cancelled by the browser. */}
      paint();
    }
    function cancel(id){const pointer=pointers.get(id);release(id);if(pointer&&!isDown(pointer.action))pressed.delete(pointer.action);}
    function clear(){[...pointers.keys()].forEach(release);pressed.clear();}
    function sync(){
      if(destroyed)return;
      const key=[scene.gameState,scene.weapon,scene.isMuted,enabled,start?.hidden,start?.textContent].join('/');
      if(key===lastSync)return;lastSync=key;
      if(scene.gameState!=='playing')clear();
      buttons.forEach(button=>{button.disabled=scene.gameState!=='playing';});
      pause.disabled=!['playing','paused'].includes(scene.gameState);
      pause.textContent=scene.gameState==='paused'?'▶ Pokračovat':'|| Pauza';
      pause.dataset.paused=String(scene.gameState==='paused');
      sound.textContent=scene.isMuted?'Zvuk: vyp.':'Zvuk: zap.';
      sound.setAttribute('aria-pressed',String(!scene.isMuted));
      const retry=scene.gameState==='lose'&&scene.pacing?.state.checkpoint?'OBNOVIT ZÁLOHU':'ZNOVU';
      if(start&&!start.hidden){start.textContent=enabled?(scene.gameState==='menu'?'KLEPNI = HRÁT':scene.gameState==='paused'?'KLEPNI = POKRAČOVAT':`KLEPNI = ${retry}`):(scene.gameState==='menu'?'ENTER nebo kliknutí = HRÁT':scene.gameState==='paused'?'ESC / KLIK = POKRAČOVAT':`ENTER / R / KLIK = ${retry}`);}
    }
    function placeStart(){
      const canvas=scene.game.canvas.getBoundingClientRect(),shell=area.querySelector('.game-shell').getBoundingClientRect();
      start.style.left=`${canvas.left-shell.left+canvas.width*0.321}px`;
      start.style.top=`${canvas.top-shell.top+canvas.height*0.70}px`;
    }
    function refresh(){if(!destroyed){scene.scale.refresh();placeStart();}}
    scene.scale.on('resize',placeStart);listeners.push(()=>scene.scale.off('resize',placeStart));
    function mode(value){
      clear();enabled=value;panel.hidden=!enabled;toolbar.hidden=!enabled;hint.hidden=!enabled;
      document.body.classList.toggle('touch-layout',enabled);
      toggle.setAttribute('aria-expanded',String(enabled));toggle.textContent=enabled?'Skrýt dotykové ovládání':'Dotykové ovládání';
      lastSync='';sync();requestAnimationFrame(refresh);
    }
    listen(panel,'pointerdown',event=>{
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
    listen(document,'visibilitychange',()=>{clear();if(document.hidden&&scene.gameState==='playing')scene.togglePause();});
    function activate(button,handler){
      let touchAt=-Infinity;
      // A second finger may not produce a compatibility click; handle its release directly.
      listen(button,'pointerup',event=>{if(event.pointerType!=='touch'||button.disabled)return;event.preventDefault();touchAt=performance.now();handler();});
      listen(button,'click',event=>{if(event.detail!==0&&performance.now()-touchAt<650)return;handler();});
    }
    activate(toggle,()=>{preferred=!enabled;mode(preferred);});
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
    mode(enabled);
    const controller={get enabled(){return enabled;},isDown,justPressed(action){const result=pressed.has(action);pressed.delete(action);return result;},clear,sync,
      destroy(){destroyed=true;clear();listeners.forEach(remove=>remove());}};
    scene.events.once('shutdown',()=>controller.destroy());return controller;
  }
  window.ITHeroTouchControls={attach};
})();
