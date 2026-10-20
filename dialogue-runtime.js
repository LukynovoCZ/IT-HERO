/* Rendering and scheduling belong to the shared catalogue API. Gameplay never waits for speech. */
(()=>{'use strict';
 const D=window.ITHeroDialogue;
 const config={cooldownMin:7000,cooldownMax:10000,maxBubbles:1,gap:600,width:270,font:14};
 const duration=line=>line.length<=35?2800:line.length<=80?4000:Math.min(6000,4400+line.length*8);
 function pick(id,group,previous,random=Math.random,preferred){
  const lines=D.lines(id,group),pool=lines.filter(line=>line!==previous);if(!pool.length)return lines[0];
  const weights=pool.map(line=>(line.length>80?.2:line.length>60?.5:1)*(line===preferred?4:1));
  let n=random()*weights.reduce((a,b)=>a+b,0);return pool.find((_,i)=>(n-=weights[i])<0)||pool.at(-1);
 }
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
   const line=options.line??pick(id,group,state.history.get(id),Math.random,options.preferred);if(!line)return null;
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
 Object.assign(D,{config,duration,pick,layout,create});
})();
