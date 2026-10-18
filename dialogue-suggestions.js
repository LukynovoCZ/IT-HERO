(() => {
 'use strict';const api=window.ITHeroCommunity,form=document.getElementById('suggestion-form'),character=form.elements.character,group=form.elements.group,status=document.getElementById('suggestion-status'),submit=form.querySelector('[type=submit]');let requestId=null;
 for(const c of api.characters()){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;character.append(option);}
 const requested=new URLSearchParams(location.search).get('character');if(api.characters().some(c=>c.id===requested))character.value=requested;
 function fillGroups(){group.replaceChildren();for(const g of api.groups(character.value)){const o=document.createElement('option');o.value=g.id;o.textContent=g.label;group.append(o);}}
 fillGroups();character.addEventListener('change',fillGroups);form.addEventListener('input',()=>requestId=null);
 let configured=false;try{configured=!!api.apiBase();}catch(error){status.textContent=error.message;}
 submit.textContent=configured?'Odeslat ke kontrole':'Stáhnout návrh JSON';document.getElementById('suggestion-mode').textContent=configured?'Návrhy se odesílají do společné schránky. Do hry se dostanou až po ručním převzetí autorem.':'Společná schránka zatím není připojená. Návrh si můžeš stáhnout jako JSON a předat autorovi. Na server se nyní nic neposílá.';
 function read(){const lines=[...new Set(form.elements.lines.value.split(/\r?\n/).map(line=>line.trim()).filter(Boolean))];if(!lines.length||lines.length>10||lines.some(line=>line.length>200||/[\u0000-\u001f\u007f]/.test(line)))throw Error('Napiš 1 až 10 hlášek, každou na vlastní řádek, maximálně 200 znaků na hlášku.');requestId||=crypto.randomUUID();return {requestId,characterId:character.value,groupId:group.value,lines,author:form.elements.author.value.trim(),website:form.elements.website.value};}
 document.getElementById('suggestion-download').hidden=!configured;
 document.getElementById('suggestion-download').addEventListener('click',()=>{try{api.download([read()]);status.textContent='JSON stažen. Tento krok návrh neodeslal.';}catch(error){status.textContent=error.message;}});
 form.addEventListener('submit',async event=>{event.preventDefault();let data;try{data=read();}catch(error){status.textContent=error.message;return;}
  if(!configured){api.download([data]);status.textContent='JSON stažen. Pošli soubor autorovi hry; společná schránka zatím není aktivní.';return;}
  form.querySelector('fieldset').disabled=true;status.textContent='Odesílám…';
  try{const result=await api.request('/v1/dialogue-suggestions',{method:'POST',body:data});status.textContent=`Návrh č. ${result.id} byl přijat ke kontrole. Veřejné hlášky hry se nezměnily.`;form.reset();fillGroups();requestId=null;}catch(error){status.textContent=error.message+' Text zůstal ve formuláři.';}finally{form.querySelector('fieldset').disabled=false;}
 });
})();
