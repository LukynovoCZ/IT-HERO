/* Standalone inspection scene: uses the same normalized textures as the game. */
(() => {
  'use strict';
  class CharacterPreview extends Phaser.Scene {
    constructor() { super('CharacterPreview'); }
    preload() {
      ITHeroEnemyCatalog.preload(this);
      ITHeroColleague.preload(this);
      ITHeroOldBadger.preload(this);
      ITHeroGenZ.preload(this);
      this.load.image('preview-hero-source', 'assets/characters.png');
      this.load.image('preview-support-source', 'assets/support.png');
    }
    create() {
      this.floor = 0; this.gameState = 'playing';
      this.player = {x: -9999, body: {bottom: 0}};
      this.tone = () => {}; this.takeDamage = () => {};
      ITHeroItems.create(this);
      ITHeroTrioAttacks.textures(this);
      ITHeroSAP.textures(this);
      ITHeroDBPM.textures(this);
      this.paused = false;
      this.animationTime = 0;
      const graphics = this.add.graphics();
      graphics.fillStyle(0x152f2b).fillRect(0, 0, 960, 2460);
      for (const baseline of [260, 660, 1060, 1460, 1860, 2260]) {
        graphics.lineStyle(1, 0x24453e);
        for (let y = baseline - 240; y < baseline; y += 20) graphics.lineBetween(0, y, 960, y);
        graphics.fillStyle(0x78867b).fillRect(0, baseline, 960, 24);
        graphics.lineStyle(2, 0xa7eb6a).lineBetween(0, baseline, 960, baseline);
      }
      // Match makeTextures() in game.js: identical source crops, scale and anchors.
      const legacy = [
        {name:'AJŤÁK',itemKeys:['floppy','cd'],body:{width:28,height:72,x:18,y:8},poses:{idle:[40,16,245,342],walk:[380,16,265,342]}},
        {name:'SEKRETÁŘKA',itemKeys:['folder','mug'],body:{width:24,height:72,x:20,y:8},contactPose:'contact',poses:{idle:[65,365,210,358],contact:[385,362,267,361]}},
        {name:'ODBORÁŘ',itemKeys:['hammer','gear'],contactPose:'contact',poses:{idle:[730,365,285,358],contact:[1090,365,302,358]}},
        {name:'MANAŽER',itemKeys:['gold-card'],contactPose:'contact',poses:{idle:[35,725,279,337],contact:[375,728,298,336],walk:[733,728,292,336]}},
        {name:'STARÝ AJŤÁK',itemKeys:['beer','hotdog'],support:true,attackPose:'offer',contactPose:'offer',poses:{idle:[85,12,370,482],walk:[580,120,430,374],offer:[1120,12,380,482]}},
        {name:'SPECIALISTKA',itemKeys:['unicorn','rainbow-spray','rainbow-flag'],support:true,body:{width:38,height:72,x:49,y:8},attackPose:'spray',contactPose:'flag',poses:{idle:[45,502,420,495],flag:[490,533,585,464],spray:[1070,533,465,464]}}
      ];
      this.entries = legacy.map((entry, index) => {
        const frames = {}, frameWidth = entry.support ? 136 : 64;
        for (const [pose, [x,y,w,h]] of Object.entries(entry.poses)) {
          const key = `preview-legacy-${index}-${pose}`;
          const canvas = this.textures.createCanvas(key, frameWidth, 80);
          canvas.context.imageSmoothingEnabled = false;
          const height = entry.name === 'STARÝ AJŤÁK' && pose === 'walk' ? 54 : 76;
          const width = Math.round(w * height / h);
          const left = pose === 'flag' ? 39 : pose === 'spray' ? 46 : Math.round((frameWidth - width) / 2);
          canvas.context.drawImage(this.textures.get(entry.support ? 'preview-support-source' : 'preview-hero-source').getSourceImage(), x,y,w,h,left,80-height,width,height);
          canvas.refresh(); frames[pose] = key;
        }
        return {...entry,frames,height:76,frameWidth,frameHeight:80,
          body:entry.body || (entry.support ? null : {width:38,height:72,x:13,y:8})};
      });
      this.entries.forEach((entry,i)=>{window.ITHeroMotion.complete(this,entry.frames,{prefix:`preview-legacy-${i}`});entry.attackPose ||= 'attack';});
      const secretary=this.entries[1];this.entries.splice(1,1,...window.ITHeroMotion.secretaries(this,secretary.frames).map(v=>({...secretary,name:`SEKRETÁŘKA – ${v.name}`,frames:v.frames,attackPose:'attack',contactPose:'contact'})));
      for (const profile of Object.values(ITHeroEnemyCatalog.profiles)) {
        this.entries.push({ ...profile, height: profile.previewHeight || profile.renderHeight,
          frames: ITHeroEnemyCatalog.createTextures(this, profile) });
      }
      const dbpmEntry=this.entries.find(e=>e.id==='dbpm');this.entries=this.entries.filter(e=>e.id!=='dbpm');
      this.entries.push({name:'IT KOLEGA',height:80,frames:ITHeroColleague.createTextures(this),frameWidth:96,frameHeight:88,body:null,attackPose:'offer_coffee',contactPose:'offer_candy',offerKeys:['colleague-coffee','colleague-candy']});
      this.entries.push({name:'SENIOR MASTER',itemKeys:['coffee','hotdog'],height:76,frames:ITHeroOldBadger.createTextures(this),frameWidth:80,frameHeight:80,body:{width:36,height:70,x:22,y:10},attackPose:'block',contactPose:'stomp'});
      this.entries.push(dbpmEntry);
      const genZ=ITHeroGenZ.textures(this);
      for(const variant of ITHeroGenZ.variants)this.entries.push({name:variant==='girl'?'GEN Z – HOLKA':'GEN Z – KLUČINA',height:76,frames:genZ[variant],frameWidth:64,frameHeight:80,body:{width:26,height:64,x:19,y:16},itemKeys:['gen-z-phone'],contactPose:'phone-scroll',attackPose:'shrug'});
      this.entries.forEach((entry, i) => {
        const x = 160 + (i % 3) * 320;
        entry.baseline = 260 + Math.floor(i / 3) * 400;
        entry.sprite = this.add.sprite(x, entry.baseline, entry.frames.idle).setOrigin(0.5, 1);
        if (entry.id) {
          Object.assign(entry.sprite, {profile: entry, floorIndex: 0, facingDirection: 1, body: {bottom: entry.baseline}});

        }
        const keys=entry.itemKeys||entry.offerKeys||entry.projectiles?.map(w=>w.key)||[];
        const labels={'gold-card':'Zlatá karta',floppy:'Disketa',cd:'CD',folder:'Šanon',mug:'Hrnek',hammer:'Kladivo',gear:'Kolečko',beer:'Pivo',hotdog:'Párek',coffee:'Káva',unicorn:'Jednorožec','rainbow-spray':'Sprej','rainbow-flag':'Vlajka','red-heel':'Střevíc','red-tennis-ball':'Tenisák','handcuffs':'Želízka',fireball:'Fireball','golf-ball':'Golfový míček','golf-club':'Golfová hůl',calculator:'Kalkulačka','colleague-coffee':'Káva','colleague-candy':'Sisinka','sap-helmet':'Helma','sap-pen':'Propiska','dbpm-laptop':'Notebook','dbpm-baguette':'Bageta','gen-z-phone':'Mobil'};
        const role=entry.name.startsWith('GEN Z')?'SCROLLUJE':entry.name==='SENIOR MASTER'?'JÍ A PIJE':entry.offerKeys||entry.name==='STARÝ AJŤÁK'?'NABÍZÍ':entry.name==='AJŤÁK'?'STŘELBA':'ÚTOKY';
        this.add.text(x,entry.baseline+96,role,{font:'9px monospace',color:'#dfd4a0'}).setOrigin(.5,1);
        entry.itemIcons=keys.map((key,index)=>{
          const ix=x+(index-(keys.length-1)/2)*74;
          this.add.rectangle(ix,entry.baseline+122,60,44,0x0a211f).setStrokeStyle(1,0x709a85);
          const icon=this.add.image(ix,entry.baseline+122,key);
          const scale=Math.min(2,48/icon.width,34/icon.height);icon.setScale(scale);
          this.add.text(ix,entry.baseline+150,labels[key]||key.replaceAll('-',' '),{font:'10px monospace',color:'#edf2d5',align:'center',wordWrap:{width:70}}).setOrigin(.5,0);
          return icon;
        });
        this.add.text(x, entry.baseline + 45, entry.name, { fontFamily: 'monospace', fontSize: '17px', color: '#b0ee78' }).setOrigin(0.5);
        this.add.text(x, entry.baseline + 75, `${entry.height} px`, { fontFamily: 'monospace', fontSize: '16px', color: '#e6eee8' }).setOrigin(0.5);
      });
      this.bodyGraphics = this.add.graphics();
      this.controls = Object.fromEntries(['pose', 'zoom', 'pause', 'bodies'].map(id => [id, document.getElementById(id)]));
      this.controls.pause.onclick = () => {
        this.paused = !this.paused;
        this.controls.pause.textContent = this.paused ? 'Pokračovat v animaci' : 'Pozastavit animaci';
        this.controls.pause.setAttribute('aria-pressed', String(this.paused));
      };
      this.refresh();
    }
    refresh() {
      const zoom = Number(this.controls.zoom.value);
      const pose = this.controls.pose.value;
      this.bodyGraphics.clear().lineStyle(1, 0xffd269);
      for (const entry of this.entries) {
        let frame = pose === 'contact' ? entry.contactPose : pose === 'attack' ? entry.attackPose : pose;
        if (pose === 'walk' && Math.floor(this.animationTime / 180) % 2 === 0) frame = entry.frames.walk_alt ? 'walk_alt' : 'idle';
        if(pose==='attack'&&entry.id==='design_manager')frame=Math.floor(this.animationTime/180)%2?'golf':'golf_follow';
        entry.sprite.setTexture(entry.frames[frame] || entry.frames.idle).setScale(zoom);
        if(entry.id==='dbpm'){entry.sprite.clearTint();if(pose==='hit'&&Math.floor(this.animationTime/90)%2)entry.sprite.setTintFill(0xffffff);}
        if (entry.id && !['sap','dbpm'].includes(entry.behavior)) {
          if (pose === 'contact') {
            // Effect coordinates use game pixels; scale the graphics with the sprite.
            if (!entry.sprite.contactEffect) { ITHeroTrioAttacks.contact(this, entry.sprite); entry.sprite.effectUntil = this.animationTime + 650; }
            ITHeroTrioAttacks.update(this, entry.sprite, this.animationTime);
            entry.sprite.contactEffect?.setScale(zoom);
          } else ITHeroTrioAttacks.clear(entry.sprite);
        }
        if (this.controls.bodies.checked && entry.body) {
          const body = entry.body;
          this.bodyGraphics.strokeRect(entry.sprite.x + (body.x - entry.frameWidth / 2) * zoom,
            entry.baseline + (body.y - entry.frameHeight) * zoom, body.width * zoom, body.height * zoom);
        }
      }
    }
    update(time, delta) {
      if (!this.controls) return;
      if (!this.paused) this.animationTime += delta;
      this.refresh();
    }
  }
  new Phaser.Game({
    type: Phaser.AUTO, parent: 'game', width: 960, height: 2460,
    pixelArt: true, roundPixels: true, antialias: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [CharacterPreview]
  });
})();
