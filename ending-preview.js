/* A separate non-scoring player for the same cinematic scene used by the game. */
(() => {
 'use strict';const start=document.getElementById('preview-start'),status=document.getElementById('preview-status'),sound=document.getElementById('preview-sound');let source,muted=true;
 if(typeof Phaser==='undefined'||!window.ITHeroEnding){status.textContent='Nepodařilo se načíst herní engine. Obnov stránku.';return;}
 class Preview extends Phaser.Scene{
  constructor(){super('ITGame');}
  preload(){ITHeroEnding.preload(this);this.load.image('preview-hero-art','assets/characters.png');}
  create(){source=this;this.gameState='win';this.energy=5;this.maxEnergy=5;this.score=12500;this.isMuted=muted;this.touchControls={clear(){},sync:()=>{muted=this.isMuted;sound.textContent=muted?'Zapnout zvuk':'Vypnout zvuk';sound.setAttribute('aria-pressed',String(!muted));}};this.player={setVelocity(){}};const image=this.textures.get('preview-hero-art').getSourceImage();for(const [key,x,y,w,h] of [['hero',40,16,245,342],['hero-walk',380,16,265,342]]){if(this.textures.exists(key))continue;const canvas=this.textures.createCanvas(key,64,80),width=Math.round(w*76/h);canvas.context.imageSmoothingEnabled=false;canvas.context.drawImage(image,x,y,w,h,Math.round((64-width)/2),4,width,76);canvas.refresh();}
   this.add.text(480,260,'ÚNIK ZE STŘECHY',{font:'bold 32px monospace',color:'#a4e963'}).setOrigin(.5);start.disabled=false;start.hidden=false;start.textContent='Přehrát animaci';this.events.once('shutdown',()=>this.audioCtx?.close().catch(()=>{}));
  }
  hideOverlay(){start.hidden=true;status.textContent='Přehrávám náhled. Enter, mezerník nebo PŘESKOČIT otevře konec náhledu.';}
  showOverlay(){this.add.image(480,270,'escape-campus').setDisplaySize(960,540);this.add.rectangle(480,260,650,110,0x071b24,.92);this.add.text(480,240,'NÁHLED DOKONČEN',{font:'bold 28px monospace',color:'#a4e963'}).setOrigin(.5);this.add.text(480,285,'Ve hře nyní zadáš jméno do HIGH SCORES.',{font:'18px monospace',color:'#f5e9c9'}).setOrigin(.5);}
  tone(freq,duration=.1,wave='sine'){if(this.isMuted)return;try{this.audioCtx||=new (window.AudioContext||window.webkitAudioContext)();this.audioCtx.resume().catch(()=>{});const oscillator=this.audioCtx.createOscillator(),gain=this.audioCtx.createGain();oscillator.type=wave;oscillator.frequency.value=freq;gain.gain.setValueAtTime(.035,this.audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,this.audioCtx.currentTime+duration);oscillator.connect(gain).connect(this.audioCtx.destination);oscillator.start();oscillator.stop(this.audioCtx.currentTime+duration);}catch{}}
 }
 window.ITHeroScores={open(){start.hidden=false;start.textContent='Přehrát znovu';status.textContent='Náhled dokončen. Žádný herní výsledek nebyl uložen.';}};
 start.addEventListener('click',()=>{if(!source||ITHeroEnding.isRunning())return;source.children.removeAll(true);ITHeroEnding.play(source,{score:12500,elapsed:'00:42',bonus:200});});
 sound.addEventListener('click',()=>{muted=!muted;if(source)source.isMuted=muted;sound.textContent=muted?'Zapnout zvuk':'Vypnout zvuk';sound.setAttribute('aria-pressed',String(!muted));});
 new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,pixelArt:true,roundPixels:true,backgroundColor:'#071b24',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Preview,ITHeroEnding.Scene]});
})();
