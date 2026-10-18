/* Editable drafts never overwrite the published game dialogue. */
(() => {
  'use strict';
  const target=document.getElementById('character-dialogue'),storageKey='it-hero-dialogue-draft-v1';
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  const editors=[];
  const status=document.getElementById('dialogue-status');
  function draft(){return window.ITHeroDialogue.characters.map(c=>({id:c.id,name:c.name,groups:editors.filter(e=>e.character===c.id).map(e=>({id:e.group,label:e.label,lines:e.input.value.split('\n').filter(line=>line.trim())}))}));}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(Object.fromEntries(editors.map(e=>[`${e.character}/${e.group}`,e.input.value]))));status.textContent='Návrh uložen v tomto prohlížeči. Veřejnou hru zatím nemění.';}catch{status.textContent='Prohlížeč neumožnil uložení. Návrh si stáhni tlačítkem.';}}
  for(const character of window.ITHeroDialogue.characters){
    const card=document.createElement('article');card.className='dialogue-card';
    const heading=document.createElement('h3');heading.textContent=character.name;card.append(heading);
    const propose=document.createElement('a');propose.href=`dialogue-suggestions.html?character=${encodeURIComponent(character.id)}`;propose.textContent='Poslat novou hlášku této postavě';card.append(propose);
    if(!character.groups.length){const empty=document.createElement('p');empty.textContent='Zatím bez vlastních hlášek. Níže můžeš připravit nové.';card.append(empty);}
    const groups=character.groups.length?character.groups:[{id:'proposed',label:'Návrh nových hlášek',lines:[]}];
    for(const group of groups){
      const label=document.createElement('h4');label.textContent=group.label;card.append(label);
      const list=document.createElement('ul');
      for(const line of group.lines){const item=document.createElement('li');item.textContent=line;list.append(item);}
      card.append(list);
      const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Upravit / doplnit návrh';details.append(summary);
      const input=document.createElement('textarea');input.rows=5;input.setAttribute('aria-label',`${character.name}: ${group.label}`);input.placeholder='Nejdřív kafe.\nPak zachraňuj svět!';
      const hint=document.createElement('p');hint.id=`dialogue-hint-${character.id}-${group.id}`;hint.textContent='Jedna hláška = jeden řádek. Další odděl klávesou Enter. Bez odrážek a číslování; prázdné řádky se ignorují.';input.setAttribute('aria-describedby',hint.id);details.append(hint);
      const key=`${character.id}/${group.id}`;input.value=typeof saved[key]==='string'?saved[key]:group.lines.join('\n');input.addEventListener('input',save);details.append(input);card.append(details);
      editors.push({character:character.id,group:group.id,label:group.label,input});
    }
    target.append(card);
  }
  document.getElementById('dialogue-download').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify(draft(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='it-hero-hlasky.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  document.getElementById('dialogue-reset').addEventListener('click',()=>{
    for(const editor of editors)editor.input.value=window.ITHeroDialogue.lines(editor.character,editor.group).join('\n');save();status.textContent='Návrh obnoven podle aktuální hry.';
  });
})();
