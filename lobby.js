/* Portraits come from the exact currently selected game textures. */
(()=>{'use strict';let current=null,scoreRequest=0;
 async function refreshScores(){const body=document.querySelector('#lobby-scores'),status=document.querySelector('#lobby-status');if(!body)return;const revision=++scoreRequest;let rows=[];try{if(ITHeroCommunity.apiBase()){const data=await ITHeroCommunity.request('/v1/scores');ITHeroScores.observeReset(data);rows=data.items;status.textContent=rows.length?'Společné výsledky hráčů ze všech zařízení.':'První zaměstnanec roku na svůj rekord teprve čeká.';}else{rows=ITHeroScores.read();status.textContent='Výsledky v tomto prohlížeči.';}}catch{rows=ITHeroScores.read();status.textContent='Společný žebříček není dostupný. Zobrazuji výsledky z tohoto prohlížeče.';}
  if(revision!==scoreRequest)return;body.replaceChildren();rows=[...rows].sort((a,b)=>b.score-a.score);
  for(const [i,row] of rows.entries()){const tr=document.createElement('tr');for(const value of [i+1,row.name,String(row.score).padStart(6,'0')]){const td=document.createElement('td');if(value===row.name&&current)td.append(ITHeroAvatars.cell(current,row));else td.textContent=value;tr.append(td);}body.append(tr);}
  const separator=document.createElement('tr'),label=document.createElement('th');label.colSpan=3;label.textContent='UKÁZKOVÍ SOUPEŘI • NEJSOU SKUTEČNÉ REKORDY';separator.className='demo-heading';separator.append(label);body.append(separator);
  const reference=rows.length?Math.max(1,Math.min(...rows.map(row=>Number(row.score)||0))):5000;
  const demos=ITHeroScores.demoRows(reference);renderHall([...rows,...demos].slice(0,6),rows.length);
  for(const row of demos){const tr=document.createElement('tr');tr.className='demo-row';for(const value of ['★',row.name,String(row.score).padStart(6,'0')]){const td=document.createElement('td');if(value===row.name&&current)td.append(ITHeroAvatars.cell(current,row));else td.textContent=value;tr.append(td);}body.append(tr);}
 }
 function renderHall(rows,realCount){
  const gallery=document.getElementById('employee-portraits');if(!gallery||!current)return;gallery.replaceChildren();
  rows.forEach((row,i)=>{const card=document.createElement('figure'),canvas=ITHeroAvatars.portrait(current,row.avatar,96),caption=document.createElement('figcaption'),name=document.createElement('strong'),score=document.createElement('span');name.textContent=`${i+1}. ${row.name}`;score.textContent=String(row.score).padStart(6,'0');score.className='hall-score';caption.append(name,score);if(i>=realCount){const demo=document.createElement('small');demo.textContent='UKÁZKOVÝ SOUPEŘ';caption.append(demo);}card.append(canvas,caption);gallery.append(card);});
 }
 function mount(scene){current=scene;window.ITHeroPlayStats?.mount(scene);refreshScores();}
 window.addEventListener('it-hero-appearance',()=>{if(current?.sys?.isActive())mount(current);});window.addEventListener('it-hero-score',refreshScores);
 window.ITHeroLobby={mount,refreshScores};
})();
