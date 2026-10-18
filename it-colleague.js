/* Friendly helper. Independent clock, items and health rules from the old IT helper. */
(() => {
  'use strict';
  const config={intervalMin:20000,intervalMax:35000,peekDuration:750,dropAt:1100,
    visitMin:2800,visitMax:3800,fadeDuration:400,itemLifetime:12000,blinkDuration:2000,heal:1};
  const quotes={coffee:window.ITHeroDialogue.lines('it_colleague','coffee'),candy:window.ITHeroDialogue.lines('it_colleague','candy')};
  const art={path:'assets/characters/it_colleague.png',poses:{idle:[60,14,343,861],peek:[495,370,385,496],offer_coffee:[935,26,347,849],offer_candy:[1381,26,342,848]},anchors:{idle:{x:185,y:861},peek:{x:213,y:496},offer_coffee:{x:198,y:849},offer_candy:{x:195,y:848}}};
  function preload(scene){scene.load.image('colleague-source',art.path);}
  function createTextures(scene){
    const frames={};
    const source=scene.textures.get('colleague-source').getSourceImage();
    for(const [pose,[x,y,w,h]] of Object.entries(art.poses)){
      const key=`colleague-${pose}`;frames[pose]=key;
      if(scene.textures.exists(key))continue;
      const texture=scene.textures.createCanvas(key,96,88),ctx=texture.context;
      ctx.imageSmoothingEnabled=false;
      const scale=80/art.poses.idle[3],foot=art.anchors[pose]||{x:w/2,y:h};
      ctx.drawImage(source,x,y,w,h,Math.round(48-foot.x*scale),Math.round(88-foot.y*scale),Math.round(w*scale),Math.round(h*scale));texture.refresh();
    }
    const make=(key,w,h,draw)=>{if(scene.textures.exists(key))return;const g=scene.make.graphics({add:false});draw(g);g.generateTexture(key,w,h);g.destroy();};
    make('colleague-coffee',24,30,g=>{
      g.fillStyle(0x1b2730).fillRect(3,6,18,5).fillRect(5,10,14,18);
      g.fillStyle(0xfff4df).fillRect(6,10,12,17);
      g.fillStyle(0xa4693c).fillRect(5,15,14,7);
      g.fillStyle(0x52616c).fillRect(5,6,14,2);
      g.lineStyle(1,0xd4e8de).lineBetween(9,0,8,4).lineBetween(15,0,14,4);
    });
    make('colleague-candy',32,22,g=>{
      g.fillStyle(0x7a1527).fillTriangle(0,4,10,9,0,18).fillTriangle(32,4,22,9,32,18);
      g.fillStyle(0xf43a48).fillTriangle(1,6,11,10,1,16).fillTriangle(31,6,21,10,31,16).fillEllipse(16,11,21,19);
      g.lineStyle(2,0xfff4e9).lineBetween(9,5,18,18).lineBetween(15,3,23,15);
      g.fillStyle(0xffb1a6).fillRect(9,4,4,2);
    });
    return frames;
  }
  function create(scene,floors,plans){
    const frames=createTextures(scene),items=scene.physics.add.staticGroup();
    const state={clock:0,nextAt:Phaser.Math.Between(config.intervalMin,config.intervalMax),visit:null,items};
    const schedule=()=>state.nextAt=state.clock+Phaser.Math.Between(config.intervalMin,config.intervalMax);
    const overlaps=(x,ground,body)=>body&&body.enable!==false&&body.left<x+18&&body.right>x-18&&body.top<ground-1&&body.bottom>ground-30;
    function safe(x,floor){
      if(x<60||x>900||scene.genZ?.isReserved(x,floor)||scene.pacing?.reserved(x,floor)||scene.dbpm?.isReserved(x,floor))return false;
      const ground=floors[floor];
      if([...scene.obstacles.getChildren(),...scene.platforms.getChildren()].some(o=>o.active&&overlaps(x,ground,o.body)))return false;
      if([...scene.coffees.getChildren(),...scene.upgrades.getChildren()].some(item=>item.active&&Math.abs(item.x-x)<48&&Math.abs(item.y-ground)<80))return false;
      const old=scene.helperVisit;
      if(scene.aidItems.getChildren().some(item=>item.active&&Math.abs(item.x-x)<48&&Math.abs(item.y-ground)<80))return false;
      return !old||old.floor!==floor||Math.abs(old.dropX-x)>95;
    }
    function remove(item){item.getData('label')?.destroy();item.destroy();}
    function clearVisit(){const v=state.visit;if(!v)return;v.sprite.destroy();v.door?.destroy();v.bubble?.destroy();state.visit=null;}
    function changeFloor(){clearVisit();items.getChildren().slice().forEach(remove);}
    function spawn(options={}){
      if(state.visit||scene.gameState!=='playing'||scene.transitioning)return false;
      const floor=scene.floor,source=options.source||Phaser.Utils.Array.GetRandom(['desk','door']);
      const desks=plans[floor].desks;
      const candidates=Phaser.Utils.Array.Shuffle([125,190,390,560,780,840,...desks.flatMap(x=>[x-85,x+85])]);
      const dropX=candidates.find(x=>safe(x,floor));
      if(dropX===undefined){state.nextAt=state.clock+1000;return false;}
      const kind=options.kind||Phaser.Utils.Array.GetRandom(['coffee','candy']);
      if(!quotes[kind])return false;
      const x=source==='desk'?desks.reduce((a,b)=>Math.abs(a-dropX)<Math.abs(b-dropX)?a:b):Phaser.Math.Clamp(dropX+35,95,865);
      const sprite=scene.add.sprite(x,floors[floor],frames.peek).setOrigin(0.5,1).setDepth(source==='desk'?18:20);
      const door=source==='door'?scene.add.rectangle(x+30,floors[floor]-43,12,86,0x526568).setDepth(21):null;
      state.visit={floor,source,kind,x,dropX,sprite,door,started:state.clock,duration:Phaser.Math.Between(config.visitMin,config.visitMax),dropped:false,bubble:null};schedule();return true;
    }
    function bubble(v){
      const x=Phaser.Math.Clamp(v.dropX,135,825),y=floors[v.floor]-115;
      const container=scene.add.container(x,y).setDepth(106);
      const line=Phaser.Utils.Array.GetRandom(quotes[v.kind]);
      scene.posters.showMessage(`IT KOLEGA\n${line}`,7000);
      const text=scene.add.text(0,0,line,{font:'bold 11px monospace',color:'#18313a',backgroundColor:'#fff4db',wordWrap:{width:200},align:'center',padding:{x:8,y:6}}).setOrigin(0.5,1);
      const tail=scene.add.graphics().fillStyle(0xfff4db).fillTriangle(-5,0,5,0,0,8);
      container.add([text,tail]);return container;
    }
    function collect(item){
      if(scene.gameState!=='playing'||scene.transitioning||!item.active||item.getData('floor')!==scene.floor)return;
      const kind=item.getData('kind');scene.energy=Math.min(scene.maxEnergy,scene.energy+config.heal);remove(item);scene.updateHUD();
      scene.popText(scene.player.x,scene.player.y-65,`+1 ŽIVOT • ${kind==='coffee'?'KÁVA':'SISINKA'}`,'#b5f49a');scene.tone(790,0.10,'triangle');
    }
    scene.physics.add.overlap(scene.player,items,(_,item)=>collect(item));
    function update(delta){
      // Cleanup also runs during a floor transition, but the helper clock is paused.
      if(state.visit&&state.visit.floor!==scene.floor)changeFloor();
      if(scene.gameState!=='playing'||scene.transitioning)return;
      state.clock+=delta;
      const v=state.visit;
      if(v){
        const age=state.clock-v.started;
        if(age>=v.duration){clearVisit();}
        else {
          const fade=Phaser.Math.Clamp((v.duration-age)/config.fadeDuration,0,1);
          v.sprite.setAlpha(Math.min(age/220,1,fade));v.bubble?.setAlpha(fade);
          if(age>=config.peekDuration){v.sprite.setTexture(frames[v.kind==='coffee'?'offer_coffee':'offer_candy']).setDepth(20).setX(v.dropX+25);}
          if(fade<1)v.sprite.setTexture(frames.peek).setDepth(18).setY(floors[v.floor]+(1-fade)*12);
          if(age>=config.dropAt&&!v.dropped){
            v.dropped=true;v.bubble=bubble(v);
            // Revalidate against live obstacles before creating a static pickup.
            if(safe(v.dropX,v.floor)){
              const item=items.create(v.dropX,floors[v.floor]-16,v.kind==='coffee'?'colleague-coffee':'colleague-candy').setDepth(24).refreshBody();
              item.setData('kind',v.kind).setData('floor',v.floor).setData('expires',state.clock+config.itemLifetime);
              const label=scene.add.text(v.dropX,floors[v.floor]-44,v.kind==='coffee'?'KÁVA +1':'SISINKA +1',{font:'bold 9px monospace',color:'#f7e7ad',backgroundColor:'#153c32',padding:{x:3,y:2}}).setOrigin(0.5).setDepth(25);item.setData('label',label);
            }
          }
        }
      } else if(state.clock>=state.nextAt)spawn();
      items.getChildren().slice().forEach(item=>{
        const left=item.getData('expires')-state.clock;
        if(left<=0||item.getData('floor')!==scene.floor)remove(item);
        else {const alpha=left<config.blinkDuration&&Math.floor(state.clock/150)%2?0.25:1;item.setAlpha(alpha);item.getData('label')?.setAlpha(alpha);}
      });
    }
    return {state,items,spawn,update,changeFloor,collect,safe};
  }
  window.ITHeroColleague={config,quotes,art,preload,createTextures,create};
})();
