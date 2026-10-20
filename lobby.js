/* Portraits come from the exact currently selected game textures. */
(()=>{'use strict';let current=null;
 async function refreshScores(){const body=document.querySelector('#lobby-scores'),status=document.querySelector('#lobby-status');if(!body)return;body.replaceChildren();let rows=[];try{if(ITHeroCommunity.apiBase()){rows=(await ITHeroCommunity.request('/v1/scores')).items;status.textContent=rows.length?'Společné výsledky hráčů ze všech zařízení.':'První zaměstnanec roku na svůj rekord teprve čeká.';}else{rows=ITHeroScores.read();status.textContent='Výsledky v tomto prohlížeči.';}}catch{rows=ITHeroScores.read();status.textContent='Společný žebříček není dostupný. Zobrazuji výsledky z tohoto prohlížeče.';}
  for(const [i,row] of rows.entries()){const tr=document.createElement('tr');for(const value of [i+1,row.name,String(row.score).padStart(6,'0')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}
  const separator=document.createElement('tr'),label=document.createElement('th');label.colSpan=3;label.textContent='UKÁZKOVÍ SOUPEŘI • NEJSOU SKUTEČNÉ REKORDY';separator.className='demo-heading';separator.append(label);body.append(separator);
  const reference=rows.length?Math.max(1,...rows.map(row=>Number(row.score)||0)):5000;
  for(const row of ITHeroScores.demoRows(reference)){const tr=document.createElement('tr');tr.className='demo-row';for(const value of ['★',row.name,String(row.score).padStart(6,'0')]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}
 }
 function mount(scene){current=scene;const gallery=document.getElementById('employee-portraits');if(!gallery)return;gallery.replaceChildren();const portraits=[['ODBORÁŘ','union',64,80,22,4,29,30],['MANAŽER','manager',64,80,21,2,29,30],['SPECIALISTKA','specialist',136,80,52,2,27,33],['DESIGN MANAŽER','trio-design_manager-idle',80,112,27,1,25,33],['ŠÉF SAP','trio-sap_integrator-idle',112,80,43,8,25,27],['SENIOR MASTER','badger-idle',80,80,21,1,38,34]];
  for(const [name,key,w,h,x,y,cw,ch] of portraits){const card=document.createElement('figure'),canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;canvas.setAttribute('aria-label',name);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#143a33';ctx.fillRect(0,0,96,96);const source=scene.textures.get(ITHeroAppearance.texture(scene,key)).getSourceImage();ctx.drawImage(source,x,y,cw,ch,8,8,80,80);const caption=document.createElement('figcaption');caption.textContent=name;card.append(canvas,caption);gallery.append(card);}
  refreshScores();
 }
 window.addEventListener('it-hero-appearance',()=>{if(current?.sys?.isActive())mount(current);});window.addEventListener('it-hero-score',refreshScores);
 window.ITHeroLobby={mount,refreshScores};
})();
