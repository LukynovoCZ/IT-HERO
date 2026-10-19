/* Local game commands. No eval, network requests or executable input. */
(()=>{'use strict';let current=null;
 function attach(scene){current=scene;let taps=0,last=0;
  const dialog=document.createElement('dialog');dialog.className='secret-console';dialog.innerHTML='<form><label for="console-code">KONZOLE</label><input id="console-code" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="40"><button>Provést</button><button type="button" data-close>Zavřít</button></form><p role="status"></p>';document.body.append(dialog);
  let pausedByUs=false,keyboard=true;
  function close(){if(!dialog.open)return;dialog.close();scene.input.keyboard.enabled=keyboard;scene.browserHeld?.clear();scene.browserPressed?.clear();if(pausedByUs&&scene.gameState==='paused')scene.togglePause();pausedByUs=false;}
  function open(){if(scene.outdoorVisit||dialog.open||window.ITHeroScores?.isOpen()||window.ITHeroEnding?.isRunning())return;keyboard=scene.input.keyboard.enabled;pausedByUs=scene.gameState==='playing';if(pausedByUs)scene.togglePause();scene.touchControls?.clear();scene.browserHeld?.clear();scene.browserPressed?.clear();scene.input.keyboard.enabled=false;dialog.showModal();dialog.querySelector('input').focus();}
  function command(value){const state=ITHeroAppearance.state,code=value.trim().toLowerCase();if(code==='iddqd'){state.god=!state.god;if(state.god){state.training=true;scene.registry.set('trainingRun',true);}return state.god?'NESMRTELNOST ZAPNUTA • TRÉNINK • SKÓRE SE NEZAPÍŠE':'NESMRTELNOST VYPNUTA • TATO HRA ZŮSTÁVÁ TRÉNINK';}if(code==='skodatonevidet'){state.original=!state.original;window.dispatchEvent(new Event('it-hero-appearance'));return state.original?'PŮVODNÍ VZHLED ZAPNUT':'VOLNÝ VZHLED ZAPNUT';}return 'Neznámý příkaz.';}
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();dialog.querySelector('[role=status]').textContent=command(dialog.querySelector('input').value);dialog.querySelector('input').value='';};dialog.querySelector('[data-close]').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const key=e=>{if(e.code==='Backquote'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)(dialog.open?close:open)();}else if(dialog.open){if(e.code==='Escape'){e.preventDefault();close();}e.stopPropagation();}};window.addEventListener('keydown',key,true);
  const badge=document.querySelector('.version');const tap=()=>{const now=Date.now();taps=now-last<800?taps+1:1;last=now;if(taps>=5){taps=0;open();}};badge?.addEventListener('pointerdown',tap);
  const hudTap=pointer=>{if(pointer.x<130&&pointer.y<54)tap();};scene.input.on('pointerdown',hudTap);
  scene.events.once('shutdown',()=>{window.removeEventListener('keydown',key,true);badge?.removeEventListener('pointerdown',tap);scene.input.off('pointerdown',hudTap);dialog.remove();if(current===scene)current=null;});
  return {open,close,command};
 }
 window.ITHeroConsole={attach};
})();
