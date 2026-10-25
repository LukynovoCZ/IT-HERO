/* Count actual play starts, not page views. Persistent random ID, no fingerprinting. */
(()=>{'use strict';const key='it-hero-anonymous-player-v1';let memoryId=null,inflight=null,loading=null;
 function playerId(){if(memoryId)return memoryId;try{const saved=localStorage.getItem(key);if(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(saved||''))return memoryId=saved;memoryId=crypto.randomUUID();localStorage.setItem(key,memoryId);}catch{memoryId||=crypto.randomUUID();}return memoryId;}
 function refreshPlayers(){if(loading)return loading;const status=document.getElementById('play-stats-status');if(!status)return Promise.resolve();
  loading=(async()=>{try{const data=await ITHeroCommunity.request('/v1/play-stats');for(const field of ['today','week','total'])if(!Number.isSafeInteger(data[field])||data[field]<0)throw Error('Neplatná statistika.');for(const field of ['today','week','total'])document.getElementById('players-'+field).textContent=data[field].toLocaleString('cs-CZ');status.textContent='Unikátní prohlížeče · společná statistika všech hráčů';}catch{for(const field of ['today','week','total'])document.getElementById('players-'+field).textContent='—';status.textContent='Statistika je dočasně nedostupná.';}finally{loading=null;}})();return loading;
 }
 function uniqueStarted(){if(inflight)return inflight;inflight=(async()=>{try{await ITHeroCommunity.request('/v1/plays',{method:'POST',body:{playerId:playerId()}});if(loading)await loading;await refreshPlayers();}catch{/* Network failures never interrupt a game or invent a count. */}finally{inflight=null;}})();return inflight;}
 const hostileIds=['secretary','union','manager','specialist','security_guard','hr_manager','design_manager','sap_integrator','dbpm'];
 let currentScene=null,gameData=null,loadingGames=null;
 const excluded=scene=>!!window.ITHeroAppearance?.state.training||!!scene?.registry?.get('trainingRun');
 function renderGames(){
  if(!gameData)return;const total=document.getElementById('games-started'),since=document.getElementById('games-since'),list=document.getElementById('game-killers');if(!total||!list)return;
  total.textContent=gameData.total.toLocaleString('cs-CZ');since.textContent='Počítáme od '+new Date(gameData.since*1000).toLocaleDateString('cs-CZ',{timeZone:'Europe/Prague'})+'. Každý nový pokus = jedna hra.';
  list.replaceChildren();if(!gameData.killers.length){const p=document.createElement('p');p.textContent='Zatím nás nikdo nezastavil.';list.append(p);return;}
  for(const [i,row] of gameData.killers.entries()){
   const card=document.createElement('figure');card.className='killer-card';if(i===0)card.classList.add('killer-first');
   if(currentScene){const avatar=row.characterId==='secretary'?'secretary_blonde':row.characterId;card.append(ITHeroAvatars.portrait(currentScene,avatar,96));}
   const caption=document.createElement('figcaption'),name=document.createElement('strong'),count=document.createElement('span');name.textContent=`${i+1}. ${ITHeroDialogue.characters.find(c=>c.id===row.characterId)?.name||row.characterId}`;count.textContent=row.kills.toLocaleString('cs-CZ');count.className='hall-score';count.setAttribute('aria-label',`Počet zdárných odchycení ajťáků na meeting: ${row.kills}`);caption.append(name,count);card.append(caption);list.append(card);
  }
 }
 function refreshGames(){if(loadingGames)return loadingGames;const status=document.getElementById('game-stats-status');if(!status)return Promise.resolve();loadingGames=(async()=>{try{const d=await ITHeroCommunity.request('/v1/game-stats');if(!Number.isSafeInteger(d.total)||d.total<0||!Number.isSafeInteger(d.since)||!Array.isArray(d.killers)||d.killers.some(r=>!hostileIds.includes(r.characterId)||!Number.isSafeInteger(r.kills)||r.kills<1))throw Error('Neplatná statistika her.');gameData=d;renderGames();status.textContent='Normal i Easy · bez her s nesmrtelností. Prohru připíšeme tomu, kdo vezme poslední život.';}catch{document.getElementById('games-started').textContent='—';document.getElementById('games-since').textContent='';document.getElementById('game-killers').replaceChildren();status.textContent='Statistika her je dočasně nedostupná.';}finally{loadingGames=null;}})();return loadingGames;}
 function refresh(){return Promise.allSettled([refreshPlayers(),refreshGames()]);}
 async function refreshAfterChange(){if(loadingGames)await loadingGames;return refreshGames();}
 function started(scene){const unique=uniqueStarted();if(!scene||scene.statisticRun)return unique;
  const run={id:crypto.randomUUID(),difficulty:scene.difficulty||'normal',training:excluded(scene),recorded:false,dead:false};scene.statisticRun=run;
  run.pending=(async()=>{try{if(run.training)return;const generation=await ITHeroCommunity.request('/v1/game-stats');if(run.training)return;await ITHeroCommunity.request('/v1/game-runs',{method:'POST',body:{requestId:run.id,difficulty:run.difficulty,rulesVersion:2,training:false,resetId:generation.resetId}});run.recorded=true;await refreshAfterChange();}catch{/* Counting never blocks play. */}})();return Promise.allSettled([unique,run.pending]);
 }
 function training(scene){const run=scene?.statisticRun;if(!run)return;run.training=true;return (async()=>{await run.pending;if(!run.recorded)return;try{await ITHeroCommunity.request('/v1/game-runs/training',{method:'POST',body:{requestId:run.id}});await refreshAfterChange();}catch{}})();}
 function died(scene,killerId){const run=scene?.statisticRun;if(!run||run.dead)return;if(excluded(scene))return training(scene);run.dead=true;if(!hostileIds.includes(killerId))return;return (async()=>{await run.pending;if(!run.recorded||run.training)return;try{await ITHeroCommunity.request('/v1/game-runs/death',{method:'POST',body:{requestId:run.id,killerId}});await refreshAfterChange();}catch{}})();}
 const ready=()=>{refresh();const timer=setInterval(()=>{if(!document.hidden)refresh();},60000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();window.ITHeroPlayStats={started,refresh,died,training,mount(scene){currentScene=scene;renderGames();}};
})();
