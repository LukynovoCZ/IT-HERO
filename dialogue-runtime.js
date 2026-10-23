/* Rendering and scheduling belong to the shared catalogue API. Gameplay never waits for speech. */
(()=>{'use strict';
 const D=window.ITHeroDialogue;
 const config={cooldownMin:7000,cooldownMax:10000,maxBubbles:1,gap:600,width:270,font:14};
 const duration=line=>Math.max(6000,Math.min(12000,3000+line.length*60));
 function pick(id,group,previous,random=Math.random){
  const lines=D.lines(id,group),pool=lines.filter(line=>line!==previous);
  return pool.length?pool[Math.floor(random()*pool.length)]:lines[0];
 }
 // Persist shuffled bags so even short visits eventually expose every line.
 const rotationKey='it-hero-dialogue-rotation-v1';
 let bags;
 function loadBags(){if(bags)return;bags=Object.create(null);try{const raw=localStorage.getItem(rotationKey);if(raw&&raw.length<500000){const parsed=JSON.parse(raw);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))for(const [key,value] of Object.entries(parsed).slice(0,500))bags[key]=value;}}catch{}}
 function drawPool(id,group,pool,random=Math.random){
  const lines=[...new Set(pool)];if(!lines.length)return;
  loadBags();const key=id+'/'+group+'/'+(window.ITHeroAppearance?.state.original?'original':'public'),signature=JSON.stringify(lines);
  let bag=bags[key];if(!bag||bag.signature!==signature||!Array.isArray(bag.remaining)||bag.remaining.some(line=>!lines.includes(line))||new Set(bag.remaining).size!==bag.remaining.length)bag=bags[key]={signature,remaining:[],last:null};
  if(!bag.remaining.length){bag.remaining=[...lines];for(let i=bag.remaining.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag.remaining[i],bag.remaining[j]]=[bag.remaining[j],bag.remaining[i]];}if(bag.remaining.length>1&&bag.remaining[0]===bag.last)[bag.remaining[0],bag.remaining[1]]=[bag.remaining[1],bag.remaining[0]];}
  const line=bag.remaining.shift();bag.last=line;try{localStorage.setItem(rotationKey,JSON.stringify(bags));}catch{}return line;
 }
 function draw(id,group,random=Math.random){return drawPool(id,group,D.lines(id,group),random);}
 function humanLines(){return [...new Set(D.characters.filter(c=>!['jay','rabbit_one','rabbit_two'].includes(c.id)).flatMap(c=>c.groups.flatMap(g=>D.lines(c.id,g.id))))];}
 function smokerQuote(random=Math.random){const prefix=drawPool('outdoor-smokers','prefix',['Prej','On na to','Slyšeli jste to, prej'],random),line=drawPool('outdoor-smokers','quotes',humanLines(),random);return {line,prefix,text:prefix+(prefix==='On na to'?': ':' ')+`„${line}“`};}
 function layout(text,owner,camera){
  const left=camera.scrollX+12,right=camera.scrollX+camera.width-12;
  const top=camera.scrollY+150,bottom=camera.scrollY+camera.height-75;
  const y=(owner.body?.top??owner.y-(owner.displayHeight||0)*(owner.originY||0))-14;
  text.setPosition(Math.max(left+text.width/2,Math.min(right-text.width/2,owner.x)),Math.max(top+text.height,Math.min(bottom,y)));
 }
 function create(scene){
  const state={clock:0,active:new Map(),history:new Map(),next:new Map(),gapUntil:0};
  function remove(owner){const entry=state.active.get(owner);if(entry){entry.text.destroy();state.active.delete(owner);}}
  function clear(){for(const owner of state.active.keys())remove(owner);}
  function say(owner,id,group,options={}){
   if(scene.gameState!=='playing'||scene.transitioning||!owner||owner.active===false||owner.floorIndex!==undefined&&owner.floorIndex!==scene.floor)return null;
   if(state.active.get(owner)?.text.active===false)remove(owner);
   const active=state.active.get(owner);
   if(active&&!options.replace)return null;
   if(!options.replace&&state.clock<(state.next.get(owner)||0))return null;
   if(!active&&(state.active.size>=config.maxBubbles||state.clock<state.gapUntil)&&!options.priority)return null;
   const line=options.line??draw(id,group);if(!line)return null;
   if(options.priority)clear();else remove(owner);
   const visibleLine=line.length>120?line.slice(0,120).replace(/\s+\S*$/,'')+'…':line;
   const text=scene.add.text(0,0,visibleLine,{font:`bold ${config.font}px monospace`,color:options.color||'#f6edce',backgroundColor:'#16362f',padding:{x:8,y:6},wordWrap:{width:config.width,useAdvancedWrap:true},align:'center'}).setOrigin(.5,1).setDepth(106);
   const ms=options.duration??duration(line);text.setData('dialogue',{id,group,line,duration:ms});
   state.active.set(owner,{text,until:state.clock+ms,floor:scene.floor,anchor:{x:owner.x,y:owner.body?.top??owner.y-(owner.displayHeight||0)*(owner.originY||0)},persist:!!options.persist});
   state.history.set(id,line);state.next.set(owner,state.clock+config.cooldownMin+Math.random()*(config.cooldownMax-config.cooldownMin));state.gapUntil=state.clock+ms+config.gap;
   layout(text,owner,scene.cameras.main);
   const name=D.characters.find(c=>c.id===id)?.name||id;scene.posters?.showMessage(`${name}\n${line}`,Math.max(7000,ms));return text;
  }
  function tick(delta){
   if(!['playing','paused'].includes(scene.gameState)||scene.transitioning){clear();return;}
   if(scene.gameState==='playing')state.clock+=delta;
   for(const [owner,e] of state.active){
    if(!e.text.active||e.floor!==scene.floor||state.clock>=e.until||!e.persist&&(owner.active===false||owner.stomped||owner.defeated)){remove(owner);continue;}
    e.text.setVisible(scene.gameState==='playing');layout(e.text,owner.active===false||owner.defeated?e.anchor:owner,scene.cameras.main);
   }
  }
  scene.events.once('shutdown',clear);return {state,say,tick,clear,remove};
 }
 Object.assign(D,{config,duration,pick,draw,drawPool,humanLines,smokerQuote,rotationKey,layout,create});
})();
