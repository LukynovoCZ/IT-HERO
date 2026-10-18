/* Standalone inspection scene: uses the same normalized textures as the game. */
(() => {
  'use strict';
  class CharacterPreview extends Phaser.Scene {
    constructor() { super('CharacterPreview'); }
    preload() {
      ITHeroEnemyCatalog.preload(this);
      ITHeroColleague.preload(this);
      ITHeroOldBadger.preload(this);
      this.load.image('preview-hero-source', 'assets/characters.png');
      this.load.image('preview-support-source', 'assets/support.png');
    }
    create() {
      this.floor = 0; this.gameState = 'playing';
      this.player = {x: -9999, body: {bottom: 0}};
      this.tone = () => {}; this.takeDamage = () => {};
      ITHeroTrioAttacks.textures(this);
      ITHeroSAP.textures(this);
      ITHeroDBPM.textures(this);
      this.paused = false;
      this.animationTime = 0;
      const graphics = this.add.graphics();
      graphics.fillStyle(0x152f2b).fillRect(0, 0, 960, 2060);
      for (const baseline of [260, 660, 1060, 1460, 1860]) {
        graphics.lineStyle(1, 0x24453e);
        for (let y = baseline - 240; y < baseline; y += 20) graphics.lineBetween(0, y, 960, y);
        graphics.fillStyle(0x78867b).fillRect(0, baseline, 960, 24);
        graphics.lineStyle(2, 0xa7eb6a).lineBetween(0, baseline, 960, baseline);
      }
      // Match makeTextures() in game.js: identical source crops, scale and anchors.
      const legacy = [
        {name:'AJŤÁK',body:{width:28,height:72,x:18,y:8},poses:{idle:[40,16,245,342],walk:[380,16,265,342]}},
        {name:'SEKRETÁŘKA',body:{width:24,height:72,x:20,y:8},contactPose:'contact',poses:{idle:[65,365,210,358],contact:[385,362,267,361]}},
        {name:'ODBORÁŘ',contactPose:'contact',poses:{idle:[730,365,285,358],contact:[1090,365,302,358]}},
        {name:'MANAŽER',contactPose:'contact',poses:{idle:[35,725,279,337],contact:[375,728,298,336],walk:[733,728,292,336]}},
        {name:'STARÝ AJŤÁK',support:true,attackPose:'offer',contactPose:'offer',poses:{idle:[85,12,370,482],walk:[580,120,430,374],offer:[1120,12,380,482]}},
        {name:'SPECIALISTKA',support:true,body:{width:38,height:72,x:49,y:8},attackPose:'spray',contactPose:'flag',poses:{idle:[45,502,420,495],flag:[490,533,585,464],spray:[1070,533,465,464]}}
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
      for (const profile of Object.values(ITHeroEnemyCatalog.profiles)) {
        this.entries.push({ ...profile, height: profile.previewHeight || profile.renderHeight,
          frames: ITHeroEnemyCatalog.createTextures(this, profile) });
      }
      const dbpmEntry=this.entries.find(e=>e.id==='dbpm');this.entries=this.entries.filter(e=>e.id!=='dbpm');
      this.entries.push({name:'IT KOLEGA',height:80,frames:ITHeroColleague.createTextures(this),frameWidth:96,frameHeight:88,body:null,attackPose:'offer_coffee',contactPose:'offer_candy',offerKeys:['colleague-coffee','colleague-candy']});
      this.entries.push({name:'SENIOR MASTER',height:76,frames:ITHeroOldBadger.createTextures(this),frameWidth:80,frameHeight:80,body:{width:36,height:70,x:22,y:10},attackPose:'block',contactPose:'stomp'});
      this.entries.push(dbpmEntry);
      this.entries.forEach((entry, i) => {
        const x = 160 + (i % 3) * 320;
        entry.baseline = 260 + Math.floor(i / 3) * 400;
        entry.sprite = this.add.sprite(x, entry.baseline, entry.frames.idle).setOrigin(0.5, 1);
        if (entry.id) {
          Object.assign(entry.sprite, {profile: entry, floorIndex: 0, facingDirection: 1, body: {bottom: entry.baseline}});
          entry.projectiles.forEach((weapon, index) => this.add.image(x - 22 + index * 44, entry.baseline + 115, weapon.key));
        }
        entry.offerKeys?.forEach((key,index)=>this.add.image(x-22+index*44,entry.baseline+115,key));
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
        if (pose === 'walk' && Math.floor(this.animationTime / 180) % 2 === 0) frame = entry.id === 'dbpm' ? 'walk_alt' : 'idle';
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
    type: Phaser.AUTO, parent: 'game', width: 960, height: 2060,
    pixelArt: true, roundPixels: true, antialias: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [CharacterPreview]
  });
})();
