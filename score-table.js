/* Local arcade results. No account, backend or external requests. */
(() => {
  'use strict';
  const storageKey='it-hero-high-scores-v1',limit=10;
  const demoNames=['kydla','zulupapa','dezecejvan','Laco','Vosahlo','Růžena','v8sklephavlk','Lukynovo','moniqnoar','homanVw'];
  const demoRows=score=>score>0?demoNames.map((name,i)=>({name,score:Math.max(0,Math.min(score-1,Math.floor(score*(.90-i*.075))))})):[];
  let active=null,memory=[],storageWarning=false;
  const nameOf=value=>String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().slice(0,12).toLocaleUpperCase('cs')||'AJŤÁK';
  function read(){
    try{
      const raw=localStorage.getItem(storageKey);
      if(raw&&raw.length>100000)throw Error('Invalid results');
      const rows=raw?JSON.parse(raw):[];
      if(!Array.isArray(rows))throw Error('Invalid results');
      memory=rows.slice(0,100).filter(r=>r&&typeof r.name==='string'&&Number.isSafeInteger(r.score)&&r.score>=0&&r.score<=999999999).map(r=>({name:nameOf(r.name),score:r.score})).sort((a,b)=>b.score-a.score).slice(0,limit);
    }catch(_){storageWarning=true;}
    return memory;
  }
  function open(scene,{score,elapsed,bonus}){
    if(active)return;
    const dialog=document.createElement('dialog');dialog.className='score-dialog';dialog.setAttribute('aria-labelledby','score-title');
    dialog.innerHTML=`<section class="score-panel"><p class="score-eyebrow">MISSION COMPLETE</p><h2 id="score-title">HIGH SCORES</h2><p class="score-result"></p><p class="score-details"></p><form class="score-form"><label for="score-name">TVOJE JMÉNO</label><input id="score-name" name="name" maxlength="12" autocomplete="nickname" placeholder="AJŤÁK" enterkeyhint="done"><button type="submit">ZAPSAT SKÓRE</button></form><p class="score-status" role="status"></p><div class="score-scroll"><table><caption>TOP 10 · V TOMTO PROHLÍŽEČI</caption><thead><tr><th scope="col">#</th><th scope="col">JMÉNO</th><th scope="col">SCORE</th></tr></thead><tbody data-score-list></tbody><tbody data-demo-list></tbody></table></div><button class="score-again" type="button">HRÁT ZNOVU</button></section>`;
    dialog.querySelector('.score-result').textContent=`TVOJE SCORE: ${score.toString().padStart(6,'0')}`;
    dialog.querySelector('.score-details').textContent=`Čas ${elapsed} · bonus za rychlost +${bonus}`;
    const form=dialog.querySelector('form'),status=dialog.querySelector('.score-status'),body=dialog.querySelector('[data-score-list]');
    const render=rows=>{
      body.replaceChildren();
      rows.forEach((row,i)=>{const tr=document.createElement('tr');for(const text of [String(i+1).padStart(2,'0'),row.name,String(row.score).padStart(6,'0')]){const cell=document.createElement('td');cell.textContent=text;tr.append(cell);}body.append(tr);});
      if(!rows.length){const tr=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='PRVNÍ REKORD ČEKÁ NA TEBE';tr.append(cell);body.append(tr);}
    };
    // Decorative opponents never enter storage, rankings or the future shared API.
    const demos=dialog.querySelector('[data-demo-list]'),header=document.createElement('tr'),heading=document.createElement('th');
    heading.colSpan=3;heading.scope='colgroup';heading.textContent='UKÁZKOVÍ SOUPEŘI · NEJSOU SKUTEČNÉ REKORDY';header.append(heading);demos.append(header);
    demoRows(score).forEach(row=>{const tr=document.createElement('tr');tr.className='score-demo';for(const text of ['★',row.name,String(row.score).padStart(6,'0')]){const cell=document.createElement('td');cell.textContent=text;tr.append(cell);}demos.append(tr);});
    render(read());status.textContent=storageWarning?'Ukládání není dostupné. Výsledek zůstane jen pro tuto návštěvu.':'Zadej až 12 znaků. Výsledky se nesdílejí mezi zařízeními.';
    const keyboardEnabled=scene.input.keyboard.enabled;
    scene.input.keyboard.enabled=false;scene.touchControls?.clear();scene.browserHeld?.clear();scene.browserPressed?.clear();
    const dispose=()=>{if(active!==dialog)return;active=null;if(dialog.open)dialog.close();dialog.remove();scene.input.keyboard.enabled=keyboardEnabled;scene.events.off('shutdown',dispose);};
    scene.events.once('shutdown',dispose);
    form.addEventListener('submit',event=>{
      event.preventDefault();if(form.dataset.saved)return;form.dataset.saved='true';
      const entry={name:nameOf(form.elements.name.value),score};const rows=[...read(),entry].sort((a,b)=>b.score-a.score);const rank=rows.indexOf(entry)+1;memory=rows.slice(0,limit);
      try{localStorage.setItem(storageKey,JSON.stringify(memory));storageWarning=false;}catch(_){storageWarning=true;}
      render(memory);form.elements.name.value=entry.name;form.elements.name.disabled=true;form.querySelector('button').disabled=true;
      status.textContent=(rank<=limit?`ZAPSÁNO · ${rank}. MÍSTO`:'DOKONČENO · TENTOKRÁT MIMO TOP 10')+(storageWarning?' · Jen pro tuto návštěvu; prohlížeč nepovolil uložení.':'');
    });
    dialog.addEventListener('cancel',event=>event.preventDefault());
    dialog.addEventListener('keydown',event=>event.stopPropagation());
    dialog.querySelector('.score-again').addEventListener('click',()=>{dispose();scene.handleStart();});
    (document.getElementById('play-area')||document.body).append(dialog);active=dialog;dialog.showModal();
    // Avoid opening the phone keyboard before the player chooses to enter their name.
    dialog.querySelector('.score-again').focus({preventScroll:true});
  }
  window.ITHeroScores={open,isOpen:()=>!!active,storageKey,demoNames,demoRows};
})();
