/* Local arcade results with optional shared publication and stable avatar IDs. */
(() => {
  'use strict';
  const storageKey='it-hero-high-scores-v1',limit=10;
  const demoNames=['kydla','zulupapa','dezecejvan','Laco','Vosahlo','Růžena','v8sklephavlk','Poldajede','moniqnoar','homanVw'];
  let demoAvatars;
  function demoAvatar(name){
    if(!demoAvatars){try{demoAvatars=JSON.parse(localStorage.getItem('it-hero-demo-avatars')||'{}');}catch{demoAvatars={};}if(!demoAvatars||typeof demoAvatars!=='object'||Array.isArray(demoAvatars))demoAvatars={};
      const pool=ITHeroAvatars.choices.map(a=>a.id);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
      for(const [i,n] of demoNames.entries())if(!ITHeroAvatars.choices.some(a=>a.id===demoAvatars[n]))demoAvatars[n]=pool[i%pool.length];
      try{localStorage.setItem('it-hero-demo-avatars',JSON.stringify(demoAvatars));}catch{}
    }return demoAvatars[name];
  }
  const demoRows=score=>score>0?demoNames.map((name,i)=>({name,avatar:demoAvatar(name),score:Math.max(0,Math.min(score-1,Math.floor(score*(.90-i*.075))))})):[];
  let active=null,memory=[],storageWarning=false;
  const nameOf=value=>String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().toLocaleUpperCase('cs').slice(0,12)||'AJŤÁK';
  function read(){
    try{
      const raw=localStorage.getItem(storageKey);
      if(raw&&raw.length>100000)throw Error('Invalid results');
      const rows=raw?JSON.parse(raw):[];
      if(!Array.isArray(rows))throw Error('Invalid results');
      memory=rows.slice(0,100).filter(r=>r&&typeof r.name==='string'&&Number.isSafeInteger(r.score)&&r.score>=0&&r.score<=999999999).map(r=>({name:nameOf(r.name),score:r.score,avatar:ITHeroAvatars.normalize(r.avatar)})).sort((a,b)=>b.score-a.score).slice(0,limit);
    }catch(_){storageWarning=true;}
    return memory;
  }
  function open(scene,{score,elapsed,bonus}){
    if(window.ITHeroDifficulty?.easy(scene)){ITHeroDifficulty.finish(scene);return;}
    const training=!!window.ITHeroAppearance?.state.training||!!scene.registry?.get('trainingRun');
    const requestId=crypto.randomUUID();
    if(active)return;
    const dialog=document.createElement('dialog');dialog.className='score-dialog';dialog.setAttribute('aria-labelledby','score-title');
    dialog.innerHTML=`<section class="score-panel"><p class="score-eyebrow">MISSION COMPLETE</p><h2 id="score-title">HIGH SCORES</h2><p class="score-result"></p><p class="score-details"></p><form class="score-form"><label for="score-name">TVOJE JMÉNO</label><input id="score-name" name="name" maxlength="12" autocomplete="nickname" placeholder="AJŤÁK" enterkeyhint="done"><fieldset class="avatar-picker"><legend>VYBER SVÉHO AVATARA</legend><div class="avatar-options"></div></fieldset><button type="submit">ZAPSAT SKÓRE</button></form><p class="score-status" role="status"></p><div class="score-scroll"><table><caption>TOP 10 · V TOMTO PROHLÍŽEČI</caption><thead><tr><th scope="col">#</th><th scope="col">JMÉNO</th><th scope="col">SCORE</th></tr></thead><tbody data-score-list></tbody><tbody data-demo-list></tbody></table></div><button class="score-again" type="button">HRÁT ZNOVU</button></section>`;
    dialog.querySelector('.score-result').textContent=`TVOJE SCORE: ${score.toString().padStart(6,'0')}`;
    dialog.querySelector('.score-details').textContent=`Čas ${elapsed} · bonus za rychlost +${bonus}`;
    const form=dialog.querySelector('form'),status=dialog.querySelector('.score-status'),body=dialog.querySelector('[data-score-list]');
    let selectedAvatar=ITHeroAvatars.normalize((()=>{try{return localStorage.getItem('it-hero-avatar')||(window.ITHeroPlayer?.state.id==='girl'?'hero_girl':'hero');}catch{return null;}})());
    const selectedLabel=document.createElement('p');selectedLabel.className='avatar-selected';const labelAvatar=()=>selectedLabel.textContent=ITHeroAvatars.choices.find(a=>a.id===selectedAvatar).name;labelAvatar();form.querySelector('.avatar-picker').append(selectedLabel);
    for(const avatar of ITHeroAvatars.choices){const label=document.createElement('label');label.className='avatar-option';const input=document.createElement('input');input.type='radio';input.name='avatar';input.value=avatar.id;input.checked=avatar.id===selectedAvatar;input.setAttribute('aria-label',avatar.name);input.onchange=()=>{selectedAvatar=avatar.id;labelAvatar();};label.append(input,ITHeroAvatars.portrait(scene,avatar.id,64));label.title=avatar.name;form.querySelector('.avatar-options').append(label);}
    const render=rows=>{
      body.replaceChildren();
      rows.forEach((row,i)=>{const tr=document.createElement('tr');for(const text of [String(i+1).padStart(2,'0'),row.name,String(row.score).padStart(6,'0')]){const cell=document.createElement('td');if(text===row.name)cell.append(ITHeroAvatars.cell(scene,row));else cell.textContent=text;tr.append(cell);}body.append(tr);});
      if(!rows.length){const tr=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='PRVNÍ REKORD ČEKÁ NA TEBE';tr.append(cell);body.append(tr);}
    };
    // Decorative opponents never enter storage, rankings or the future shared API.
    const demos=dialog.querySelector('[data-demo-list]'),header=document.createElement('tr'),heading=document.createElement('th');
    heading.colSpan=3;heading.scope='colgroup';heading.textContent='UKÁZKOVÍ SOUPEŘI · NEJSOU SKUTEČNÉ REKORDY';header.append(heading);demos.append(header);
    demoRows(score).forEach(row=>{const tr=document.createElement('tr');tr.className='score-demo';for(const text of ['★',row.name,String(row.score).padStart(6,'0')]){const cell=document.createElement('td');if(text===row.name)cell.append(ITHeroAvatars.cell(scene,row));else cell.textContent=text;tr.append(cell);}demos.append(tr);});
    render(read());status.textContent=storageWarning?'Ukládání není dostupné. Výsledek zůstane jen pro tuto návštěvu.':(window.ITHeroCommunity?.apiBase()?'Vyber avatara a zadej až 12 znaků. Výsledek se uloží i do společného žebříčku.':'Vyber avatara a zadej až 12 znaků. Výsledek zůstane v tomto prohlížeči.');
    const keyboardEnabled=scene.input.keyboard.enabled;
    scene.input.keyboard.enabled=false;scene.touchControls?.clear();scene.browserHeld?.clear();scene.browserPressed?.clear();
    const dispose=()=>{if(active!==dialog)return;active=null;if(dialog.open)dialog.close();dialog.remove();scene.input.keyboard.enabled=keyboardEnabled;scene.events.off('shutdown',dispose);};
    scene.events.once('shutdown',dispose);
    if(training){form.hidden=true;status.textContent='TRÉNINK S NESMRTELNOSTÍ • SKÓRE SE NEZAPÍŠE';}
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(training||form.dataset.saved)return;form.dataset.saved='true';
      const entry={name:nameOf(form.elements.name.value),score,avatar:selectedAvatar};try{localStorage.setItem('it-hero-avatar',selectedAvatar);}catch{}const rows=[...read(),entry].sort((a,b)=>b.score-a.score);const rank=rows.indexOf(entry)+1;memory=rows.slice(0,limit);
      try{localStorage.setItem(storageKey,JSON.stringify(memory));storageWarning=false;}catch(_){storageWarning=true;}
      render(memory);form.elements.name.value=entry.name;form.elements.name.disabled=true;form.querySelector('button').disabled=true;form.querySelectorAll('[name=avatar]').forEach(input=>input.disabled=true);
      window.dispatchEvent(new Event('it-hero-score'));
      status.textContent=(rank<=limit?`ZAPSÁNO · ${rank}. MÍSTO`:'DOKONČENO · TENTOKRÁT MIMO TOP 10')+(storageWarning?' · Jen pro tuto návštěvu; prohlížeč nepovolil uložení.':'');
      if(window.ITHeroCommunity?.apiBase()){
        const publish=async()=>{try{await ITHeroCommunity.request('/v1/scores',{method:'POST',body:{requestId,name:entry.name,avatar:entry.avatar,score,elapsedMs:Math.floor(scene.pacing?.state.elapsed||0),training:false,completed:true,difficulty:scene.difficulty||'normal'}});status.textContent='SKÓRE ULOŽENO DO SPOLEČNÉHO ŽEBŘÍČKU';window.dispatchEvent(new Event('it-hero-score'));retry.remove();}catch(error){status.textContent='Lokálně uloženo. Společný zápis neprošel: '+error.message;retry.hidden=false;}};
        const retry=document.createElement('button');retry.type='button';retry.textContent='Zopakovat společný zápis';retry.hidden=true;retry.onclick=()=>{retry.hidden=true;publish();};status.after(retry);await publish();
      }
    });
    dialog.addEventListener('cancel',event=>event.preventDefault());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.querySelector('.score-again').addEventListener('click',()=>{dispose();scene.handleStart();});
    (document.getElementById('play-area')||document.body).append(dialog);active=dialog;dialog.showModal();
    // Avoid opening the phone keyboard before the player chooses to enter their name.
    dialog.querySelector('.score-again').focus({preventScroll:true});
  }
  window.ITHeroScores={open,read,isOpen:()=>!!active||!!window.ITHeroDifficulty?.isOpen(),storageKey,demoNames,demoRows};
})();
