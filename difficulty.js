/* Campaign difficulty stays fixed until the player returns to the menu. */
(()=>{'use strict';
 let active=null;
 const state={selected:'normal'},easy=s=>s?.difficulty==='easy';
 function sync(s){const p=document.getElementById('difficulty-choice');if(!p)return;p.hidden=s.gameState!=='menu';p.disabled=s.gameState!=='menu';for(const i of p.querySelectorAll('input'))i.checked=i.value===state.selected;}
 function attach(s,resume){s.difficulty=resume?s.registry.get('campaignDifficulty')||'normal':state.selected;
  const p=document.getElementById('difficulty-choice');const change=e=>{if(s.gameState==='menu'&&['normal','easy'].includes(e.target.value)){state.selected=e.target.value;s.difficulty=state.selected;sync(s);}};
  const key=e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();s.handleStart();}};p?.addEventListener('change',change);p?.addEventListener('keydown',key);
  const tick=(_time,delta)=>{if(!easy(s)||s.gameState!=='playing'||s.transitioning)return;
   for(const group of [s.enemies,s.enemyShots])for(const e of group.getChildren())if(e.body&&!e.body.easyScaled){const body=e.body,update=body.update;body.update=function(dt){return update.call(this,dt*.75);};body.easyScaled=true;}
   const delay=Math.min(delta,100)*(1-1/1.3);
   for(const e of s.enemies.getChildren()){if(e.floorIndex!==s.floor||e.defeated)continue;if(Number.isFinite(e.lastAttack))e.lastAttack+=delay;if(Number.isFinite(e.sapNextAttack))e.sapNextAttack+=delay;if(Number.isFinite(e.finalNext))e.finalNext+=delay;if(e.dbpm&&Number.isFinite(e.dbpm.nextAttack))e.dbpm.nextAttack+=delay;}
  };s.events.on('preupdate',tick);s.events.once('shutdown',()=>{s.events.off('preupdate',tick);p?.removeEventListener('change',change);p?.removeEventListener('keydown',key);});sync(s);
 }
 function finish(s){if(active)return;const d=document.createElement('dialog');d.className='score-dialog easy-dialog';d.setAttribute('aria-label','Mise splněna na obtížnost Easy');d.innerHTML='<section class="score-panel"><p class="score-eyebrow">MISE SPLNĚNA · EASY</p><img class="easy-manager" src="assets/ending/easy-manager.png" alt="Usměvavý hlavní manažer ukazuje na tebe, za ním odlétá sportovní auto."><h2>Jestli chceš bejt zaměstnanec roku, tak to koukej dohrát na Normal obtížnost!</h2><p>Easy · Tak abych se nepředřel. Skóre se nezapisuje.</p><div class="easy-actions"><button data-normal>ZKUSIT NORMAL</button><button data-menu>ZPĚT DO MENU</button></div></section>';
  const enabled=s.input.keyboard.enabled;s.input.keyboard.enabled=false;s.touchControls?.clear();const dispose=()=>{active=null;if(d.open)d.close();d.remove();s.input.keyboard.enabled=enabled;s.events.off('shutdown',dispose);};s.events.once('shutdown',dispose);
  const restart=normal=>{dispose();s.registry.remove(ITHeroGameplay.checkpointKey);if(normal)state.selected='normal';s.scene.restart({resumeCheckpoint:false});};d.querySelector('[data-normal]').onclick=()=>restart(true);d.querySelector('[data-menu]').onclick=()=>restart(false);d.addEventListener('cancel',e=>e.preventDefault());d.addEventListener('keydown',e=>e.stopPropagation());(document.getElementById('play-area')||document.body).append(d);active=d;d.showModal();d.querySelector('button').focus();
 }
 window.ITHeroDifficulty={state,easy,attach,sync,finish,isOpen:()=>!!active};
})();
