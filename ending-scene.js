/* The victory is already committed. This scene only presents it, then opens scores once. */
(() => {
 'use strict';
 if(typeof Phaser==='undefined')return;
 const config={duration:19000,reducedDuration:3000,carWidth:330};
 let running=null;
 function preload(scene){scene.load.image('escape-background-source','assets/ending/backgrounds.png?v=0.18.0');scene.load.image('escape-car-source','assets/ending/car.png?v=0.18.0');}
 function textures(scene){
  if(scene.textures.exists('escape-roof'))return;
  const bg=scene.textures.get('escape-background-source').getSourceImage(),half=Math.floor(bg.height/2);
  for(const [i,key] of ['escape-roof','escape-campus'].entries()){const t=scene.textures.createCanvas(key,bg.width,half);t.context.imageSmoothingEnabled=false;t.context.drawImage(bg,0,i*half,bg.width,half,0,0,bg.width,half);t.refresh();}
  const image=scene.textures.get('escape-car-source').getSourceImage(),source=document.createElement('canvas');source.width=image.width;source.height=image.height;const c=source.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const data=c.getImageData(0,0,image.width,image.height).data,h=Math.floor(image.height/2);
  for(const [row,key] of ['escape-car-park','escape-car-hover'].entries()){
   let left=image.width,right=0,top=h,bottom=0;
   for(let y=0;y<h;y++)for(let x=0;x<image.width;x++)if(data[((row*h+y)*image.width+x)*4+3]>180){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   const w=right-left+1,height=bottom-top+1,t=scene.textures.createCanvas(key,w,height);t.context.imageSmoothingEnabled=false;t.context.drawImage(image,left,row*h+top,w,height,0,0,w,height);t.refresh();
  }
 }
 class Escape extends Phaser.Scene{
  constructor(){super('ITEscape');}
  create(data){
   this.result=data;this.source=this.scene.get('ITGame');running=this;this.clock=0;this.lastFrame=performance.now();this.completed=false;this.phase=-1;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.hidden=document.hidden;
   textures(this);this.cameras.main.setBackgroundColor('#081525');
   this.roof=this.add.image(480,270,'escape-roof').setDisplaySize(960,540);
   this.campus=this.add.image(480,270,'escape-campus').setDisplaySize(960,540).setAlpha(0);
   const deck=this.add.graphics();deck.fillStyle(0x122a2c).fillRect(0,351,960,189);deck.fillStyle(0x81968b).fillRect(0,350,960,8);deck.fillStyle(0xb2c7a4).fillRect(0,350,960,2);deck.lineStyle(2,0x3a5a50);for(let x=0;x<960;x+=80)deck.lineBetween(x,365,x+40,540);deck.lineBetween(0,403,960,403);deck.lineStyle(2,0x78a76f).strokeRect(475,365,350,36);this.deck=deck;
   this.door=this.add.graphics(); // The painted access door is already open in the background.
   this.hero=this.add.image(155,298,ITHeroPlayer.key(this)).setScale(1.3).setDepth(5);
   this.disk=this.add.graphics().setDepth(6);this.disk.fillStyle(0x18232c).fillRect(0,0,14,20);this.disk.fillStyle(0xb6c8c8).fillRect(2,2,10,14);this.disk.fillStyle(0x7cdb9d).fillRect(9,15,2,2);this.disk.lineStyle(2,0x18232c).lineBetween(7,20,7,28);
   const parked=sceneSize(this,'escape-car-park'),hover=sceneSize(this,'escape-car-hover');this.carHeight=parked.h;this.park=this.add.image(0,0,'escape-car-park').setDisplaySize(config.carWidth,parked.h);this.hover=this.add.image(0,0,'escape-car-hover').setDisplaySize(config.carWidth,hover.h).setAlpha(0);
   this.jets=this.add.graphics();this.wheels=this.add.graphics();this.driver=this.add.image(34,-parked.h*.16,ITHeroPlayer.key(this)).setScale(.46).setCrop(0,0,64,42).setAlpha(0);
   this.carDoor=this.add.graphics();this.carDoor.fillStyle(0xa8b9b2).fillRect(0,-34,47,58);this.carDoor.fillStyle(0x0a242d).fillRect(4,-30,39,24);this.carDoor.lineStyle(2,0x55a888).strokeRect(0,-34,47,58);this.carDoor.setPosition(14,0).setAlpha(0);
   this.car=this.add.container(650,350-parked.h/2,[this.jets,this.park,this.hover,this.wheels,this.driver,this.carDoor]).setDepth(10);
   this.add.rectangle(480,499,960,82,0x061724,.95).setDepth(20);this.caption=this.add.text(480,480,'',{font:'bold 18px monospace',color:'#f5e9c9',align:'center',wordWrap:{width:840}}).setOrigin(.5).setDepth(21);
   this.chapter=this.add.text(22,21,'',{font:'bold 16px monospace',color:'#b1f56b',backgroundColor:'#102d2a',padding:{x:10,y:7}}).setDepth(21);
   this.final=this.add.text(480,175,'MISSION COMPLETE',{font:'bold 42px monospace',color:'#b1f56b',align:'center'}).setOrigin(.5).setAlpha(0).setDepth(19);this.finalScore=this.add.text(480,235,'',{font:'bold 25px monospace',color:'#ffd17b'}).setOrigin(.5).setDepth(19);
   this.skip=document.createElement('button');this.skip.type='button';this.skip.id='ending-skip';this.skip.className='ending-skip';this.skip.textContent='PŘESKOČIT »';this.skip.setAttribute('aria-label','Přeskočit závěrečnou animaci a otevřít tabulku skóre');document.querySelector('.game-shell').append(this.skip);
   this.placeSkip=()=>{const r=this.game.canvas.getBoundingClientRect(),shell=this.skip.parentElement.getBoundingClientRect();this.skip.style.top=`${r.top-shell.top+10}px`;this.skip.style.right=`${shell.right-r.right+10}px`;this.caption.setFontSize(Math.max(18,Math.min(36,Math.round(12*960/r.width))));this.chapter.setFontSize(Math.max(16,Math.min(24,Math.round(9*960/r.width))));};this.scale.on('resize',this.placeSkip);this.placeSkip();
   this.skip.addEventListener('click',()=>this.complete());this.key=event=>{if(event.code==='KeyM'){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat){this.source.isMuted=!this.source.isMuted;this.source.touchControls?.sync();}return;}if(['Enter','NumpadEnter','Space','Escape'].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)this.complete();}};window.addEventListener('keydown',this.key,true);
   this.visibility=()=>{this.hidden=document.hidden;this.lastFrame=performance.now();};document.addEventListener('visibilitychange',this.visibility);
   this.events.once('shutdown',()=>{this.skip.remove();window.removeEventListener('keydown',this.key,true);document.removeEventListener('visibilitychange',this.visibility);this.scale.off('resize',this.placeSkip);if(running===this)running=null;});
   this.render(0);this.lastFrame=performance.now();
  }
  update(){const now=performance.now(),elapsed=now-this.lastFrame;this.lastFrame=now;if(this.completed||this.hidden)return;this.clock+=Math.max(0,elapsed);const duration=this.reduced?config.reducedDuration:config.duration;this.render(this.reduced?13000:this.clock);if(this.clock>=duration)this.complete();}
  render(t){
   const phase=t<3000?0:t<6000?1:t<9000?2:t<12000?3:t<16000?4:5;
   if(phase!==this.phase){this.phase=phase;this.chapter.setText(['01 / STŘECHA','02 / DESIGN PROTOTYPE','03 / NÁSTUP','04 / LETOVÝ REŽIM','05 / MLADÁ BOLESLAV','06 / MISE SPLNĚNA'][phase]);this.caption.setText(['ZÁLOHA ZACHRÁNĚNA.','Co to zas kluci z designu vyváděli?','Hlavně ať to nechce aktualizaci.','Tak nashle, Hasta la Vista, a nachystejte mi k snídani uzenáče…','Tak nashle, Hasta la Vista, a nachystejte mi k snídani uzenáče…','Kariéra zachráněna. Kafe počká.'][phase]);if(!this.reduced)this.source.tone([440,290,380,520,660,880][phase],.13,phase===3?'triangle':'sine');}
   const walk=t<3000?155+Math.min(1,t/2500)*128:t<6000?283:283+Math.min(1,(t-6000)/2350)*368;
   const walking=t<2500||t>6000&&t<8350,pose=walking?ITHeroPlayer.cycleKey(this,t/90):ITHeroPlayer.key(this,walking&&Math.floor(t/150)%2?'walk':'idle');
   this.hero.setPosition(walk,298).setTexture(pose).setAlpha(t<8100?1:Math.max(0,1-(t-8100)/600));
   this.disk.setPosition(walk+18,301).setAlpha(this.hero.alpha).setVisible(t<8500);
   this.door.setAlpha(t<9000?1:Math.max(0,1-(t-9000)/3000));
   const lift=Phaser.Math.Clamp((t-9000)/3000,0,1),flight=Phaser.Math.Clamp((t-12000)/4000,0,1),campus=Phaser.Math.Clamp((t-12000)/650,0,1);
   this.campus.setAlpha(campus);this.roof.setAlpha(1-campus);this.deck.setAlpha(1-campus);this.hero.setVisible(t<9000);
   this.park.setAlpha(1-lift);this.hover.setAlpha(lift);this.driver.setAlpha(Phaser.Math.Clamp((t-8400)/450,0,1));
   const open=t>=6900&&t<8700?Math.sin((t-6900)/1800*Math.PI):0;this.carDoor.setAlpha(open).setRotation(-open*.55);
   this.car.setPosition(this.reduced?590:650+flight*510,this.reduced?150:350-this.carHeight/2-lift*50-flight*210).setScale(this.reduced?.76:1-flight*.42);this.car.setVisible(t<16300);
   this.wheels.clear();if(t>=9000&&t<12000){this.wheels.lineStyle(3,0x63c3aa);for(const x of [-108,108]){this.wheels.strokeEllipse(x,this.carHeight*.31,38,Math.max(8,38*(1-lift)));}}
   this.jets.clear();if(lift>0){const length=this.reduced?30:24+lift*45+Math.sin(t/65)*5;for(const x of [-108,108]){this.jets.fillStyle(0x0789dc,.55).fillTriangle(x-14,this.carHeight*.31,x+14,this.carHeight*.31,x,this.carHeight*.31+length);this.jets.fillStyle(0xb8fffc,.95).fillTriangle(x-6,this.carHeight*.31,x+6,this.carHeight*.31,x,this.carHeight*.31+length*.7);}}
   if(t>=16000){const alpha=Phaser.Math.Clamp((t-16000)/600,0,1);this.final.setAlpha(alpha);this.finalScore.setAlpha(alpha).setText(`SCORE ${String(Math.floor(this.result.score*Math.min(1,(t-16000)/1800))).padStart(6,'0')}`);}
  }
  complete(){if(this.completed)return;this.completed=true;const source=this.source,result=this.result;this.scene.stop();source.scene.resume();source.showOverlay('HOTOVO!','HDD ODPOJEN • POJISTKA ZASTAVENA',`Servery žijí. Fotomontáže zůstaly na disku.\nČas: ${result.elapsed} • Bonus za rychlost: +${result.bonus}\nEnergie: ${source.energy} / ${source.maxEnergy}\nKonečné skóre: ${result.score}`,'ENTER / R / KLIK = ZNOVU');window.ITHeroScores.open(source,result);}
 }
 function sceneSize(scene,key){const image=scene.textures.get(key).getSourceImage();return {w:config.carWidth,h:config.carWidth*image.height/image.width};}
 function play(scene,result){if(running)return;if(!scene.textures.exists('escape-background-source')||!scene.textures.exists('escape-car-source')){scene.showOverlay('HOTOVO!','HDD ODPOJEN',`Konečné skóre: ${result.score}`,'ZNOVU');window.ITHeroScores.open(scene,result);return;}running={pending:true};scene.hideOverlay();scene.touchControls?.clear();scene.touchControls?.sync();scene.browserHeld?.clear();scene.browserPressed?.clear();scene.player.setVelocity(0);scene.scene.launch('ITEscape',result);scene.scene.pause();}
 window.ITHeroEnding={Scene:Escape,preload,play,config,isRunning:()=>!!running};
})();
